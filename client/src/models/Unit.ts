export enum Types {
  WEIGHT = 'WEIGHT',
  VOLUME = 'VOLUME',
  PURE = 'PURE',
}

export interface Unit {
  id?: number;
  type?: Types;
  name: string;
  symbol: string;
  wellDefined: boolean;
  amount?: number;
  unit?: Unit|string;
  magnitude?: number;
}
