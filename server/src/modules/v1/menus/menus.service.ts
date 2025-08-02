import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, In, Like } from 'typeorm';
import { Menu } from './menu.entity';
import { TransactionManagerService } from '../transaction-manager/transaction-manager.service';
import {
  PaginatedRequest,
  PaginatedResponse,
} from '../pagination/DTO/pagination.dto';
import { PaginatorFactoryService } from '../pagination/paginator/paginator-factory.service';

import { onlyDefined } from '../../../util/Util';
import { MenuSection } from './menu-section.entity';
import _ = require('lodash');

import { FindMenuResponseItem } from './DTO/find.menu.dto';
import PostgresErrorCode from '../../../util/PostgresErrors';
import { UpdateMenuRequest } from './DTO/update.menu.dto';
import { MenuItem } from '../menu-items/menu-item.entity';
import { MenuItemsService } from '../menu-items/menu-items.service';
import { CreateMenuRequest } from './DTO/create.menu.dto';

@Injectable()
export class MenusService {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly transactionManagerService: TransactionManagerService,
    private readonly paginatorFactoryService: PaginatorFactoryService,
    private readonly menuItemsService: MenuItemsService,
  ) {}

  async create(
    ownerId: Menu['ownerId'],
    values: CreateMenuRequest,
    manager: EntityManager = this.entityManager,
  ): Promise<Menu> {
    const { name } = values;

    const menu = new Menu();
    menu.name = name;
    menu.ownerId = ownerId;

    try {
      return await this.transactionManagerService.ensureTransactional(
        manager,
        async (manager) => {
          const { maxId } = await manager
            .getRepository(Menu)
            .createQueryBuilder()
            .select('MAX("scopedId") "maxId"')
            .withDeleted()
            .where('"ownerId" = :ownerId', { ownerId })
            .getRawOne();
          menu.scopedId = (maxId || 0) + 1;
          await manager.save(menu);

          await this.update({ id: menu.scopedId, ownerId }, values, manager);

          return menu;
        },
        'SERIALIZABLE',
      );
    } catch (err) {
      if (err.code == PostgresErrorCode.UNIQUE_VIOLATION) {
        return await this.transactionManagerService.ensureTransactional(
          manager,
          async (manager) => {
            const menus = await manager.find(Menu, {
              select: ['name'],
              where: {
                ownerId,
                name: Like(`${name.replace(/[_%]/g, '\\$&')}%`),
              },
            });
            let index: number;
            for (index = 2; ; index++) {
              if (menus.every((menu) => menu.name !== `${name} - ${index}`))
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
      ownerId?: Menu['ownerId'];
    } & PaginatedRequest,
    manager: EntityManager = this.entityManager,
  ): Promise<PaginatedResponse & { menus: FindMenuResponseItem[] }> {
    const { page, pageSize } = options;

    const paginator = this.paginatorFactoryService.create<Menu>(page, pageSize);

    const queryOptions: { where: { ownerId?: string } } = { where: {} };
    if (options.ownerId) queryOptions.where.ownerId = options.ownerId;

    const [menuIds, numPages] = await paginator(async (skipTake) => {
      return await manager
        .getRepository(Menu)
        .findAndCount({ ...skipTake, ...queryOptions, select: ['id'] });
    });

    const menus =
      menuIds.length === 0
        ? []
        : await manager
            .getRepository(Menu)
            .createQueryBuilder('menu')
            .select('menu."scopedId"', 'id')
            .addSelect('menu.name', 'name')
            .addSelect('menu.updatedAt', 'updatedAt')
            .addSelect('COUNT(items)', 'numItems')
            .leftJoin('menu.sections', 'section')
            .leftJoin('section.items', 'items')
            .where({
              id: In(menuIds.map(({ id }) => id)),
            })
            .groupBy('menu.id')
            .orderBy('menu."createdAt"', 'DESC')
            .execute();
    return { menus, numPages };
  }

  async findOne(
    options: {
      id: Menu['id'];
      ownerId?: Menu['ownerId'];
    },
    manager: EntityManager = this.entityManager,
  ): Promise<{ menu: Menu; costs: Record<number, number> }> {
    const { id: scopedId, ownerId } = options;

    const menu = await manager.getRepository(Menu).findOne({
      where: onlyDefined({ scopedId, ownerId }),
      relations: ['sections', 'sections.items', 'sections.items.recipe'],
    });

    if (!menu) throw new NotFoundException();

    const costs = {};
    for (const section of menu.sections) {
      for (const item of section.items) {
        if (costs[item.id] === undefined)
          costs[item.id] = await this.menuItemsService.calculatePlateCost(item);
      }
    }

    return { menu, costs };
  }

  async update(
    options: {
      id: Menu['id'];
      ownerId?: Menu['ownerId'];
    },
    values: UpdateMenuRequest,
    manager: EntityManager = this.entityManager,
  ): Promise<void> {
    const { id: scopedId, ownerId } = options;
    const { name, sections } = values;
    const menuValues = { name };

    try {
      return await this.transactionManagerService.ensureTransactional(
        manager,
        async (manager) => {
          const menu = await manager.findOne(Menu, {
            where: onlyDefined({ scopedId, ownerId }),
          });

          if (!menu) throw new NotFoundException();

          Object.assign(menu, menuValues);
          await manager.save(menu);

          const allItemsScopedIds = sections.flatMap(
            (section) => section.items,
          );
          const allMenuItems =
            allItemsScopedIds.length > 0
              ? await manager.find(MenuItem, {
                  select: ['id', 'scopedId'],
                  where: { ownerId, scopedId: In(allItemsScopedIds) },
                })
              : [];

          await manager
            .getRepository(MenuSection)
            .createQueryBuilder()
            .delete()
            .where({ menuId: menu.id })
            .execute();

          await Promise.all(
            sections.map(({ name, items }) =>
              manager.save(
                new MenuSection({
                  menu,
                  name,
                  items: items.map(
                    (scopedId) =>
                      new MenuItem({
                        id: allMenuItems.find(
                          (item) => item.scopedId === scopedId,
                        ).id,
                      }),
                  ),
                }),
              ),
            ),
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
      id: Menu['id'];
      ownerId?: Menu['ownerId'];
    },
    manager: EntityManager = this.entityManager,
  ): Promise<void> {
    const { id: scopedId, ownerId } = options;
    const { affected } = await manager
      .getRepository(Menu)
      .update(onlyDefined({ scopedId, ownerId, deletedAt: null }), {
        deletedAt: () => 'CURRENT_TIMESTAMP',
      });

    if (affected === 0) throw new NotFoundException();
  }
  /*
  async setSections ( 
    options: {
      menuId: Menu['id'];
      ownerId?: Menu['ownerId'];
    },
    sections: UpdateMenuRequest['sections'],
    manager: EntityManager = this.entityManager,
  ): Promise<void> {
    const { menuId, ownerId } = options;

    await manager.createQueryBuilder()
      .delete()
      .from( MenuSection )
      .where( onlyDefined( { menuId } ) )
      .returning( 'id' )
      .execute()
    ;

   const { raw: ids } = await manager.createQueryBuilder()
      .insert()
      .into( MenuSection )
      .values( sections.map( ({ name }) => ({ name, menuId }) ) )
      .returning( 'id' )
      .execute();

    for ( const [i, id] of Object.entries( ids ) ) {
      await manager.createQueryBuilder()
        .relation( MenuSection, 'items' )
        .of( id )
        .set( sections[ i ].items )
    }
  }
*/
  async addSection(
    options: {
      id: Menu['id'];
      ownerId?: Menu['ownerId'];
    },
    values: {
      name: MenuSection['name'];
    },
    manager: EntityManager = this.entityManager,
  ): Promise<void> {
    const { id, ownerId } = options;
    const { name } = values;

    const section = new MenuSection({ name });

    await this.transactionManagerService.ensureTransactional(
      manager,
      async (manager) => {
        const menu = await manager.findOne(Menu, onlyDefined({ id, ownerId }));
        if (!menu) throw new NotFoundException();

        section.menu = menu;
        await manager.save(section);
      },
    );
  }

  async updateSection(
    options: {
      menuId: Menu['id'];
      ownerId?: Menu['ownerId'];
      sectionId: MenuSection['id'];
    },
    values: {
      name: MenuSection['name'];
    },
    manager: EntityManager = this.entityManager,
  ): Promise<void> {
    const { menuId, ownerId, sectionId } = options;
    const { name } = values;

    await this.transactionManagerService.ensureTransactional(
      manager,
      async (manager) => {
        const section = await manager.findOne(MenuSection, {
          where: (qb) => {
            qb.where({
              id: sectionId,
            });
            qb.andWhere('section.menuId = :menuId', { menuId });
            if (ownerId) qb.andWhere('menu.ownerId = :ownerId', { ownerId });
          },
          join: {
            alias: 'section',
            innerJoin: {
              menu: 'section.menu',
            },
          },
        });

        if (!section) throw new NotFoundException();

        section.name = name;
        await manager.save(section);
      },
    );
  }

  async removeSection(
    options: {
      menuId: Menu['id'];
      ownerId?: Menu['ownerId'];
      sectionId: MenuSection['id'];
    },
    manager: EntityManager = this.entityManager,
  ): Promise<void> {
    const { menuId, ownerId, sectionId } = options;

    await this.transactionManagerService.ensureTransactional(
      manager,
      async (manager) => {
        const menu = await manager.findOne(Menu, {
          where: onlyDefined({
            id: menuId,
            ownerId,
          }),
          relations: ['sections'],
        });

        if (!menu) throw new NotFoundException();

        const section = menu.sections.find(({ id }) => id === sectionId);

        if (!section || section.deletedAt) throw new NotFoundException();

        if (menu.sections.filter((section) => !section.deletedAt).length <= 1)
          throw new BadRequestException('Cannot delete only section from Menu');

        const { affected } = await manager.softDelete(MenuSection, {
          id: sectionId,
          deletedAt: null,
        });

        if (affected === 0) throw new NotFoundException();
      },
    );
  }
}
