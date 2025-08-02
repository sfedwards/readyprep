import { useState, useEffect } from 'react';

export const useTemporarilyTrueState = ( initialState = false, minimumDuration = 500 ): [ boolean, ( newState: boolean ) => void ] => {
  const [ state, setState ] = useState( initialState );
  const [ recentlyTrue, setRecentlyTrue ] = useState( initialState );

  useEffect( () => {
    if ( state )
      return setRecentlyTrue( true );
    const timer = setTimeout( () => setRecentlyTrue( false ), minimumDuration );
    return () => clearTimeout( timer );
  }, [ state ] );

  return [ state || recentlyTrue, setState ];
};
