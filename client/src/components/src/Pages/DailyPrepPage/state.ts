import { atom, atomFamily, selector } from 'recoil';

export interface PrintRecipesDialogRow {
  id: string,
  name: string,
  include: boolean,
  batchSize: number,
  batchUnit: string,
  batches: string,
}

export interface PrintRecipesDialogState {
  selectAll: boolean;
  recipes: PrintRecipesDialogRow[];
}

export const prepList = atom<string[]>( {
  key: 'DailyPrep/item',
  default: [ ],
} );

export const prepOverride = atomFamily<{ inventory: string|null, prep: string|null }, string>( {
  key: 'DailyPrep/overrides',
  default: ( id: string ) => ( {
    inventory: null,
    prep: null,
  } ),
} );

export const printRecipeCount = atom( {
  key: 'DailyPrep/PrintRecipes/count',
  default: 0,
} );

export const printRecipeInclude = atomFamily<boolean, number>( {
  key: 'DailyPrep/PrintRecipes/include',
  default: true,
} );

export const printRecipeBatches = atomFamily<string, number>( {
  key: 'DailyPrep/PrintRecipes/batches',
  default: '',
} );

export enum Seen {
  None = 0,
  False = 1,
  True = 2,
  Both = 3,
}

export const selectAll = selector<number>( {
  key: 'DailyPrep/PrintRecipes/selectAll',
  get: ( { get } ) => {
    const count = get( printRecipeCount );
    let seen = 0;
    for ( let i = 0; i < count && seen !== Seen.Both; i++ )
      seen |= 1 + +get( printRecipeInclude( i ) );
    
    return seen;
  },
} );
