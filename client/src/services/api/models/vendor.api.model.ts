export interface Vendor {
  id: string;
  name: string;
  accountNumber: string;
  orderMethod: 'email' | 'manual';
  includePricesOnPurchaseOrders: boolean;
  primaryContact: {
    name: string;
    email: string;
    officePhone: string;
    mobilePhone: string;
  }
  address: {
    street1: string;
    street2: string;
    city: string;
    state: string;
    zip: string;
  }
}
