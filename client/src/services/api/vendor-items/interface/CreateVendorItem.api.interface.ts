import { VendorItem } from "../../models/vendor-item.api.model";

export interface CreateVendorItemRequest extends Omit<VendorItem, 'id' | 'pantryIngredient'> {
  
}

export interface CreateVendorItemResponse {
  id: string;
}