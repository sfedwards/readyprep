import { Invoice } from '../entities';

export class GetInvoiceResponseDTO {
  id: string;
  vendorId: string;
  number: string;
  date: string;

  totalPaid: number;

  items: {
    id: string;
    ingredient: {
      id: number;
      name: string;
    };
    catalogNumber: string;
    packs: number;
    paid: number;
  }[];

  constructor(invoice: Invoice) {
    const { id, vendorId, number, date, totalPaid } = invoice;

    Object.assign(this, { id, vendorId, number, date, totalPaid });

    this.items = invoice.items.map((item) => ({
      id: item.id,
      ingredient: {
        id: item.pack.pantryIngredient.scopedId,
        name: item.pack.pantryIngredient.name,
      },
      catalogNumber: item.pack.catalogNumber,
      packs: item.numPacks,
      paid: item.pricePaid,
    }));
  }
}
