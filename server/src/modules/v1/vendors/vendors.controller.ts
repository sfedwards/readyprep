import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Response,
  Session,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { toNumberOrNull } from 'util/Util';
import { LoggedInGuard } from '../auth/logged-in.guard';
import { PaginatedRequest } from '../pagination/DTO/pagination.dto';
import { Plan } from '../plans/plan.decorator';
import { PlanGuard } from '../plans/plan.guard';
import { UpdateVendorRequestDTO, UpdateVendorResponseDTO } from './dto';
import { CreateOrderRequestDTO } from './dto/create-order.dto';
import {
  CreateVendorRequestDTO,
  CreateVendorResponseDTO,
} from './dto/create-vendor.dto';
import { VendorOrderMethod } from './enum/order-method.enum';
import { ImportPackDto, VendorsService } from './vendors.service';
import * as XLSX from 'xlsx';
import { Pack } from '../ingredients/pack.entity';

@Controller('vendors')
@UseGuards(LoggedInGuard)
@UseGuards(PlanGuard)
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Get()
  public async listVendors(
    @Body() {}: {},
    @Query() { page, pageSize }: PaginatedRequest,
    @Session() { accountId },
  ) {
    return await this.vendorsService.find({ page, pageSize }, accountId);
  }

  @Get(':id')
  public async getVendor(
    @Body() {}: {},
    @Param('id') id: string,
    @Session() { accountId },
  ) {
    return await this.vendorsService.findOne(id, accountId);
  }

  @Post()
  public async createVendor(
    @Body() data: CreateVendorRequestDTO,
    @Session() { accountId },
  ): Promise<CreateVendorResponseDTO> {
    if (
      data.orderMethod === VendorOrderMethod.EMAIL &&
      !data.primaryContact.email
    )
      throw new BadRequestException(
        'Email address is required for Email Order Method',
      );
    const vendorId = await this.vendorsService.create(data, accountId);
    return new CreateVendorResponseDTO(vendorId);
  }

  @Put(':id')
  public async updateVendor(
    @Body() data: UpdateVendorRequestDTO,
    @Param('id') id: string,
  ): Promise<UpdateVendorResponseDTO> {
    if (
      data.orderMethod === VendorOrderMethod.EMAIL &&
      !data.primaryContact.email
    )
      throw new BadRequestException(
        'Email address is required for Email Order Method',
      );
    await this.vendorsService.update(id, data);
    return new UpdateVendorResponseDTO();
  }

  @Get(':id/catalog')
  public async getCatalog(
    @Body() {}: {},
    @Param('id') id: string,
    @Session() { accountId },
    @Query('page', new DefaultValuePipe(undefined)) page?: number,
    @Query('pageSize', new DefaultValuePipe(undefined)) pageSize?: number,
  ) {
    return await this.vendorsService.getCatalog(id, accountId, {
      page,
      pageSize,
    });
  }

  @Post(':id/catalog')
  @UseInterceptors(FileInterceptor('file'))
  public async importCatalog(
    @Param('id') id: string,
    @UploadedFile('file') file,
    @Session() { accountId },
  ): Promise<{
    updatedPacks: ImportPackDto[];
    newPacks: ImportPackDto[];
  }> {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });

    if (workbook.SheetNames.length !== 1)
      throw new BadRequestException('Workbook should only have one sheet');

    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const rows = XLSX.utils.sheet_to_json<ImportPackDto>(sheet, {
      header: [
        'catalogNumber',
        'price',
        'numItems',
        'amountPerItem',
        'uom',
        'ingredientName',
        'makePrimary',
      ],
      raw: true,
      dateNF: 'd/m/yy',
    });

    const packs = rows
      .map((row, i) => ({
        ...row,
        line: i + 1,
      }))
      .filter(
        (row) =>
          !row.catalogNumber ||
          `${row.catalogNumber}`?.replace(/[^a-z0-9]|\bCatalog\b/gi, ''),
      );

    const { updatedPacks, newPacks } = await this.vendorsService.updateCatalog(
      id,
      accountId,
      packs,
    );

    return { updatedPacks, newPacks };
  }

  @Get(':id/catalog/export')
  public async exportCatalog(
    @Param('id') id: string,
    @Session() { accountId },
    @Response() res,
  ): Promise<void> {
    const workbook = XLSX.utils.book_new();

    const headers = [
      'Catalog #',
      'Pack Price',
      'Pack Size (# units)',
      'Amount per unit',
      'UOM',
      'Ingredient',
      'Make Primary',
    ];

    const catalog = (await this.vendorsService.getCatalog(
      id,
      accountId,
    )) as (Omit<Pack, 'itemUnit'> & { unit: string })[];
    const data = catalog.map((pack) => {
      return [
        pack.catalogNumber,
        pack.price,
        pack.numItems,
        pack.amountPerItem,
        pack.unit,
        pack.pantryIngredient.name,
      ];
    });

    const sheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

    XLSX.utils.book_append_sheet(workbook, sheet);

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.send(buffer);
  }

  @Post(':id/confirmImport')
  public async confirmImport(
    @Param('id') id: string,
    @Session() { accountId },
    @Body() data: ImportPackDto & { ingredient: { id: number } },
  ): Promise<Record<never, never>> {
    await this.vendorsService.confirmImport(id, accountId, data);
    return {};
  }

  @Get(':id/catalog/:ingredientId')
  public async getPacks(
    @Body() {}: {},
    @Param('id') id: string,
    @Param('ingredientId', ParseIntPipe) ingredientId: number,
    @Session() { accountId },
  ) {
    const packs = await this.vendorsService.getPacks(
      id,
      ingredientId,
      accountId,
    );
    return packs.map((pack) => ({
      ...pack,
      price: toNumberOrNull(pack.price),
    }));
  }

  @Post(':id/orders')
  @Plan('PREMIUM')
  @UseGuards(LoggedInGuard)
  public async createOrder(
    @Body() data: CreateOrderRequestDTO,
    @Param('id') vendorId: string,
    @Session() { userId },
  ): Promise<CreateVendorResponseDTO> {
    const order = await this.vendorsService.createOrder(
      vendorId,
      userId,
      data.items,
    );
    return new CreateVendorResponseDTO(order.id);
  }
}
