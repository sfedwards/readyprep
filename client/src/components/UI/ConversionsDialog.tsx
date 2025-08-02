import { AddCircleOutline, CheckCircleOutline, Clear } from '@material-ui/icons';
import { Autocomplete } from '@material-ui/lab';
import { Box, CircularProgress, Dialog, IconButton, Button as MuiButton, makeStyles, useTheme } from '@material-ui/core';
import { Graph, alg } from 'graphlib';
import React, { ReactElement, useEffect, useState } from 'react';
import { Types, Unit } from '../../models/Unit';

import { Button } from './Button';
import { Conversion } from '../../models/Conversion';
import { DeleteButton } from './DeleteButton';
import { TextInput } from './TextInput';
import { UnitInput } from './UnitInput';
import { makeQueryString } from '../../hooks/useQueryState';
import { useTranslation } from 'react-i18next';

export interface ConversionsDialogProps {
  ingredient?: string;
  units: Unit[];
  onConfirm: ( conversions: Conversion[] ) => void;
  onClose: ( ) => void;
  onCreateNewUnit: ( symbol: Unit['symbol' ], type: Unit['type'] ) => void;
  conversions: (Conversion | any)[];
  showing: boolean;
  loading: boolean;
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
    marginTop: 48,
    [theme.breakpoints.down( 'sm' )]: {
      fontSize: '1.5rem',
    },
  },
  content: {
    textAlign: 'center',
    padding: 0,
    minWidth: '90%',
  },
  buttons: {
    width: '100%',
    padding: 0,
    display: 'flex',
    alignItems: 'flex-start',
    '& button': {
      flex: 1,
      borderRadius: 0,
      border: 0,
      color: '#fff',
      padding: 16,
      '& .MuiSvgIcon-root': {
        marginRight: 8,
      },
      background: theme.palette.primary.main,
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      },
    },
    '& .cancel': {
      background: theme.palette.secondaryGray.main,
      '&:hover': {
        backgroundColor: theme.palette.primaryGray.main,
      },
    },
  },
} ) );

export const ConversionsDialog = ( props: ConversionsDialogProps ): ReactElement => {
  const theme = useTheme();
  const classes = useStyles( theme );
  const { t } = useTranslation();

  const { loading } = props;
  const [ conversions, setConversions ] = useState( [] as ( Conversion & { key: number } )[] );
  const [ fdcQuery, setFdcQuery ] = useState<string>( );
  const [ fdcFoods, setFdcFoods ] = useState( [] );
  const [ loadingFdcFoods, setLoadingFdcFoods ] = useState( false );
  const [ fdcSearchOpen, setFdcSearchOpen ] = useState( false );
  const [ loadingFdcConversions, setLoadingFdcConversions ] = useState( false );
  const [ fdcConversions, setFdcConversions ] = useState( [] );

  const addRow = (): void => {
    const newConversion = { a: {}, b: {}, key: Math.random() };
    setConversions( conversions => [ ...conversions, newConversion ] );
  };

  useEffect( () => {
    if ( ! props.showing ) {
      setFdcSearchOpen( false );
      setFdcConversions( [] );
      return;
    }

    setConversions( ( ) => {
      const conversions = props.conversions.map( conversion => ( { ...conversion, key: Math.random() } ) );

      conversions.forEach( (conversion: any) => {
        if ( conversion.amountA ) {
          conversion.a = { amount: conversion.amountA, unit: props.units.find(({ symbol }) => conversion.unitA === symbol) };
          conversion.b = { amount: conversion.amountB, unit: props.units.find(({ symbol }) => conversion.unitB === symbol) };
        }
      } );
      if ( conversions.length === 0 ) {
        const newConversion = { a: {}, b: {}, key: Math.random() };
        conversions.push( newConversion );
      }
      return conversions;
    } );

    setFdcQuery( undefined );
  }, [ props.showing ] );

  useEffect( () => {
    if ( ! fdcQuery )
      return;

    ( async ( ) => {
      setLoadingFdcFoods( true );
      setFdcFoods( [] );
      const query = fdcQuery?.replace( /[^a-zA-Z ]+/g, ' ' ).replace( /\b\w\b/g, '' ) || '';
      const qs = makeQueryString( { dataType: 'SR Legacy', query, api_key: process.env.REACT_APP_FDC_API_KEY } );
      const response = await fetch( `https://api.nal.usda.gov/fdc/v1/foods/search${qs}` );
      const { foods } = await response.json();
      setFdcFoods( foods.map( ( food: any ) => ( { name: food.description, value: food.fdcId } ) ) );
      setLoadingFdcFoods( false );
    } )();
  }, [ fdcQuery ] );

  const handleChange = ( conversion: Conversion, key: number, i: number ): void => {
    const newConversions = [ ...conversions ];
    newConversions[i] = { ...conversion, key };
    setConversions( newConversions );
  };

  const handleDelete = ( i: number ): void => {
    const newConversions = [ ...conversions ];
    newConversions.splice( i, 1 );
    setConversions( newConversions );
  };

  const startFdcSearch = ( ): void => {
    setFdcQuery( props.ingredient?.replace( /[^a-zA-Z ]+/g, ' ' ) || '' );
    setFdcSearchOpen( true );
  };

  const handleSelectFdcIngredient = async ( id?: number ): Promise<void> => {
    if ( ! id )
      return;
    setLoadingFdcConversions( true );
    const qs = makeQueryString( { api_key: process.env.REACT_APP_FDC_API_KEY } );
    const response = await fetch( `https://api.nal.usda.gov/fdc/v1/food/${id}${qs}` );
    const { foodPortions: portions } = await response.json();
    setFdcConversions( portions.map( ( portion: any ) => <div key={portion.id}>{ portion.amount } {portion.modifier} = { portion.gramWeight } g</div> ) );
    setLoadingFdcConversions( false );
  };

  return (
    <Dialog
      open={props.showing}
      onClose={props.onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      className={classes.root}
      fullWidth
      maxWidth="md"
    >
      <Box display="flex" flexDirection="column" alignItems="center">
        <div className={classes.title} id="alert-dialog-title">
          {t( 'strings.configure-conversions' )}
        </div>
        <div className={classes.content}>
          { loading
            ? <CircularProgress />
            : conversions
              ? conversions.map( ( { a, b, key }, i ) => (
                <ConversionRow
                  key={key}
                  units={props.units}
                  a={a}
                  b={b}
                  onChange={ ( conversion: Conversion ) => handleChange( conversion, key, i ) }
                  onDelete={ () => handleDelete( i ) }
                  onCreateNewUnit={ props.onCreateNewUnit }
                  allConversions={conversions}
                />
              ) )
              : null
          }
          <Box mb={2}>
            <IconButton onClick={addRow}><AddCircleOutline /></IconButton>
          </Box>
          <Box mx={0} pb={2} display="flex" alignItems="flex-start">
            <Box mr={4} flex={'0 1'}>
              <Button text={'Search\u00a0FDC\u00a0Database'} onClick={ startFdcSearch } />
            </Box>
            { fdcQuery !== undefined &&
              <Box flex={1}>
                <Autocomplete
                  style={{ marginTop: -8 }}
                  filterOptions={ ( options: any ) => options }
                  open={fdcSearchOpen}
                  inputValue={ fdcQuery }
                  onChange={ ( e: any, value: any ) => {
                    setFdcQuery( value?.name ); handleSelectFdcIngredient( value?.value );
                  } }
                  onInputChange={ ( e: any, value: any, reason ) => {
                    setFdcConversions( [] ); if ( reason !== 'reset' ) setFdcQuery( value );
                  } }
                  onOpen={() => setFdcSearchOpen( true ) }
                  onClose={() => setFdcSearchOpen( false ) }
                  getOptionSelected={( option: any, value: any ) => option.value === value.value }
                  getOptionLabel={( option: any ) => option.name}
                  options={fdcFoods}
                  loading={loadingFdcFoods}
                  renderInput={params => (
                    <TextInput
                      {...params}
                      size="small"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: ( <>
                          {loading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </> ),
                      }}
                    />
                  )}
                />
                <Box mx={0} display="flex" flexDirection="column" alignItems="flex-start">
                  {
                    loadingFdcConversions
                      ? <CircularProgress />
                      : <Box flex="0 1" textAlign="left">{ fdcConversions }</Box>
                  }
                </Box>
              </Box>
            }
          </Box>
        </div>
        <div className={classes.buttons}>
          <MuiButton className="cancel" onClick={ props.onClose } autoFocus>
            <Clear />{t( 'strings.cancel' )}
          </MuiButton>
          <MuiButton onClick={() => props.onConfirm( conversions )}>
            <CheckCircleOutline />{t( 'strings.confirm' )}
          </MuiButton>
        </div>
      </Box>
    </Dialog>
  );
};

const allTypes = [ 'WEIGHT', 'VOLUME', 'PURE' ] as ( 'WEIGHT'|'VOLUME'|'PURE' )[];

type ConversionRowProps = Conversion & {
  onChange: ( conversion: Conversion ) => void;
  onDelete: () => void;
  onCreateNewUnit: ( symbol: Unit['symbol'], type: Unit['type'] ) => void;
  units?: Unit[];
  allConversions: Conversion[];
};

const ConversionRow = ( props: ConversionRowProps ): ReactElement => {
  const { a, b, allConversions } = props;

  const nodes = [ ...allTypes.map( type => `  __${type}__  ` ), ...(props.units?.filter( unit => ! unit.wellDefined ).map( unit => unit.symbol ) ?? []) ];
  
  const unitToNode = ( unit: Unit|undefined ): string => {
    if ( ! unit )
      return '';
    const node = unit.wellDefined ? nodes[ allTypes.findIndex( type => Types[type] === unit?.type ) ] : unit.symbol;
    return node;
  };

  // Construct a graph of reachable units from any unit, excluding the current conversion
  const g = ( new Graph() );
  nodes.forEach( node => g.setNode( node ) );
  allConversions
    .filter( conversion => conversion.a.unit !== a.unit || conversion.b.unit !== b.unit )
    .forEach( ( { a, b } ) => {
      if ( ! a.unit || ! b.unit )
        return;
      const nodeA = unitToNode( a.unit );
      const nodeB = unitToNode( b.unit );
      if ( ! nodeA || ! nodeB )
        return;
      g.setEdge( nodeA, nodeB );
      g.setEdge( nodeB, nodeA );
    } )
  ;

  const components = alg.components( g );

  // Allow a unit to be converted to any unreachable type
  const { units } = props;
  const [ aNode, bNode ] = [ unitToNode( a.unit ), unitToNode( b.unit ) ];
  const aUnits = bNode ? units?.filter( unit => ! components.find( component => component.includes( unitToNode( unit ) ) )?.includes( bNode ) ) : units;
  const bUnits = aNode ? units?.filter( unit => ! components.find( component => component.includes( unitToNode( unit ) ) )?.includes( aNode ) ) : units;
  
  // If all units are convertible, then only allow unit creation
  if ( components.length === 1 ) {
    aUnits && ( aUnits.length = 0 );
    bUnits && ( bUnits.length = 0 );
  }

  return (
    <Box className={'conversion'} flex={1} display="flex" alignItems="center" justifyContent="space-between">
      <Box flex={4} m={1}><TextInput label="Amount" value={a.amount} onChange={ ( e:any ) => props.onChange( { a: { ...a, amount: e.target.value }, b: { ...b } } ) } /></Box>
      <Box flex={7} ml={1}>
        <UnitInput
          onCreateNewUnit={props.onCreateNewUnit}
          units={aUnits}
          value={a?.unit?.symbol}
          onSelect={( unit: Unit ) => props.onChange( { a: { ...a, unit }, b: { ...b } } )}
        />
      </Box>
      <Box flex={1}>=</Box>
      <Box flex={4} m={1}><TextInput label="Amount" value={b.amount} onChange={ ( e:any ) => props.onChange( { b: { ...b, amount: e.target.value }, a: { ...a } } ) } /></Box>
      <Box flex={7} ml={1}>
        <UnitInput
          onCreateNewUnit={props.onCreateNewUnit}
          units={bUnits}
          value={b?.unit?.symbol}
          onSelect={( unit: Unit ) => props.onChange( { b: { ...b, unit }, a: { ...a } } )}
        />
      </Box>
      <Box flex={1}><DeleteButton onClick={props.onDelete} /></Box>
    </Box>
  );
};
