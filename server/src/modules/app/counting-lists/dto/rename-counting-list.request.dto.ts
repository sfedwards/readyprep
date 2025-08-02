import { IsString, MaxLength, MinLength } from 'class-validator';

export class RenameCountingListRequestDto {
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  name: string;
}
