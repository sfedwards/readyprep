export interface Ingredient {
  id?: number;
  name: string;
  type: 'prep'|'pantry';
  deleted?: boolean;
}
