export interface Order {
  id: string;
  number: string;
  createdAt: Date;
  cost: number;
  state: string;
  vendor: {
    id: string;
    name: string;
  };
  invoiceId: string;
  items: {
    packId: string;
    packs: number;
    price: number;
  }[];
}
