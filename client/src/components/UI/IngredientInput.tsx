import { MenuItem, TextField } from '@material-ui/core';
import React, { ReactElement, useRef, useState } from 'react';

import { Ingredient } from '../../models/Ingredient';
import IngredientSelector from '../src/IngredientSelector';
import { TextInputProps } from './TextInput';
import { useTranslation } from 'react-i18next';

export type IngredientInputProps = {
  value?: string;
  onCreate: ( ingredient: Partial<Ingredient> ) => void;
  onSelect: ( ingredient: Ingredient ) => void;
  IngredientSelectorComponent?: React.ComponentType<any>;
  type?: 'pantry' | 'prep';
} & Omit<TextInputProps, 'onSelect'>;

export const IngredientInput = ( props: IngredientInputProps ): ReactElement => {
  const { t } = useTranslation();
  const [ showingIngredientSelector, setShowingIngredientSelector ] = useState( false );
  const unitSelectorAnchorRef = useRef( null );
  const { value } = props;
  const [ initialQuery, setInitialQuery ] = useState( '' );

  const IngredientSelectorComponent = props.IngredientSelectorComponent ?? IngredientSelector;

  return (
    <div ref={unitSelectorAnchorRef}>
      <TextField style={props.style} fullWidth size="small" variant="outlined" placeholder={t( 'strings.ingredient' )} value={value || ''} select SelectProps={{
        open: false,
        onOpen: () => setShowingIngredientSelector( true ),
        onKeyPress: ( e: any ) => {
          if ( /^[a-z]/i.test( e.key ) ) {
            setInitialQuery( e.key );
            setShowingIngredientSelector( true );
            e.preventDefault();
          }
        },
      }}>
        <MenuItem value={value||''}>{value}</MenuItem>
      </TextField>
      <IngredientSelectorComponent
        showing={showingIngredientSelector}
        anchorEl={ unitSelectorAnchorRef.current }
        onSelect={( ingredient: Ingredient ) => {
          setShowingIngredientSelector( false ); props.onSelect( ingredient );
        }}
        onCreate={( ingredient: Partial<Ingredient> ) => {
          setShowingIngredientSelector( false ); props.onCreate( ingredient );
        }}
        onClose={() => setShowingIngredientSelector( false ) }
        initialQuery={ initialQuery }
        type={props.type}
      />
    </div>
  );
};
