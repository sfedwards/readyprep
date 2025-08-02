import {
  IsString,
  ValidateNested,
  IsArray,
  ArrayMaxSize,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class Section {
  @IsString()
  readonly name: string;

  @IsNumber({}, { each: true })
  @ArrayMaxSize(100)
  readonly items: number[];
}

export class UpdateMenuRequest {
  @IsString()
  readonly name: string;

  @ValidateNested()
  @IsArray()
  @ArrayMaxSize(20)
  @Type(() => Section)
  readonly sections: Section[];
}

export class UpdateMenuResponse {}
