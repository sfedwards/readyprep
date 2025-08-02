import {
  Body,
  Controller,
  Get,
  Param,
  Query,
  Session,
  UseGuards,
} from '@nestjs/common';
import { LoggedInGuard } from '../auth/logged-in.guard';
import { PaginatedRequest } from '../pagination/DTO/pagination.dto';
import { Plan } from '../plans/plan.decorator';
import { PlanGuard } from '../plans/plan.guard';
import { VendorsService } from './vendors.service';

@Controller('orders')
@UseGuards(PlanGuard)
export class OrdersController {
  public constructor(private readonly vendorsService: VendorsService) {}

  @Get()
  @Plan('PREMIUM')
  @UseGuards(LoggedInGuard)
  public async listOrders(
    @Body() {}: {},
    @Query() { page, pageSize }: PaginatedRequest,
    @Session() { accountId },
  ) {
    return await this.vendorsService.findOrders({ page, pageSize }, accountId);
  }

  @Get(':id')
  @Plan('PREMIUM')
  @UseGuards(LoggedInGuard)
  public async getOrder(
    @Body() {}: {},
    @Param('id') id: string,
    @Session() { accountId },
  ) {
    const order = await this.vendorsService.findOneOrder(id, accountId);

    return {
      id: order.id,
      number: order.shortId,
      createdAt: order.createdAt,
      cost: order.cost,
      state: order.state,
      vendor: {
        id: order.vendor.id,
        name: order.vendor.name,
      },
      invoiceId: order.invoiceId,
      items: order.items.map((item) => ({
        packId: item.packId,
        ingredient: {
          id: item.pack.pantryIngredient.scopedId,
          name: item.pack.pantryIngredient.name,
        },
        catalogNumber: item.pack.catalogNumber,
        packs: item.numPacks,
        price: item.pricePer,
      })),
    };
  }
}
