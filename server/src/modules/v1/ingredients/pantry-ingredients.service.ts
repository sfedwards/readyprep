import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, In, Like, Not } from 'typeorm';
import { PantryIngredient } from './pantry-ingredient.entity';
import {
  PaginatedRequest,
  PaginatedResponse,
} from '../pagination/DTO/pagination.dto';
import { PaginatorFactoryService } from '../pagination/paginator/paginator-factory.service';

import { onlyDefined } from '../../../util/Util';
import { Account } from '../accounts/account.entity';

import { ParserService } from '../import/parser.service';
import { TransactionManagerService } from '../transaction-manager/transaction-manager.service';
import { UnitsService } from '../units/units.service';
import { Unit } from '../units/unit.entity';
import {
  PackDto,
  UpdatePantryIngredientRequest,
} from './DTO/update.pantry-ingredient.dto';
import { V1IngredientsService } from './ingredients.service';
import { Conversion } from './DTO/conversion.dto';

import _ = require('lodash');
import { Ingredient } from './ingredient.entity';
import PostgresErrorCode from '../../../util/PostgresErrors';
import { Pack } from './pack.entity';
import { isNil, omitBy } from 'lodash';

@Injectable()
export class PantryIngredientsService {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly transactionManagerService: TransactionManagerService,
    private readonly paginatorFactoryService: PaginatorFactoryService,
    private readonly csvParserService: ParserService,
    private readonly unitsService: UnitsService,
    private readonly ingredientsService: V1IngredientsService,
  ) {}

  async create(
    ownerId: PantryIngredient['ownerId'],
    values: {
      name: PantryIngredient['name'];
      yieldPercent?: PantryIngredient['yieldPercent'];
      orderFrequency?: PantryIngredient['orderFrequency'];
      scopedId?: number;
      conversions?: Conversion[];
      packs?: PackDto[];
      unit?: Unit['symbol'];
    },
    manager: EntityManager = this.entityManager,
  ): Promise<PantryIngredient> {
    const {
      name,
      yieldPercent,
      orderFrequency,
      packs,
      scopedId,
      conversions,
      unit,
    } = values;

    const pantryIngredient = new PantryIngredient({
      name,
      ownerId,
      yieldPercent,
      orderFrequency,
      scopedId,
    });

    if (unit) {
      pantryIngredient.standardUOM = await this.unitsService.findByAlias(
        {
          ownerId,
          alias: unit,
        },
        manager,
      );
    }

    try {
      return await this.transactionManagerService.ensureTransactional(
        manager,
        async (manager) => {
          if (!scopedId) {
            const { maxId } = await manager
              .getRepository(Ingredient)
              .createQueryBuilder()
              .select('MAX("scopedId") "maxId"')
              .withDeleted()
              .where('"ownerId" = :ownerId', { ownerId })
              .getRawOne();
            pantryIngredient.scopedId = (maxId || 0) + 1;
          }

          // Saving PantryIngredient twice because of https://github.com/typeorm/typeorm/issues/4090
          await manager.save(pantryIngredient);

          const pantryIngredientId = pantryIngredient.id;

          if (
            packs.length &&
            packs.filter(({ isDefault }) => isDefault).length !== 1
          )
            throw new BadRequestException('Must have exactly one primary pack');

          await Promise.all(
            packs.map(async (pack) => {
              const {
                id,
                catalogNumber,
                vendorId,
                price: packPrice,
                numItems: packSize,
                amountPerItem: packAmountPerItem,
                unit: packItemUnitSymbol,
              } = pack;

              const packItemUnit =
                packItemUnitSymbol &&
                (await this.unitsService.findByAlias({
                  ownerId,
                  alias: packItemUnitSymbol,
                }));

              if (packItemUnitSymbol && !packItemUnit)
                throw new BadRequestException(
                  `Unit "${packItemUnitSymbol}" not found`,
                );

              const packValues = {
                id,
                pantryIngredientId,
                vendorId,
                catalogNumber,
                price: packPrice == null ? null : packPrice.toString(),
                numItems: packSize == null ? null : packSize.toString(),
                amountPerItem:
                  packAmountPerItem == null
                    ? null
                    : packAmountPerItem.toString(),
                itemUnit: packItemUnit,
              };

              const {
                raw: [{ id: packId }],
              } = await manager
                .createQueryBuilder()
                .insert()
                .into(Pack)
                .values(omitBy(packValues, isNil))
                .returning(['id'])
                .execute();

              if (pack.isDefault) {
                await manager.update(PantryIngredient, pantryIngredientId, {
                  defaultPackId: packId,
                });
              }
            }),
          );

          if (conversions?.length > 0)
            await this.ingredientsService.setConversions(
              { ingredientId: pantryIngredient.id, ownerId },
              conversions,
              manager,
            );

          return pantryIngredient;
        },
        'SERIALIZABLE',
      );
    } catch (err) {
      if (err.code == PostgresErrorCode.UNIQUE_VIOLATION) {
        return await this.transactionManagerService.ensureTransactional(
          manager,
          async (manager) => {
            const items = await manager.find(PantryIngredient, {
              select: ['name'],
              where: {
                ownerId,
                name: Like(`${name.replace(/[_%]/g, '\\$&')}%`),
              },
            });
            let index: number;
            for (index = 2; ; index++) {
              if (items.every((item) => item.name !== `${name} - ${index}`))
                break;
            }
            return await this.create(
              ownerId,
              { ...values, name: `${name} - ${index}` },
              manager,
            );
          },
          'SERIALIZABLE',
        );
      }

      throw err;
    }
  }

  async find(
    options: {
      ownerId?: PantryIngredient['ownerId'];
      search?: string;
    } & PaginatedRequest,
    manager: EntityManager = this.entityManager,
  ): Promise<
    PaginatedResponse & {
      pantryIngredients: PantryIngredient[];
      parLevels: number[];
    }
  > {
    const { page, pageSize } = options;

    const paginator = this.paginatorFactoryService.create<PantryIngredient>(
      page,
      pageSize,
    );

    const { ownerId, search } = options;
    const queryOptions = {
      where: (qb) => {
        if (ownerId) qb.andWhere('"ownerId" = :ownerId', { ownerId });
        if (search)
          qb.andWhere(
            '("name" %> :search OR position(LOWER(:search) in LOWER("name")) = 1)',
            { search },
          );
      },
    };

    const [pantryIngredientIds, numPages] = await paginator(
      async (skipTake) => {
        return await manager.getRepository(PantryIngredient).findAndCount({
          ...skipTake,
          ...queryOptions,
          select: ['id'],
          order: { name: 'ASC' },
        });
      },
    );

    const pantryIngredients =
      pantryIngredientIds.length === 0
        ? []
        : await manager.getRepository(PantryIngredient).find({
            where: { id: In(pantryIngredientIds.map(({ id }) => id)) },
            relations: ['defaultPack', 'defaultPack.itemUnit'],
            order: { name: 'ASC' },
          });

    const parLevels = await Promise.all(
      pantryIngredients.map(async (ingredient) => {
        if (!ingredient.packs?.[0]?.itemUnit) return null;
        return (await this.getParLevelAndUsage(ingredient, manager))[0];
      }),
    );

    return { pantryIngredients, parLevels, numPages };
  }

  async findOne(
    options: {
      id: PantryIngredient['id'];
      ownerId?: PantryIngredient['ownerId'];
    },
    manager: EntityManager = this.entityManager,
  ): Promise<PantryIngredient> {
    const { id, ownerId } = options;

    const pantryIngredient = await manager
      .createQueryBuilder()
      .select('ingredient')
      .from(PantryIngredient, 'ingredient')
      .where(onlyDefined({ scopedId: id, ownerId }))
      .leftJoinAndSelect('ingredient.defaultPack', 'defaultPack')
      .leftJoinAndSelect('defaultPack.itemUnit', 'defaultPackUnit')
      .leftJoinAndSelect(
        'ingredient.packs',
        'packs',
        'packs."deletedAt" IS NULL',
      )
      .leftJoinAndSelect('packs.itemUnit', 'unit')
      .leftJoinAndSelect('packs.vendor', 'vendor')
      .leftJoinAndSelect('ingredient.unitConversions', 'conversions')
      .leftJoinAndSelect('conversions.unitA', 'unitA')
      .leftJoinAndSelect('conversions.unitB', 'unitB')
      .leftJoinAndSelect('ingredient.standardUOM', 'standardUnit')
      .getOne();

    if (!pantryIngredient) throw new NotFoundException();

    return pantryIngredient;
  }

  async update(
    options: {
      id: PantryIngredient['scopedId'];
      ownerId?: PantryIngredient['ownerId'];
    },
    values: UpdatePantryIngredientRequest,
    manager: EntityManager = this.entityManager,
  ): Promise<void> {
    const { id, ownerId } = options;
    const { name, waste, orderFrequency, packs, conversions } = values;

    const ingredientValues = {
      name,
      yieldPercent: waste == null ? null : `${100 - waste}`,
      orderFrequency: orderFrequency !== undefined ? orderFrequency : null,
      standardUOM: values.unit
        ? await this.unitsService.findByAlias({
            ownerId,
            alias: values.unit,
          })
        : null,
    };

    try {
      return await this.transactionManagerService.ensureTransactional(
        manager,
        async (manager) => {
          const {
            affected,
            raw: [{ id: pantryIngredientId }],
          } = await manager
            .createQueryBuilder()
            .update(PantryIngredient)
            .set(onlyDefined(ingredientValues))
            .where({ scopedId: id, ownerId })
            .returning(['id'])
            .execute();
          if (affected === 0) throw new NotFoundException();

          await this.ingredientsService.setConversions(
            { ingredientId: pantryIngredientId, ownerId },
            conversions,
            manager,
          );

          const packsWithIds = packs.filter(({ id }) => id);

          if (packsWithIds.length) {
            await manager.softDelete(Pack, {
              pantryIngredientId,
              id: Not(In(packsWithIds.map((pack) => pack.id))),
            });
          } else {
            await manager.softDelete(Pack, {
              pantryIngredientId,
            });
          }

          if (packs.filter(({ isDefault }) => isDefault).length !== 1)
            throw new BadRequestException('Must have exactly one primary pack');

          await Promise.all(
            packs.map(async (pack) => {
              const {
                id,
                catalogNumber,
                vendorId,
                price: packPrice,
                numItems: packSize,
                amountPerItem: packAmountPerItem,
                unit: packItemUnitSymbol,
              } = pack;

              const packItemUnit =
                packItemUnitSymbol &&
                (await this.unitsService.findByAlias({
                  ownerId,
                  alias: packItemUnitSymbol,
                }));

              if (packItemUnitSymbol && !packItemUnit)
                throw new BadRequestException(
                  `Unit "${packItemUnitSymbol}" not found`,
                );

              const packValues = {
                id,
                pantryIngredientId,
                vendorId,
                catalogNumber,
                price: packPrice == null ? null : packPrice.toString(),
                numItems: packSize == null ? null : packSize.toString(),
                amountPerItem:
                  packAmountPerItem == null
                    ? null
                    : packAmountPerItem.toString(),
                itemUnit: packItemUnit,
              };

              let packId;
              if (id) {
                ({
                  raw: [{ id: packId }],
                } = await manager
                  .createQueryBuilder()
                  .update(Pack)
                  .set(onlyDefined(packValues))
                  .where({
                    id,
                    pantryIngredientId,
                  })
                  .returning(['id'])
                  .execute());
              } else {
                ({
                  raw: [{ id: packId }],
                } = await manager
                  .createQueryBuilder()
                  .insert()
                  .into(Pack)
                  .values(onlyDefined(packValues))
                  .returning(['id'])
                  .execute());
              }

              if (pack.isDefault) {
                await manager.update(PantryIngredient, pantryIngredientId, {
                  defaultPackId: packId,
                });
              }
            }),
          );
        },
      );
    } catch (err) {
      if (err.code == PostgresErrorCode.UNIQUE_VIOLATION)
        throw new BadRequestException(
          'An ingredient already exists with that name',
        );
      throw err;
    }
  }

  async delete(
    options: {
      id: PantryIngredient['scopedId'];
      ownerId?: PantryIngredient['ownerId'];
    },
    manager: EntityManager = this.entityManager,
  ): Promise<void> {
    return await this.ingredientsService.delete(options, manager);
  }

  async importCsv(
    ownerId: Account['id'],
    csvFile: Buffer | string,
  ): Promise<void> {
    const iterator = this.csvParserService.parse(csvFile);

    for await (const record of iterator) {
      const {
        scopedId,
        name,
        packPrice,
        packSize,
        packAmountPerItem,
        packItemUnit,
        waste,
        orderFrequency,
      } = record;
      const yieldPercent = waste != null ? 100 - waste : 100;

      await this.entityManager.transaction('SERIALIZABLE', async (manager) => {
        const unit =
          packItemUnit &&
          (await this.unitsService.findOrCreateByAlias(
            { ownerId, alias: packItemUnit },
            manager,
          ));

        const existing = await manager.findOne(PantryIngredient, {
          where: scopedId ? { scopedId, ownerId } : { name, ownerId },
          relations: ['packs'],
        });

        if (!existing) {
          await this.create(
            ownerId,
            {
              name,
              yieldPercent: `${yieldPercent}`,
              unit: unit?.symbol,
              packs: [
                {
                  price: +(packPrice || 0),
                  amountPerItem: +(packAmountPerItem || '1'),
                  numItems: +(packSize || '1'),
                  unit: packItemUnit,
                  vendorId: null,
                  catalogNumber: null,
                  id: null,
                },
              ],
            },
            manager,
          );
          return;
        }

        Object.assign(existing, { name, yieldPercent, standardUnit: unit });
        Object.assign(existing.packs[0], {
          price: packPrice,
          numItems: packSize,
          amountPerItem: packAmountPerItem,
          itemUnit: unit,
        });

        await manager.save(existing);
        await manager.save(existing.packs[0]);
      });
    }
  }

  async getPackParLevels(
    pantryIngredient: PantryIngredient,
    parLevel?: number,
    manager: EntityManager = this.entityManager,
  ): Promise<number[]> {
    if (parLevel === undefined)
      [parLevel] = await this.getParLevelAndUsage(pantryIngredient, manager);

    return await Promise.all(
      pantryIngredient.packs.map(
        async (pack) =>
          (await this.unitsService.convertM(
            {
              amount: parLevel,
              ingredient: pantryIngredient,
              fromUnit: pantryIngredient?.standardUOM,
              toUnit: pack.itemUnit,
            },
            pantryIngredient.unitConversions,
          )) /
          (+(pack.amountPerItem ?? 1) * +(pack.numItems ?? 1)),
      ),
    );
  }

  async getParLevelAndUsage(
    pantryIngredient: PantryIngredient,
    manager: EntityManager = this.entityManager,
  ): Promise<[number, { type: string; id: number; name: string }[]]> {
    const [
      dailyUsage,
      usedIn,
    ] = await this.ingredientsService.calculateDailyUsage(
      pantryIngredient,
      pantryIngredient.standardUOM,
      manager,
    );

    return [dailyUsage / (pantryIngredient.orderFrequency ?? 1), usedIn];
  }
}
