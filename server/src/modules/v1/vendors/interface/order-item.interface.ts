import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';
import { Pack } from '@modules/v1/ingredients/pack.entity';

export class OrderItem {
  @IsString()
  packId: Pack['id'];

  @Type(() => Number)
  @IsNumber()
  packs: number;

  @Type(() => Number)
  @IsNumber()
  price: number;
}
