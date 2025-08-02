import { CreateVendorItemRequest, CreateVendorItemResponse, UpdateVendorItemRequest, UpdateVendorItemResponse } from "./vendor-items";

import request from '../../util/request';

export class VendorItemApi {

  public async create ( data: CreateVendorItemRequest ): Promise<{ body: CreateVendorItemResponse}> {
    return await request.post( 
      '/vendor-items', 
      {
        body: data 
      }
    ) as Promise<{ body: CreateVendorItemResponse }>;
  }

  public async update ( id: string, data: UpdateVendorItemRequest ): Promise<{ body: UpdateVendorItemResponse}> {
    return await request.put( 
      `/vendor-items/${id}`, 
      {
        body: data 
      }
    ) as Promise<{ body: UpdateVendorItemResponse }>;
  }

}