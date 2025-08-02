import { Unit } from './Unit';

interface UnitAmount {
  unit?: Unit;
  amount?: string;
}

export interface Conversion {
  a: UnitAmount;
  b: UnitAmount;
}
