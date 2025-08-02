import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Unit, UnitType } from './unit.entity';
import { Ingredient } from '../ingredients/ingredient.entity';
import { EntityManager, In, IsNull } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';

import { Account } from '../accounts/account.entity';

import assert = require('assert');

import {
  PaginatedRequest,
  PaginatedResponse,
} from '../pagination/DTO/pagination.dto';
import { onlyDefined } from '../../../util/Util';
import { TransactionManagerService } from '../transaction-manager/transaction-manager.service';
import { PaginatorFactoryService } from '../pagination/paginator/paginator-factory.service';
import _ = require('lodash');
import { UnitAlias } from './unit-alias.entity';
import { UnitConversion } from './unit-conversion.entity';

import graphlib = require('graphlib');
import { CreateUnitRequest } from './DTO/create.unit.dto';
import { UpdateUnitRequest } from './DTO/update.unit.dto';
import { RecipeIngredient } from '../recipes/recipe-ingredient.entity';
import { PantryIngredient } from '../ingredients/pantry-ingredient.entity';

export interface IngredientAmount {
  ingredient?: Ingredient;
  amount: number;
}

export interface UnitAmount {
  ingredient?: Ingredient;
  unit: Unit;
  amount: number;
}

export interface ToUnit {
  unit: Unit;
}

@Injectable()
export class UnitsService {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly transactionManagerService: TransactionManagerService,
    private readonly paginatorFactoryService: PaginatorFactoryService,
  ) {}

  async create(
    options: {
      ownerId: Unit['ownerId'];
      name: Unit['name'];
      symbol: Unit['symbol'];
      baseAmount?: CreateUnitRequest['amount'];
      baseUnit?: CreateUnitRequest['unit'];
      scopedId?: Unit['scopedId'];
    },
    manager: EntityManager = this.entityManager,
  ): Promise<Unit> {
    const {
      ownerId,
      name,
      symbol,
      baseAmount,
      baseUnit: baseUnitSymbol,
      scopedId,
    } = options;

    const unit = new Unit({ ownerId, name, symbol });
    const aliases = [new UnitAlias({ unit, name })];
    if (name !== symbol) aliases.push(new UnitAlias({ unit, name: symbol }));

    return this.transactionManagerService.ensureTransactional(
      manager,
      async (manager) => {
        const conflictUnit = await this.findByAlias({ alias: symbol, ownerId });
        if (conflictUnit)
          throw new ConflictException(
            `Symbol is already an alias for another unit (${conflictUnit.name})`,
          );

        unit.type = UnitType.PURE;
        if (baseUnitSymbol) {
          const baseUnit = await this.findOne({
            symbol: baseUnitSymbol,
            ownerId,
          });
          unit.magnitude = Math.round(baseAmount * baseUnit.magnitude);
          unit.definitionUnit = baseUnit;
          unit.type = baseUnit.type;
        }

        if (!scopedId) {
          const { maxId } = await manager
            .getRepository(Unit)
            .createQueryBuilder()
            .select('MAX("scopedId") "maxId"')
            .withDeleted()
            .where('"ownerId" = :ownerId', { ownerId })
            .getRawOne();
          unit.scopedId = (maxId || 0) + 1;
        }

        const savedUnit = await manager.save(unit);
        await manager.save(aliases);
        return savedUnit;
      },
      'SERIALIZABLE',
    );
  }

  async findOne(
    options: {
      ownerId: Unit['ownerId'];
      id?: Unit['scopedId'];
      symbol?: Unit['symbol'];
    },
    manager: EntityManager = this.entityManager,
  ): Promise<Unit> {
    const { ownerId, id, symbol } = options;
    return await manager.findOne(Unit, {
      where: (qb) => {
        qb.where('("ownerId" = :ownerId OR "ownerId" IS NULL)', { ownerId });
        if (id) qb.andWhere('"scopedId" = :id', { id });
        if (symbol) qb.andWhere('"symbol" = :symbol', { symbol });
      },
    });
  }

  async find(
    options: {
      ownerId?: Unit['ownerId'];
    } & PaginatedRequest,
    manager: EntityManager = this.entityManager,
  ): Promise<PaginatedResponse & { units: Unit[] }> {
    const { page, pageSize } = options;
    const { ownerId } = options;

    const paginator = this.paginatorFactoryService.create<Unit>(page, pageSize);

    const queryOptions = {
      where: (qb) => {
        qb.where('"ownerId" IS NULL');
        if (ownerId) qb.orWhere('("ownerId" = :ownerId)', { ownerId });
      },
    };

    const [unitIds, numPages] = await paginator(async (skipTake) => {
      return await manager.getRepository(Unit).findAndCount({
        ...skipTake,
        ...queryOptions,
        select: ['id'],
        order: { name: 'ASC' },
      });
    });

    const units =
      unitIds.length === 0
        ? []
        : await manager.getRepository(Unit).find({
            where: { id: In(unitIds.map(({ id }) => id)) },
            relations: ['definitionUnit'],
            order: { name: 'ASC' },
          });
    return { units, numPages };
  }

  async update(
    options: {
      id: Unit['id'];
      ownerId?: Unit['ownerId'];
    },
    values: UpdateUnitRequest,
    manager: EntityManager = this.entityManager,
  ): Promise<void> {
    const { id, ownerId } = options;

    const { name, symbol, amount: baseAmount, unit: baseUnitSymbol } = values;
    const unitValues: Partial<Unit> = { name, symbol };

    return await this.transactionManagerService.ensureTransactional(
      manager,
      async (manager) => {
        const unit = await manager.findOne(
          Unit,
          onlyDefined({ scopedId: +id, ownerId }),
        );

        const conflictUnit = await this.findByAlias({ alias: symbol, ownerId });
        if (conflictUnit.id !== unit.id)
          throw new ConflictException(
            `Symbol is already an alias for another unit (${conflictUnit.name})`,
          );

        if (baseUnitSymbol) {
          const baseUnit = await this.findOne({
            symbol: baseUnitSymbol,
            ownerId,
          });
          if (!baseUnit)
            throw new BadRequestException(`Unit "${baseUnitSymbol}" not found`);
          unitValues.magnitude = Math.round(baseAmount * baseUnit.magnitude);
          unitValues.definitionUnit = baseUnit;
          unitValues.type = baseUnit.type;
        } else {
          unitValues.magnitude = null;
          unitValues.definitionUnit = null;
          unitValues.type = UnitType.PURE;
        }

        if (!unit) throw new NotFoundException();

        Object.assign(unit, unitValues);
        await manager.save(unit);

        const aliases = [new UnitAlias({ unit, name })];
        if (name !== symbol)
          aliases.push(new UnitAlias({ unit, name: symbol }));

        await Promise.all(aliases.map(async (alias) => manager.save(alias)));
      },
    );
  }

  async delete(
    options: {
      id: Unit['id'];
      ownerId?: Unit['ownerId'];
    },
    manager: EntityManager = this.entityManager,
  ): Promise<void> {
    const { id, ownerId } = options;
    const { affected } = await manager.softDelete(
      Unit,
      onlyDefined({ scopedId: id, ownerId, deletedAt: null }),
    );

    if (affected === 0) throw new NotFoundException();
  }

  async findOrCreateByAlias(
    options: { ownerId: Account['id']; alias: string },
    manager: EntityManager = this.entityManager,
  ): Promise<Unit> {
    const { ownerId, alias } = options;
    const unit = await this.findByAlias(options, manager);

    return (
      unit ||
      (await this.create({ ownerId, name: alias, symbol: alias }, manager))
    );
  }

  async findByAlias(
    options: { ownerId: Account['id']; alias: string },
    manager: EntityManager = this.entityManager,
  ): Promise<Unit> {
    const { ownerId, alias } = options;
    const trimmedAlias = alias.replace('.', '').trim();

    const unit = await manager.findOne(Unit, {
      where: (qb) => {
        qb.andWhere('LOWER(alias.name) = LOWER(:alias)', {
          alias: trimmedAlias,
        });
        qb.andWhere('("ownerId" = :ownerId OR "ownerId" IS NULL)', { ownerId });
      },
      join: {
        alias: 'unit',
        innerJoin: {
          alias: 'unit.aliases',
        },
      },
    });

    return unit;
  }

  convertSameType(amount: number, from: Unit, to: Unit): number {
    assert(from.type === to.type);
    if (from.id === to.id) return amount;
    return (amount * from.magnitude) / to.magnitude;
  }

  async convertM(
    {
      amount,
      ingredient,
      fromUnit,
      toUnit,
    }: {
      amount: number;
      ingredient: Ingredient;
      fromUnit: Unit;
      toUnit: Unit;
    },
    allConversionsWithUnits: UnitConversion[],
  ) {
    if (fromUnit === null || toUnit === null) return null;

    if (
      fromUnit.type === toUnit.type &&
      fromUnit.magnitude !== null &&
      toUnit.magnitude !== null
    )
      return this.convertSameType(amount, fromUnit, toUnit);

    const conversions = allConversionsWithUnits.filter(
      ({ ingredientId }) => ingredientId === ingredient.id,
    );

    // Construct a graph of reachable units from any unit, excluding the current conversion
    const g = new graphlib.Graph();

    g.setNode('  __WEIGHT__  ');
    g.setNode('  __VOLUME__  ');
    g.setNode('  __PURE__  ');

    conversions.forEach(({ id, unitA, unitB }) => {
      const nodeA = this.unitToNode(unitA);
      const nodeB = this.unitToNode(unitB);
      g.setEdge(nodeA, nodeB, id);
      g.setEdge(nodeB, nodeA, id);
    });

    const fromNode = this.unitToNode(fromUnit);
    const connections = graphlib.alg.dijkstra(g, fromNode);
    const conversionIdPath = [];

    let currentNode = this.unitToNode(toUnit);
    while (currentNode && currentNode !== fromNode) {
      const nextNode = connections[currentNode]?.predecessor;

      if (!nextNode)
        // No conversion defined
        return undefined;

      conversionIdPath.unshift(g.edge(currentNode, nextNode));
      currentNode = nextNode;
    }

    const {
      amount: amountConvertedToFinalType,
      unit: finalTypeUnit,
    } = conversionIdPath.reduce(
      ({ amount, unit }, conversionId) => {
        const conversion = conversions.find(({ id }) => id === conversionId);
        const { unitA, unitB, amountA, amountB } = conversion;

        const isReversed =
          unitB.id === unit.id ||
          (unitB.type === unit.type && unitB.magnitude !== null);
        const [fromAmount, toAmount] = isReversed
          ? [amountB, amountA]
          : [amountA, amountB];
        const [fromUnit, toUnit] = isReversed ? [unitB, unitA] : [unitA, unitB];

        return {
          amount:
            (this.convertSameType(amount, unit, fromUnit) / +fromAmount) *
            +toAmount,
          unit: toUnit,
        };
      },
      { amount, unit: fromUnit },
    );

    return this.convertSameType(
      amountConvertedToFinalType,
      finalTypeUnit,
      toUnit,
    );
  }

  async convert(
    { amount, ingredient }: IngredientAmount,
    fromUnit: Unit,
    toUnit: Unit,
    manager: EntityManager = this.entityManager,
  ): Promise<number> {
    if (!fromUnit || !toUnit) return undefined;

    const conversions = await manager.find(UnitConversion, {
      where: {
        ingredientId: ingredient.id,
      },
      relations: ['unitA', 'unitB'],
    });

    return this.convertM({ amount, ingredient, fromUnit, toUnit }, conversions);
  }

  private unitToNode(unit: Unit) {
    if (unit.type && unit.magnitude !== null)
      return `  __${UnitType[unit.type]}__  `;
    return unit.symbol;
  }

  public async getUsage({
    id,
    ownerId,
  }: {
    id: Unit['scopedId'];
    ownerId: Unit['ownerId'];
  }) {
    const unit = await this.findOne({ id, ownerId });
    const unitId = unit.id;

    const recipes = await this.entityManager
      .createQueryBuilder()
      .addSelect('"prepIngredient"."scopedId"', 'prepId')
      .addSelect('"prepIngredient"."name"', 'prepName')
      .addSelect('"menuItem"."scopedId"', 'itemId')
      .addSelect('"menuItem"."name"', 'itemName')
      .from(RecipeIngredient, 'recipeIngredient')
      .leftJoin('recipeIngredient.recipe', 'recipe')
      .leftJoin('recipe.prepIngredient', 'prepIngredient')
      .leftJoin('recipe.menuItem', 'menuItem')
      .where({ unit: unit })
      .execute();
    const ingredients = await this.entityManager
      .createQueryBuilder()
      .select('ingredient."scopedId"', 'id')
      .addSelect(['ingredient."type"', 'ingredient."name"'])
      .from(Ingredient, 'ingredient')
      .leftJoin('ingredient.packs', 'packs')
      .leftJoin('ingredient.recipe', 'recipe')
      .where((qb) => {
        qb.orWhere('"packs"."itemUnitId" = :unitId', { unitId });
        qb.orWhere('"recipe"."batchUnitId" = :unitId', { unitId });
      })
      .execute();
    return {
      recipes: recipes.map((recipe) => ({
        type: recipe.prepId ? 'prep' : 'items',
        id: recipe.prepId ?? recipe.itemId,
        name: recipe.prepName ?? recipe.itemName,
      })),
      ingredients: ingredients.map((ingredient) => ({
        type: ingredient.type === PantryIngredient.name ? 'pantry' : 'prep',
        id: ingredient.id,
        name: ingredient.name,
      })),
    };
  }
}
