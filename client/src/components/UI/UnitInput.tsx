import { MenuItem } from '@material-ui/core';
import React, { ReactElement, useRef, useState } from 'react';
import { TextInput, TextInputProps } from './TextInput';
import { Types, Unit } from '../../models/Unit';

import UnitSelector from '../src/UnitSelector';
import { useTranslation } from 'react-i18next';

export type UnitInputProps = {
  TextInputProps?: TextInputProps;
  units?: Unit[];
  excludedUnits?: Unit[];
  allowedTypes?: Types[];
  allowedWellDefinedTypes?: Types[];
  value?: string;
  size?: string;
  onSelect: ( unit: Unit ) => void;
  onCreateNewUnit?: ( symbol: Unit['symbol'], type: Unit['type'] ) => void;
} & Omit<TextInputProps, 'onSelect'>;

export const UnitInput = ( props: UnitInputProps ): ReactElement => {
  const { t } = useTranslation();
  const [ showingUnitSelector, setShowingUnitSelector ] = useState( false );
  const unitSelectorAnchorRef = useRef( null );
  const uom = props.value;
  const placeholder = props.placeholder ?? 'unit';
  const [ initialQuery, setInitialQuery ] = useState( '' );

  return (
    <div style={{ flex: 1 }} ref={unitSelectorAnchorRef}>
      <TextInput size={props.size} label={props.label ?? t( 'strings.unit-of-measure-acronymn' )} select SelectProps={{
        open: false,
        onOpen: () => setShowingUnitSelector( true ),
        onKeyPress: ( e: any ) => {
          if ( /^[a-z]/i.test( e.key ) ) {
            setInitialQuery( e.key );
            setShowingUnitSelector( true );
            e.preventDefault();
          }
        },
      }} {...props.TextInputProps || {}} value={uom || ''}>
        <MenuItem key={uom||''} value={uom || placeholder}>{uom || placeholder}</MenuItem>
      </TextInput>
      <UnitSelector
        units={ props.units }
        allowedTypes={ props.allowedTypes }
        showing={ showingUnitSelector }
        anchorEl={ unitSelectorAnchorRef.current }
        onSelect={( unit: Unit ) => {
          setShowingUnitSelector( false ); props.onSelect( unit );
        } }
        onClose={ () => setShowingUnitSelector( false ) }
        onCreateNewUnit={ props.onCreateNewUnit }
        initialQuery={ initialQuery }
      />
    </div>
  );
};
