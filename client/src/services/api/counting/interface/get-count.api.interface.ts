export interface GetCountResponse {
  date: string;
  countingListId: string;
  items: {
    ingredient: {
      id: number;
      name: string;
    };
    theoreticalQuantity: number;
    unit: string;
    actualQuantity: number;
  }[];
}