import { Vendor } from "../../models/vendor.api.model";

export interface CreateVendorRequest extends Omit<Partial<Vendor>, 'id'> {
  name: Vendor['name'];
}

export interface CreateVendorResponse {
  id: string;
}