import { CreateVendorRequest, CreateVendorResponse, UpdateVendorRequest, UpdateVendorResponse } from "./vendors";

import request from '../../util/request';
import { Vendor } from "./models/vendor.api.model";
import { CreateOrderRequest, CreateOrderResponse } from "./vendors/interface/CreateOrder.api.interface";

export interface ImportPackDto {
  catalogNumber: string;
  price: number | string;
  numItems: number | string;
  amountPerItem: number | string;
  uom: string;
  ingredientName: string;
  makePrimary: boolean | string;
  match?: { id: number; name: string };
}

export class VendorApi {

  public async create ( data: CreateVendorRequest ): Promise<{ body: CreateVendorResponse}> {
    return await request.post( 
      '/vendors', 
      {
        body: data 
      }
    ) as Promise<{ body: CreateVendorResponse }>;
  }

  public async update ( id: string, data: UpdateVendorRequest ): Promise<{ body: UpdateVendorResponse}> {
    return await request.put( 
      `/vendors/${id}`, 
      {
        body: data 
      }
    ) as Promise<{ body: UpdateVendorResponse }>;
  }
  

  public async createOrder ( vendorId: Vendor['id'], data: CreateOrderRequest ): Promise<{ body: CreateVendorResponse}> {
    return await request.post( 
      `/vendors/${vendorId}/orders`, 
      {
        body: data 
      }
    ) as Promise<{ body: CreateOrderResponse }>;
  }

  public async importCatalog ( 
    id: string,
    file: File,
  ): Promise<{
    updatedPacks: ImportPackDto[];
    newPacks: ImportPackDto[];
  }> {
    const formData = new FormData();
    formData.append( 'file', file );

    const response = await fetch( 
      `/api/vendors/${id}/catalog`, 
      {
        method: 'POST',
        body: formData,
      }
    );

    return await response.json();
  }

  public async confirmImport ( id: string, pack: ImportPackDto ): Promise<void> {
    await request.post( 
      `/vendors/${id}/confirmImport`, 
      {
        body: pack 
      }
    );
    return;
  }
  

}