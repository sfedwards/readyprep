import React, { useContext } from 'react';

import { IngredientsApi } from '../ingredients/ingredients.api';

const IngredientsApiContext = React.createContext(new IngredientsApi());

export const IngredientsApiProvider = IngredientsApiContext.Provider;
export const useIngredientsApi = () => useContext(IngredientsApiContext);
