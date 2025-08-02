export interface VendorItem {
  id: string;
  pantryIngredient: {
    id: string;
    scopedId: string;
    name: string;
  };
  catalogNumber: string;
  price: number,
  numItems: number,
  amountPerItem: number,
  unit: string,
}
