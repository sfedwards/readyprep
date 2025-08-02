import { IsDateString, IsUUID, ValidateNested } from 'class-validator';

export class GetCountResponseDto {
  @IsDateString()
  date: string;

  @IsUUID()
  countingListId: string;

  @ValidateNested()
  items: GetCountResponseDtoRow[];
}

export class GetCountResponseDtoRow {
  ingredient: {
    id: number;
    name: string;
  };
  theoreticalQuantity: number;
  unit: string;
  actualQuantity: number;
}
