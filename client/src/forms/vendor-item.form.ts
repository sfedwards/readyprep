import * as yup from 'yup';

export interface VendorItemForm {
  catalogNumber: string;
  price: number;
  numItems: number,
  amountPerItem: number,
  unit: string,
  pantryIngredient: {
    id: string;
  };
}

export const vendorItemFormSchema = yup.object().shape({
  catalogNumber: yup.string(),
  price: yup.number(),
  numItems: yup.number(),
  amountPerItem: yup.number(),
  unit: yup.string(),
  pantryIngredient: yup.object().shape({
    id: yup.string(),
  })
});