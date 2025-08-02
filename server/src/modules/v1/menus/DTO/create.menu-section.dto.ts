import { IsString } from 'class-validator';

export class CreateMenuSectionRequest {
  @IsString()
  readonly name: string;
}

export class CreateMenuSectionResponse {}
