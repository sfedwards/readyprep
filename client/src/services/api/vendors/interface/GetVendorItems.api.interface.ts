import { VendorItem } from '../../models/vendor-item.api.model';

export interface GetVendorItemsResponse {
  numPages: number;
  items: VendorItem[];
}
