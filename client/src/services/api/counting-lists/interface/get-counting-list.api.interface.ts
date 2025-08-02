export interface GetCountingListResponse {
  name: string;
  isDefault: boolean;
  items: {
    ingredient: {
      id: number;
      name: string;
      type: 'prep' | 'pantry';
    };
    unit: string;
  }[];
}