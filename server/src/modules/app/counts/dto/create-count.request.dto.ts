import { IsISO8601, IsString, Length } from 'class-validator';

export class CreateCountRequestDto {
  @IsString()
  countingListId: string;

  @IsISO8601()
  @Length(10, 10)
  date: string;
}
