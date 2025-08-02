import { Ingredient } from "../../../../models/Ingredient";
import { Order } from "../../models/order.api.model";
import { Vendor } from "../../models/vendor.api.model";

export interface UpdateInvoiceRequest {
  vendorId: Vendor['id'];
  number: string;
  date: string;
  orderId?: Order['id'];
  items: {
    ingredientId: Ingredient['id'];
    catalogNumber: string;
    packs: number;
    paid?: number;
  }[];
}

export interface UpdateInvoiceResponse { 
  
}