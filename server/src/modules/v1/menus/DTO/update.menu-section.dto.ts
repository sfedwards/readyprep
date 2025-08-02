import { IsString } from 'class-validator';

export class UpdateMenuSectionRequest {
  @IsString()
  readonly name: string;
}

export class UpdateMenuSectionResponse {}
