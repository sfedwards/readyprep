import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

import { Menu } from '../menu.entity';

export class Section {
  @IsString()
  readonly name: string;

  @IsNumber({}, { each: true })
  @ArrayMaxSize(100)
  readonly items: number[];
}

export class CreateMenuRequest {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @ValidateNested()
  @IsArray()
  @ArrayMaxSize(20)
  @Type(() => Section)
  readonly sections: Section[];
}

export class CreateMenuResponse {
  constructor(menu: Menu) {
    const { scopedId } = menu;

    Object.assign(this, {
      id: scopedId,
    });
  }
}
