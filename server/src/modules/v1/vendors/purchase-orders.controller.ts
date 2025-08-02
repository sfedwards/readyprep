import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { VendorOrder } from './entities';
import { VendorOrderState } from './enum/order-state.enum';

@Controller('po')
export class PurchaseOrdersController {
  public constructor(
    @InjectEntityManager() private readonly manager: EntityManager,
  ) {}

  @Get(':id')
  public async getPurchaseOrder(
    @Param('id') id: string,
    @Query('key') key: string,
  ): Promise<any> {
    const order = await this.manager.getRepository(VendorOrder).findOne({
      where: {
        shortId: id,
        key: key,
      },
      relations: [
        'creator',
        'location',
        'vendor',
        'items',
        'items.pack',
        'items.pack.pantryIngredient',
      ],
    });

    if (!order) throw new NotFoundException();

    if (order.state === VendorOrderState.SENT) {
      order.state = VendorOrderState.OPENED;
      await this.manager.save(order);
    }

    return {
      number: order.shortId,
      date: order.createdAt,
      contact: order.creator.name,
      location: {
        name: order.location.name,
        address: order.location.address,
        phoneNumber: order.location.phoneNumber,
      },
      includePrices: order.vendor.includePricesOnPurchaseOrders,
      items: order.items
        .sort((a, b) =>
          a.pack.pantryIngredient.name.localeCompare(
            b.pack.pantryIngredient.name,
          ),
        )
        .map(({ pack, numPacks, pricePer }) => {
          const item = {
            catalogNumber: pack.catalogNumber,
            name: pack.pantryIngredient.name,
            quantity: numPacks,
          };

          return order.vendor.includePricesOnPurchaseOrders
            ? { ...item, pricePer }
            : item;
        }),
    };
  }
}
