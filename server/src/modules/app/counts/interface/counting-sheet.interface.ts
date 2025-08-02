export interface CountingSheet {
  date: Date;
  ingredients: {
    name: string;
    unit: string;
  }[];
}
