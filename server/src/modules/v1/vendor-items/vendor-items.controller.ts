import { Body, Controller, Get, Param, Put, Session } from '@nestjs/common';
import { UpdateVendorItemRequestDTO, UpdateVendorItemResponseDTO } from './dto';
import { GetVendorItemResponseDTO } from './dto/get-vendor-item.dto';
import { VendorItemsService } from './vendor-items.service';

@Controller('vendor-items')
export class VendorItemsController {
  public constructor(private readonly vendorItemsService: VendorItemsService) {}
  @Get(':id')
  public async getVendorItem(@Body() {}: {}, @Param('id') id: string) {
    return new GetVendorItemResponseDTO(
      await this.vendorItemsService.findOne(id),
    );
  }

  @Put(':id')
  public async updateVendorItem(
    @Body() data: UpdateVendorItemRequestDTO,
    @Param('id') id: string,
    @Session() { accountId },
  ): Promise<UpdateVendorItemResponseDTO> {
    await this.vendorItemsService.update(accountId, id, data);
    return new UpdateVendorItemResponseDTO();
  }
}
