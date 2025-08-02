import { Vendor } from '../../models/vendor.api.model';

export interface ListVendorsResponse {
  numPages: number;
  vendors: Vendor[];
}
