import { IsString, ValidateNested } from 'class-validator';
import { OrderItem } from '../interface/order-item.interface';

export class CreateOrderRequestDTO {
  @ValidateNested()
  items: OrderItem[];
}

export class CreateOrderResponseDTO {
  @IsString()
  id: string;

  constructor(id: string) {
    this.id = id;
  }
}
