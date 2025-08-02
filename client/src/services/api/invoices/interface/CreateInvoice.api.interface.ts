export interface CreateInvoiceRequest {
  vendorId: string;
  number: string;
  date: string;
  items: {
    ingredientId: number;
    catalogNumber: string;
    packs: number;
    paid?: number;
  }[];
}

export interface CreateInvoiceResponse {
  id: string;
}