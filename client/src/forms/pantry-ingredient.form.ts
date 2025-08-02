import * as yup from 'yup';
import { Unit } from '../models/Unit';

export interface PantryIngredientForm {
  name: string;
  orderFrequency?: number | null | string;
  unit?: Unit;
  waste?: number;
}

export const pantryIngredientFormSchema = yup.object().shape({
  name: yup.string(),
  orderFrequency: yup.number().optional().nullable().transform((value, originalValue) => (String(originalValue).trim() === '' ? null : value)),
  waste: yup.number().optional().nullable().transform((value, originalValue) => (String(originalValue).trim() === '' ? null : value)),
});