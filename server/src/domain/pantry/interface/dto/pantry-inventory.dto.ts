export class PantryInventoryDTO extends Array<PantryInventoryRowDTO> {}

class PantryInventoryRowDTO {
  ingredient: {
    id: string;
    name: string;
  };
  quantity: number;
  unit: string;
}
