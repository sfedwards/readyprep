import { Vendor } from "../../models/vendor.api.model";

export interface UpdateVendorRequest extends Omit<Vendor, 'id'>  {
  
}

export interface UpdateVendorResponse { 
  
}