import React, { ReactElement } from 'react';
import { RecipeTable, RecipeTableProps } from '../UI/RecipeTable';

import { Ingredient } from '../../models/Ingredient';
import IngredientSelector from './IngredientSelector';
import request from '../../util/request';

export default ( props: RecipeTableProps ): ReactElement => {
  const getCost = async ( id: Ingredient['id'], amount: number, unit: string, waste?: number ) : Promise<number> => {
    const { body: cost } = await request.post( `/ingredients/${id}/cost`, {
      body: {
        amount,
        unit,
        waste,
      },
    } );
    return cost;
  };

  return (
    <RecipeTable
      getCost={ getCost }
      IngredientSelectorComponent={ IngredientSelector }
      { ...props}
    />
  );
};
