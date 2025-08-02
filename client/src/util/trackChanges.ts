export const trackChanges = <T, V = T | any>( [ value, setValue ]: [ V, ( newValue: T ) => void ], setHasChanges: ( hasChanges: boolean ) => void ): [ V, ( newValue: T ) => void ] => {
  const wrappedSetter = ( newValue: T ): void => {
    if ( newValue !== value as unknown as T )
      setHasChanges( true );
    setValue( newValue );
  };

  return [ value, wrappedSetter ];
};
