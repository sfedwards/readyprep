export interface GetInventoryResponse extends Array<GetInventoryResponseRow> {

}

interface GetInventoryResponseRow {
  ingredient: {
    id: number;
    name: string;
  };
  quantity: number;
  unit: string;
}
