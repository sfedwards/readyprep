import { EntityRepository, Repository } from 'typeorm';
import { PrepIngredient } from './prep-ingredient.entity';

@EntityRepository(PrepIngredient)
export class PrepIngredientRepository extends Repository<PrepIngredient> {}
