import { Injectable } from '@nestjs/common';
import { Account } from '@modules/v1/accounts/account.entity';
import { EntityManager, In } from 'typeorm';

import { InventoryService } from '../../inventory/inventory.service';
import { OrderItemInventory } from '../../pos/order-item-inventory.entity';
import { OrderItem } from '../../pos/order-item.entity';
import { Order } from '../../pos/order.entity';
import { Event, EventType } from '../event.entity';
import { Handler } from './handler';
import { CloverPos } from '@modules/v1/pos/clover/clover-pos.entity';
import { string } from 'zod';
import { CloverService } from '@modules/v1/pos/clover/clover.service';
import { Transactional } from '@modules/infra/database/transactional.decorator';
import { CloverOrder } from '@modules/v1/pos/clover/clover-order.entity';
import { CloverPosItemLink } from '@modules/v1/pos/clover/clover-item-link.entity';
import { CloverToken } from '@modules/v1/pos/clover/clover-token.entity';

const DAY = 24 * 60 * 60 * 1000;

@Injectable()
export class CloverHandler extends Handler {
  constructor(
    private readonly cloverService: CloverService,
    private readonly inventoryService: InventoryService,
  ) {
    super();
  }

  async handle(event: Event, manager: EntityManager) {
    switch (event.type) {
      case EventType.CLOVER_WEBHOOK:
        await this.handleWebhook(event, manager);
        break;
    }
  }

  private async handleWebhook(event: Event, manager: EntityManager) {
    const {
      data: { merchants },
    } = event;

    for (const [merchantId, events] of Object.entries(merchants)) {
      for (const event of events as { objectId: string; type: string }[]) {
        // Example: "O:C39FKT8PCYEX2"
        const [objectType, objectId] = event.objectId.split(':');

        if (objectType === 'O' && event.type === 'CREATE') {
          await this.handleOrder(merchantId, objectId);
        }

        if (objectType === 'I') await this.handleCatalogUpdate(merchantId);
      }
    }
  }

  @Transactional()
  private async handleOrder(merchantId: string, orderId: string) {
    const manager = Transactional.getManager();

    const posList = await manager.find(CloverPos, {
      where: { cloverMerchantId: merchantId },
      relations: ['token'],
    });

    for (const pos of posList) {
      if (pos.token.deletedAt) continue;

      const { accessToken } = pos.token;

      const lineItems = await this.cloverService.getOrder({
        accessToken,
        merchantId,
        orderId,
      });

      if (!lineItems) return;

      const orderEntity = new Order({
        locationId: pos.locationId,
      });
      await manager.save(orderEntity);

      const cloverOrderEntity = new CloverOrder({
        id: orderId,
        orderId: orderEntity.id,
      });
      await manager.insert(CloverOrder, cloverOrderEntity);

      await Promise.all(
        lineItems.map(async ({ id, name }) => {
          const link = await manager.findOne(CloverPosItemLink, {
            where: { idInPos: id },
            relations: ['item', 'item.recipe'],
          });

          if (!link) return;

          await manager.insert(
            OrderItem,
            new OrderItem({
              orderId: orderEntity.id,
              itemId: link.itemId,
              quantity: 1,
            }),
          );

          const { item } = link;
          const partialLogs = await this.inventoryService.consumeRecipe(
            pos.locationId,
            item.recipeId,
            1,
            new Date(),
            manager,
          );

          const [partialOrderItem] = (
            await manager.insert(
              OrderItem,
              new OrderItem({
                orderId: orderEntity.id,
                itemId: link.itemId,
                quantity: 1,
              }),
            )
          ).identifiers;

          await manager.insert(
            OrderItemInventory,
            partialLogs.map(({ id }) => ({
              orderItemId: partialOrderItem.id,
              inventoryLogId: id,
            })),
          );
        }),
      );
    }
  }

  @Transactional()
  private async handleCatalogUpdate(merchantId: string) {
    const manager = Transactional.getManager();

    const pos = await manager.find(CloverPos, {
      where: { cloverMerchantId: merchantId },
      relations: ['token', 'account'],
    });

    await Promise.all(
      pos.map(async (pos) => {
        const hasNewPosItems = await this.cloverService.hasUnassociatedItems(
          pos.token,
          pos,
        );
        await manager.update(Account, pos.accountId, { hasNewPosItems });
      }),
    );
  }
}
