export interface CreateOrderRequest {
  items: {
    packId: string;
    packs: number;
    price: number;
  }[];
}

export interface CreateOrderResponse {
  id: string;
}