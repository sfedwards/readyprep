import { CreateInvoiceRequest, CreateInvoiceResponse, UpdateInvoiceRequest, UpdateInvoiceResponse } from "./invoices";

import request from '../../util/request';

export class InvoiceApi {

  public async create ( data: CreateInvoiceRequest ): Promise<{ body: CreateInvoiceResponse}> {
    return await request.post( 
      '/invoices', 
      {
        body: data 
      }
    ) as Promise<{ body: CreateInvoiceResponse }>;
  }

  public async update ( id: string, data: UpdateInvoiceRequest ): Promise<{ body: UpdateInvoiceResponse}> {
    return await request.put( 
      `/invoices/${id}`, 
      {
        body: data 
      }
    ) as Promise<{ body: UpdateInvoiceResponse }>;
  }

}