import { IngredientSelector, IngredientSelectorProps } from '../UI/IngredientSelector';
import React, { ReactElement, useEffect, useState } from 'react';

import { Ingredient } from '../../models/Ingredient';
import request from '../../util/request';

export default (
  props: Omit< IngredientSelectorProps, 'loading'|'onQueryChange'|'query'|'ingredients' >
): ReactElement => {
  const [ loading, setLoading ] = useState( true );
  const [ query, setQuery ] = useState( '' );
  const [ ingredients, setIngredients ] = useState<Ingredient[]>( [ ] );

  useEffect( () => {
    if ( props.showing && query === '' )
      setQuery( props.initialQuery );
  }, [ props.initialQuery, props.showing ] );

  useEffect( () => {
    ( async () => {
      const { body: res } = await request.get( `/ingredients/search?query=${query}` );
      setLoading( false );

      if ( ! props.type ) {
        setIngredients( res );
      } else {
        setIngredients( res.filter( (ingredient: Ingredient) => ingredient.type === props.type ) );
      }
    } )();
  }, [ query ] );

  return <IngredientSelector
    {...props}
    loading={loading}
    query={ query }
    onQueryChange={ ( query: string ) => setQuery( query ) }
    onClose={ () => {
      setQuery( '' ); props.onClose();
    } }
    ingredients={ingredients}
  />;
};
