import { Ingredient } from '../models/Ingredient';

export interface InvoiceForm {
  vendorId: string;
  number: string;
  date: string;
  items: {
    ingredient: Ingredient;
    catalogNumber: string;
    packs: number;
    paid: number;
  }[];
  updateCatalogPrices: boolean;
}