import { VendorItem } from "../../models/vendor-item.api.model";

export interface UpdateVendorItemRequest extends Omit<VendorItem, 'id' | 'pantryIngredient'>  {
  pantryIngredientId: string;
}

export interface UpdateVendorItemResponse { 
  
}