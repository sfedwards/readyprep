import { Box, Button, Dialog, DialogContent, makeStyles, useTheme } from '@material-ui/core';
import { CheckCircleOutline, Clear } from '@material-ui/icons';
import { Alert } from '@material-ui/lab';
import React, { ReactElement, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useNumberField } from '../../hooks/useNumberField';
import { Unit } from '../../models/Unit';
import request from '../../util/request';
import { TextInput } from './TextInput';
import { UnitInput } from './UnitInput';

interface EditUnitDialogProps {
  onConfirm: ( unit: Unit ) => void;
  onClose: ( ) => void;
  showing: boolean;
  unit?: Unit;
}

const useStyles = makeStyles( theme => ( {
  root: {
  },
  title: {
    flex: 1,
    display: 'flex',
    alignItems: 'flex-end',
    color: theme.palette.primary.main,
    fontWeight: 400,
    fontSize: '2rem',
    paddingBottom: 16,
    [theme.breakpoints.down( 'sm' )]: {
      fontSize: '1.5rem',
    },
  },
  content: {
    textAlign: 'center',
    padding: '0 24px',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  buttons: {
    width: '100%',
    padding: 0,
    display: 'flex',
    '& button': {
      flex: 1,
      borderRadius: 0,
      border: 0,
      color: '#fff',
      padding: 16,
      '& .MuiSvgIcon-root': {
        marginRight: 8,
      },
    },
  },
  cancelButton: {
    background: theme.palette.secondaryGray.main,
    '&:hover': {
      backgroundColor: theme.palette.primaryGray.main,
    },
  },
  confirmButton: {
    background: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
} ) );

export const EditUnitDialog = ( props: EditUnitDialogProps ): ReactElement => {
  const theme = useTheme();
  const classes = useStyles( theme );
  const { t } = useTranslation();

  const id = props.unit?.id ? props.unit.id : 'new';
  const [ name, setName ] = useState( '' );
  const [ symbol, setSymbol ] = useState( '' );
  const [ amount, setAmount ] = useNumberField( );
  const [ unit, setUnit ] = useState<string>( );
  const [ error, setError ] = useState( '' );

  const handleConfirm = async ( ): Promise<void> => {
    try {
      if ( id === 'new' ) {
        const body = { name, symbol, amount, unit };
        const newUnit = await request.post( '/units', { body } );
        props.onConfirm( { id: newUnit.id, name, symbol, wellDefined: !!( amount && unit ) } );
      } else {
        const body = { name, symbol, amount, unit };
        await request.put( `/units/${id}`, { body } );
        props.onConfirm( { id, name, symbol, wellDefined: !!( amount && unit ) } );
      }
    } catch ( err: any ) {
      setError( err.message );
    }
  };

  useEffect( () => {
    if ( ! props.showing )
      return;

    setError( '' );
      
    if ( ! props.unit ) {
      setName( '' );
      setSymbol( '' );
      setAmount( '' );
      setUnit( '' );
      return;
    }

    const { name, symbol, amount, unit } = props.unit;
    setName( name );
    setSymbol( symbol );
    setAmount( amount?.toFixed( 4 ).replace( /\.0*$/, '' ) ?? '' );
    setUnit( ( unit as string ) ?? '' );
  }, [ props.showing ] );

  return (
    <Dialog
      open={props.showing}
      onClose={props.onClose}
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
      className={classes.root}
      fullWidth
      maxWidth="sm"
    >
      <Box display="flex" flexDirection="column" alignItems="center" py={3}>
        <div className={classes.title} id="dialog-title">
          {
            props.unit?.id
              ? `${t( 'strings.edit' )} ${t( 'strings.unit' )}`
              : `${t( 'strings.create-new-unit' )}`
          }
        </div>
        <DialogContent className={classes.content}>
          { error && <Alert severity="error">{ error }</Alert> }
          <Box flex={1} display="flex">
            <Box flex={3} mx={1}>
              <TextInput label={ `${t( 'strings.name' )}*` } value={ name } onChange={ ( e: any ) => setName( e.target.value ) } autoFocus />
            </Box>
            <Box flex={1} mx={1}>
              <TextInput label={ `${t( 'strings.symbol' )}*` } value={ symbol } onChange={ ( e: any ) => setSymbol( e.target.value ) } />
            </Box>
          </Box>
          <Box flex={1} display="flex">
            <Box flex={1} mx={1}>
              <TextInput label={`${t( 'strings.base' )} ${t( 'strings.amount' )}`} { ...amount } />
            </Box>
            <Box flex={3} mx={1}>
              <UnitInput TextInputProps={{ label: `${t( 'strings.base' )} ${t( 'strings.unit' )}` }} value={ unit } onSelect={ ( unit: Unit ) => setUnit( unit.symbol ) } onCreateNewUnit={ () => {} } />
            </Box>
          </Box>
        </DialogContent>
      </Box>
      <div className={classes.buttons}>
        <Button onClick={props.onClose} className={classes.cancelButton} autoFocus>
          <Clear />{t( 'strings.cancel' )}
        </Button>
        <Button onClick={ handleConfirm } className={classes.confirmButton}>
          <CheckCircleOutline />{ props.unit?.id ? t( 'strings.save' ) : t( 'strings.create' ) }
        </Button>
      </div>
    </Dialog>
  );
};
