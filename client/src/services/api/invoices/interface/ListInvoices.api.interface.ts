import { Invoice } from '../../models/invoice.api.model';

export interface ListInvoicesResponse {
  numPages: number;
  invoices: Invoice[];
}
