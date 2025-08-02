export class CountingListDto {
  id: string;
  name: string;
  isDefault: boolean;
  items: {
    ingredient: {
      id: number;
      name: string;
      type: 'pantry' | 'prep';
    };
    unit: string;
  }[];
}
