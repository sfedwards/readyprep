export interface IngredientDto {
  id: number;
  type: 'prep' | 'pantry';

  name: string;
  standardUnit: string;

  unitConversions: {
    from: {
      amount: number;
      unit: string;
    };
    to: {
      amount: number;
      unit: string;
    };
  }[];
}
