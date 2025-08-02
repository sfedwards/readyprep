import { Order } from '../../models/order.api.model';

export interface ListOrdersResponse {
  numPages: number;
  orders: Order[];
}
