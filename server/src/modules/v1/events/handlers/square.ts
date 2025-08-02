import { Injectable } from '@nestjs/common';
import { Account } from '@modules/v1/accounts/account.entity';
import { EntityManager, In } from 'typeorm';

import { InventoryService } from '../../inventory/inventory.service';
import { OrderItemInventory } from '../../pos/order-item-inventory.entity';
import { OrderItem } from '../../pos/order-item.entity';
import { Order } from '../../pos/order.entity';
import { SquarePosItemLink } from '../../pos/square/square-item-link.entity';
import { SquareOrder } from '../../pos/square/square-order.entity';
import { SquarePos } from '../../pos/square/square-pos.entity';
import { SquareService } from '../../pos/square/square.service';
import { SquareToken } from '../../pos/square/square-token.entity';
import { Event, EventType } from '../event.entity';
import { Handler } from './handler';

const DAY = 24 * 60 * 60 * 1000;

@Injectable()
export class SquareHandler extends Handler {
  constructor(
    private readonly squareService: SquareService,
    private readonly inventoryService: InventoryService,
  ) {
    super();
  }

  async handle(event: Event, manager: EntityManager) {
    switch (event.type) {
      case EventType.SQUARE_REFRESH_TOKEN_REQUEST:
        await this.handleRefreshToken(event, manager);
        break;
      case EventType.SQUARE_WEBHOOK:
        await this.handleWebhook(event, manager);
        break;
    }
  }

  private async handleWebhook(event: Event, manager: EntityManager) {
    const {
      data: { type, data },
    } = event;

    const isV1Webhook = !type;

    if (type === 'catalog.version.updated') {
      return await this.handleCatalogUpdate(event, manager);
    }

    if (
      isV1Webhook ||
      (type === 'order.updated' &&
        data.object.order_updated.state === 'COMPLETED')
    ) {
      const locationId =
        event.data.location_id ?? data.object.order_updated.location_id;

      const posList = await manager.find(SquarePos, {
        where: { squareLocationId: locationId },
        relations: ['token'],
      });
      for (const pos of posList) {
        if (pos.token.deletedAt) continue;

        const { accessToken } = pos.token;

        let orderId = data?.id;
        if (isV1Webhook) {
          const { payment_url } = await this.squareService.getV1Payment(
            accessToken,
            locationId,
            event.data.entity_id,
          );
          orderId = payment_url.slice(payment_url.lastIndexOf('/') + 1);
        }
        const {
          orders: [order],
        } = await this.squareService.getOrder(accessToken, locationId, orderId);

        if (!order.line_items) return;

        const orderEntity = new Order({
          locationId: pos.locationId,
        });
        await manager.save(orderEntity);

        const squareOrderEntity = new SquareOrder({
          id: order.id,
          orderId: orderEntity.id,
        });
        await manager.insert(SquareOrder, squareOrderEntity);

        await Promise.all(
          order.line_items.map(async ({ catalog_object_id, quantity }) => {
            const link = await manager.findOne(SquarePosItemLink, {
              where: { idInPos: catalog_object_id },
              relations: ['item', 'item.recipe'],
            });

            if (!link) return;

            await manager.insert(
              OrderItem,
              new OrderItem({
                orderId: orderEntity.id,
                itemId: link.itemId,
                quantity,
              }),
            );

            const { item } = link;
            const partialLogs = await this.inventoryService.consumeRecipe(
              pos.locationId,
              item.recipeId,
              quantity,
              order.time,
              manager,
            );

            const [partialOrderItem] = (
              await manager.insert(
                OrderItem,
                new OrderItem({
                  orderId: orderEntity.id,
                  itemId: link.itemId,
                  quantity,
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
  }

  private async handleCatalogUpdate(event: Event, manager: EntityManager) {
    const squareMerchantId: string = event.data.merchant_id;

    const tokens = await manager.find(SquareToken, { squareMerchantId });

    await Promise.all(
      tokens.map(async (token) => {
        const locations = await this.squareService.getLocations(
          token.accessToken,
        );
        const pos = await manager.find(SquarePos, {
          where: { squareLocationId: In(locations.map(({ id }) => id)) },
          relations: ['token', 'account'],
        });

        await Promise.all(
          pos.map(async (pos) => {
            const hasNewPosItems = await this.squareService.hasUnassociatedItems(
              token,
              pos,
              manager,
            );
            await manager.update(Account, pos.accountId, { hasNewPosItems });
          }),
        );
      }),
    );
  }

  private async handleRefreshToken(event: Event, manager: EntityManager) {
    const { accountId } = event.data;
    const token = await manager.findOne(SquareToken, { accountId });

    try {
      const {
        accessToken,
        expiresAt,
        refreshToken,
      } = await this.squareService.getAccessToken({
        refreshToken: token.refreshToken,
      });
      Object.assign(token, { accessToken, expiresAt, refreshToken });
      await manager.save(token);
      await manager.insert(Event, {
        type: EventType.SQUARE_REFRESH_TOKEN_REQUEST,
        data: { accountId },
        time: new Date(+Date.now() + 7 * DAY),
      });
    } catch (err) {
      if (
        err.status === 401 &&
        err.response.data.type === 'service.not_authorized'
      ) {
        console.log('Cancelling token refresh. Unauthorized', { accountId });
      }

      // If there are only 20 days left then log an error which will notify us to resolve the issue
      if (+new Date(token.expiresAt) - Date.now() < 20 * DAY) {
        console.error('Square Token Renewal failing', { accountId });
      }

      // If the token expires in 20 days or less Reschedule for tomorrow:
      manager.insert(Event, {
        type: EventType.SQUARE_REFRESH_TOKEN_REQUEST,
        data: { accountId },
        time: new Date(+Date.now() + DAY),
      });
    }
  }
}
