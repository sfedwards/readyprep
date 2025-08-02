import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Session,
} from '@nestjs/common';
import { PaginatedRequest } from '../pagination/DTO/pagination.dto';
import { Plan } from '../plans/plan.decorator';
import { UpdateInvoiceRequestDTO, UpdateInvoiceResponseDTO } from './dto';
import {
  CreateInvoiceRequestDTO,
  CreateInvoiceResponseDTO,
} from './dto/create-invoice.dto';
import { GetInvoiceResponseDTO } from './dto/get-invoice.dto';
import { InvoicesService } from './invoices.service';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @Plan('PREMIUM')
  public async listInvoices(
    @Body() {}: {},
    @Query() { page, pageSize }: PaginatedRequest,
    @Session() { accountId },
  ) {
    return await this.invoicesService.find({ page, pageSize }, accountId);
  }

  @Get(':id')
  @Plan('PREMIUM')
  public async getInvoice(@Body() {}: {}, @Param('id') id: string) {
    const invoice = await this.invoicesService.findOne(id);
    return new GetInvoiceResponseDTO(invoice);
  }

  @Post()
  @Plan('PREMIUM')
  public async createInvoice(
    @Body() data: CreateInvoiceRequestDTO,
    @Session() { accountId },
  ): Promise<CreateInvoiceResponseDTO> {
    const invoiceId = await this.invoicesService.create(data, accountId);
    return new CreateInvoiceResponseDTO(invoiceId);
  }

  @Put(':id')
  @Plan('PREMIUM')
  public async updateInvoice(
    @Body() data: UpdateInvoiceRequestDTO,
    @Param('id') id: string,
    @Session() { accountId },
  ): Promise<UpdateInvoiceResponseDTO> {
    await this.invoicesService.update(id, data, accountId);
    return new UpdateInvoiceResponseDTO();
  }
}
