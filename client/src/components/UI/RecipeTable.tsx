import { Box, Checkbox, CircularProgress, IconButton, InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, makeStyles, useMediaQuery, useTheme } from '@material-ui/core';
import { CheckCircleOutline, Clear } from '@material-ui/icons';
import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Ingredient } from '../../models/Ingredient';
import { RecipeIngredient } from '../../models/RecipeIngredient';
import { Unit } from '../../models/Unit';
import request from '../../util/request';
import { Button } from './Button';
import { DeleteButton } from './DeleteButton';
import { IngredientInput } from './IngredientInput';
import { PopupNotification } from './PopupNotification';
import { TextInput } from './TextInput';
import { UnitInput } from './UnitInput';
import { WarningIcon } from './WarningIcon';

export interface RecipeTableProps {
  rows: RecipeIngredient[];
  units?: Unit[];
  onChange: ( rows: RecipeIngredient[] ) => void;
  onClickIngredientName?: ( id: Ingredient['id'] ) => void;
  getCost?: ( id: Ingredient['id'], amount: number, unit: string, waste?: number ) => Promise<number>;
  IngredientSelectorComponent?: React.ComponentType<any>;
  fake?: boolean
}

export const RecipeTable = ( props: RecipeTableProps ): ReactElement => {
  const { t } = useTranslation();
  const { rows, onChange } = props;

  const theme = useTheme();
  const isLargeScreen = useMediaQuery( theme.breakpoints.up( 'sm' ) );
  const stacked = ! isLargeScreen;

  const handleChange = ( recipeIngredient: RecipeIngredient, key: string, i: number ): void => {
    const newRows = [ ...rows ];
    newRows[i] = { ...recipeIngredient, key };
    onChange( newRows );
  };

  const handleDelete = ( i: number ): void => {
    const newRows = [ ...rows ];
    newRows.splice( i, 1 );
    onChange( newRows );
  };
  
  const handleConfirmNewRow = useCallback( ( ) => {
    const newRows = [ ...rows ];
    newRows.push( { key: ''+Math.random() } );
    onChange( newRows );
  }, [ rows, onChange ] );

  useEffect( () => {
    if ( rows.length === 0 )
      handleConfirmNewRow();
  }, [ rows, handleConfirmNewRow ] );

  return (
    <TableContainer>
      <Table className="RecipeTable" style={{ tableLayout: 'fixed' }}>
        <TableHead>
          <TableRow>
            { stacked ||
              <TableCell style={{ width: '30%' }}>
                <Typography variant="subtitle1">{ t( 'strings.ingredient' ) }</Typography>
              </TableCell>
            }
            <TableCell style={{ width: stacked ? '22%' : '14%' }}>
              <Typography align="center" variant="subtitle1">{ t( 'strings.amount' ) }</Typography>
            </TableCell>
            <TableCell>
              <Typography align="center" variant="subtitle1">{ t( 'strings.unit-of-measure-acronymn' ) }</Typography>
            </TableCell>
            <TableCell style={{ width: stacked ? '22%' : '14%' }}>
              <Typography align="center" variant="subtitle1">{ t( 'strings.waste' ) }</Typography>
            </TableCell>
            <TableCell style={{ width: stacked ? '16%' : '10%' }}>
              <Typography align={ stacked ? 'left' : 'right' } variant="subtitle1">{ t( 'strings.cost' ) }</Typography>
            </TableCell>
            { stacked || <TableCell style={{ width: '14%' }}></TableCell> }
          </TableRow>
        </TableHead>
        <TableBody>
          {
            rows.map( ( { key, ...recipeIngredient }, i ) => {
              const { ingredient, amount, unit, waste, cost } = recipeIngredient;
              return (
                <RecipeIngredientRow
                  key={key}
                  recipeIngredient={{
                    ingredient,
                    amount,
                    unit,
                    waste,
                    cost,
                  }}
                  newRow={i === rows.length - 1}
                  onChange={ ( recipeIngredient: any ) => handleChange( recipeIngredient, key, i ) }
                  onDelete={ ( ) => handleDelete( i ) }
                  onConfirmNewRow={ handleConfirmNewRow }
                  units={props.units}
                  getCost={props.getCost}
                  IngredientSelectorComponent={ props.IngredientSelectorComponent }
                  stacked={stacked}
                  fake={props.fake}
                />
              );
            } )
          }
        </TableBody>
      </Table>
    </TableContainer>
  );
};

interface RecipeIngredientRowProps {
  units?: Unit[];
  recipeIngredient: Omit< RecipeIngredient, 'key' >;
  newRow?: boolean;
  onClickIngredientName?: ( id: Ingredient['id'] ) => void;
  onChange?: ( recipeIngredient: Omit< RecipeIngredient, 'key' > ) => void;
  onDelete?: ( ) => void;
  onConfirmNewRow?: ( ) => void;
  getCost?: ( id: Ingredient['id'], amount: number, unit: string, waste?: number ) => Promise<number>;
  IngredientSelectorComponent?: React.ComponentType<any>;
  stacked: boolean
  fake?: boolean
}

const useRowStyles = makeStyles( theme => ( {
  newRowButton: ( { isCompleted }: { isCompleted?: boolean } ) => ( {
    ...isCompleted
      ?
      {
        background: isCompleted ? theme.palette.primary.main : 'none',
        borderRadius: 8,
        color: '#fff',
        '&:hover.MuiIconButton-root': {
          background: theme.palette.primary.dark,
        },
      }
      :
      {
        cursor: 'default',
        '&:hover': {
          background: 'none',
        },
      },
  } ),
} ) );

const RecipeIngredientRow = ( props: RecipeIngredientRowProps ): ReactElement => {
  const { newRow, stacked } = props;
  const { ingredient, amount, unit, waste } = props.recipeIngredient;
  const id = ingredient?.id;
  const name = ingredient?.name;
  
  const { t } = useTranslation();

  const amountHasError = !!( amount && +`${+amount}` !== +amount );
  const wasteHasError = !!( waste && ( +`${+waste}` !== +waste || +waste < 0 || +waste >= 100 ) );

  const [ cost, setCost ] = useState( props.recipeIngredient.cost );
  const [ showingCreationPopup, setShowingCreationPopup ] = useState( false );
  const [ showingMissingDataPopup, setShowingMissingDataPopup ] = useState( false );

  const isCompleted = !!(id && name && amount && unit && ! amountHasError && ! wasteHasError)
  const classes = useRowStyles( { isCompleted } );

  useEffect( ( ) => {
    if ( cost !== undefined )
      props.onChange?.( { ...props.recipeIngredient } );
  }, [ cost ] );

  const updateCost = async ( id?: Ingredient['id'], amount?: string, unit?: string, waste?: string ): Promise<void> => {
    setCost( undefined );

    if ( ! id || ! amount || ! unit )
      return;
    
    try {
      const cost = await props.getCost?.( id, +amount, unit, +( waste || 0 ) );
      setCost( cost );
    } catch ( e ) {
      // Do nothing
    }
  };

  const handleSelectIngredient = ( ingredient: Ingredient ): void => {
    props.onChange?.( { ...props.recipeIngredient, ingredient } );
    updateCost( id, amount, unit, waste );
  };

  const handleCreateIngredient = async ( ingredient: Partial<Ingredient> ): Promise<void> => {
    const body = { name: ingredient.name };
    if ( ! props.fake ) {
      const { body: { id, name } } = await request.post( `/${ingredient.type}`, { body } );
      ingredient.id = id;
    } else {
      ingredient.id = Math.random();
    }
    if ( window.localStorage.getItem( 'SUPRESS_INGREDIENT_CREATION_POPUP' ) !== '1' )
      setShowingCreationPopup( true );
    handleSelectIngredient( ingredient as Ingredient );
  };

  const handleChangeAmount = ( amount: string ): void => {
    props.onChange?.( { ...props.recipeIngredient, amount } );
    updateCost( id, amount, unit, waste );
  };

  const handleChangeUnit = ( unit: Unit ): void => {
    props.onChange?.( { ...props.recipeIngredient, unit: unit.symbol } );
    updateCost( id, amount, unit.symbol, waste );
  };
  
  const handleChangeWaste = ( waste: string ): void => {
    props.onChange?.( { ...props.recipeIngredient, waste } );
    updateCost( id, amount, unit, waste );
  };

  const handleCheckHideCreationPopup = ( event: any ): void => {
    const checked = event.target.checked;
    window.localStorage.setItem( 'SUPRESS_INGREDIENT_CREATION_POPUP', '' + +checked );
  };

  const nameCellContents =
    newRow
      ? <IngredientInput value={name ?? ( stacked ? 'Add Ingredient' : '' )} IngredientSelectorComponent={ props.IngredientSelectorComponent } onSelect={ handleSelectIngredient } onCreate={ handleCreateIngredient } />
      : ingredient?.deleted
        ? <>{name}</>
        : <Link to={{ pathname: `/${ingredient?.type}/${ingredient?.id}`, state: { previousTitle: document.title } }}>{name}</Link>
  ;
  const nameCell = stacked
    ? <TableCell colSpan={2} style={{ border: 'none' }}>{ nameCellContents }</TableCell>
    : <TableCell>{ nameCellContents }</TableCell>
  ;

  const actionCellContents =
    <Box textAlign="right">
      { newRow && ( id || amount || unit || waste ) &&
      <IconButton style={{ cursor: 'pointer' }} onClick={ () => props.onDelete?.() }><Clear /></IconButton>
      }
      {
        newRow
          ? <IconButton { ... isCompleted ? { tabIndex: 0 } : { tabIndex: -1 } } className={classes.newRowButton} onClick={ () => isCompleted && props.onConfirmNewRow?.() }><CheckCircleOutline /></IconButton>
          : <DeleteButton mild={true} onClick={ () => props.onDelete?.() } />
      }
    </Box>
  ;
  const actionCell = stacked
    ? <TableCell colSpan={2} style={{ border: 'none' }}>{ actionCellContents }</TableCell>
    : <TableCell>{ actionCellContents }</TableCell>
  ;

  return ( <>
    { stacked &&
      <TableRow style={{ backgroundColor: ingredient?.deleted ? '#faeaec' : '#ffffffdd' }}>
        { nameCell }
        { actionCell }
      </TableRow>
    }
    <TableRow style={{ backgroundColor: ingredient?.deleted ? '#faeaec' : '#ffffffdd' }}>
      { stacked || nameCell }
      <TableCell style={ stacked ? { paddingBottom: 16 } : { } }>
        <Box maxWidth={120} margin="auto" display="flex" justifyContent="center" alignItems="center">
          <TextInput placeholder="Amount" fullWidth size="small" value={amount} error={amountHasError} onChange={ ( e: any ) => handleChangeAmount( e.target.value ) }/>
        </Box>
      </TableCell>
      <TableCell style={ stacked ? { paddingBottom: 16 } : { } }>
        <Box minWidth={120} margin="auto">
          <UnitInput units={props.units} TextInputProps={{ label: '', size: 'small' }} value={unit} onSelect={ handleChangeUnit } onCreateNewUnit={ () => {} } />
        </Box>
      </TableCell>
      <TableCell style={ stacked ? { paddingBottom: 16 } : { } }>
        <Box maxWidth={120} margin="auto" display="flex" justifyContent="center" alignItems="center">
          <TextInput
            placeholder="Waste"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end" style={{ pointerEvents: 'none' }}>%</InputAdornment>
              ),
            }}
            size="small"
            value={waste}
            error={wasteHasError}
            onChange={ ( e: any ) => handleChangeWaste( e.target.value ) }
          />
        </Box>
      </TableCell>
      <TableCell style={ stacked ? { paddingRight: 24, paddingBottom: 16 } : { } }>
        <Box textAlign={ stacked ? 'left' : 'right' } whiteSpace="nowrap">
          { isCompleted ? cost == null ? <Box onClick={ ( ) => setShowingMissingDataPopup( true ) } style={{ cursor: 'pointer' }}><WarningIcon tooltip={ t( 'strings.missing-conversion', { name, amount, unit } ) } /></Box> : cost != null ? '$' + cost.toFixed( 2 ) : <CircularProgress /> : ' -- ' }
        </Box>
      </TableCell>
      { stacked || actionCell }
    </TableRow>
    <PopupNotification maxWidth={300} open={ showingCreationPopup } title="Ingredient draft created!" onClose={ ( ) => setShowingCreationPopup( false ) }>
      <Box pt={1} pb={2}>
        <Typography variant="body2">Please make sure you complete it so we can calculate cost and usage.</Typography>
      </Box>
      <Button onClick={ ( ) => setShowingCreationPopup( false ) } text="Ok, clear"></Button>
      <Box py={1} display="flex" justifyContent="center" alignItems="center">
        <Checkbox onChange={ handleCheckHideCreationPopup } /><Typography>Don't show this again</Typography>
      </Box>
    </PopupNotification>
    <PopupNotification maxWidth={444} open={ showingMissingDataPopup } onClose={ ( ) => setShowingMissingDataPopup( false ) }>
      <Box textAlign="left">
        <Typography variant="body2">Calculation of cost requires additional data for "{name}"</Typography>
      </Box>
      <Box pt={2} pb={2} textAlign="left">
        <Typography>After saving recipe, click on "{ name }" to make required changes including UOM conversions.</Typography>
      </Box>
      <Button onClick={ ( ) => setShowingMissingDataPopup( false ) } text="Ok, clear"></Button>
    </PopupNotification>
  </> );
};

