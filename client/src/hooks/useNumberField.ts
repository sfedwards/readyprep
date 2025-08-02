import { useState } from 'react';

interface Field {
  value: string;
  error: boolean;
  helperText: string;
  onChange: ( e: any ) => void;
  toJSON: () => number|undefined;
  [Symbol.toPrimitive]: () => number;
}

export const useNumberField = ( setHasChanged?: ( hasChanges: boolean ) => void, isInteger = false ): [ Field, ( value: string|number ) => void ] => {
  const [ field, setField ] = useState( { value: '', error: false, helperText: '' } );

  const setToValue = ( value: string|number ): void => {
    setHasChanged?.( true );
    if ( value === null || value === undefined )
      value = '';
    if ( (value && value !== '.' && +`${+value}` !== +value) || (isInteger && ! Number.isInteger( +value )) )
      return setField( { ...field, value: `${value}`, error: true, helperText: `Must be ${isInteger ? 'an integer' : 'a number'}` } );
    else
      setField( { ...field, value: `${value}`, error: false, helperText: '' } );
    
  };

  const toJSON = ( ): number|undefined => ( field.value === '' || Number.isNaN( +field.value ) ) ? undefined : +field.value;

  return [
    {
      ...field,
      onChange: ( e: any ) => setToValue( e.target.value ),
      toJSON: toJSON,
      [Symbol.toPrimitive]: () => +field.value,
    },
    setToValue,
  ];
};
