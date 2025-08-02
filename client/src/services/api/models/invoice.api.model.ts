import { InvoiceItem } from "./invoice-item.api.model";
import { Vendor } from "./vendor.api.model";

export interface Invoice {
  id: string;
  number: string;
  vendor: Pick<Vendor, 'id' | 'name'>,
  date: Date;
  totalPaid: number;
  items: InvoiceItem[];
}
