import React, { ReactElement, useEffect, useState } from 'react';

import request from '../../util/request';
import { MenuItemSelector, MenuItemSelectorProps } from '../UI/MenuItemSelector';

export default (
  props: Omit< MenuItemSelectorProps, 'loading'|'onQueryChange'|'query'|'items' > & { excludedItems?: number[] }
): ReactElement => {
  const [ loading, setLoading ] = useState( true );
  const [ query, setQuery ] = useState( '' );
  const [ items, setMenuItems ] = useState( [] );

  useEffect( () => {
    if ( ! query.trim() ) {
      setMenuItems( [] );
      return;
    }

    ( async () => {
      const { body: res } = await request.get( `/items/search?query=${query}` );
      setLoading( false );
      setMenuItems( res );
    } )();
  }, [ query ] );


  return <MenuItemSelector
    {...props}
    loading={loading}
    query={ query }
    onQueryChange={ ( query: string ) => setQuery( query ) }
    onClose={ () => {
      setQuery( '' ); props.onClose();
    } }
    items={ items.filter( ( { id } ) => ! props.excludedItems?.includes( id ) )}
  />;
};
