import { Box, InputAdornment, makeStyles } from '@material-ui/core';
import { CheckCircleOutline } from '@material-ui/icons';
import React, { ReactElement, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Ingredient } from '../../models/Ingredient';
import { RecipeIngredient } from '../../models/RecipeIngredient';
import { Types, Unit } from '../../models/Unit';
import request from '../../util/request';
import { NavBar } from '../src/NavBar';
import { Button } from './Button';
import { IngredientSelector } from './IngredientSelector';
import { NameInput } from './NameInput';
import { RecipeTable } from './RecipeTable';
import { TextInput } from './TextInput';

interface Props { }

const useStyles = makeStyles( theme => ( {
  root: {
    flex: 1,
    background: '#E7E7E7AA',
    minHeight: 600,
    paddingBottom: 16,
  },
} ) );

const demoIngredients = [
  { id: 1, name: 'Prep/Pizza Dough', type: 'prep', pricePerEa: 0.80, pricePerMg: 0.00000142857142 },
  { id: 2, name: 'Prep/Pizza Sauce', type: 'prep', pricePerEa: 0.21, pricePerMl: 0.002625, pricePerMg: 0.00000257142 },
  { id: 3, name: 'Mozzarella, shredded', type: 'pantry', pricePerEa: 0.675, pricePerMl: 0.01125, pricePerMg: 0.00002410714 },
  { id: 4, name: 'Pepperoni, slices', type: 'pantry', pricePerEa: 0.035, pricePerMg: 0.00001728425 },
  { id: 5, name: 'Mushroom, slices', type: 'pantry', pricePerMl: 0.00166666666, pricePerMg: 0.00000564383 },
  { id: 6, name: 'Olives, black', type: 'pantry', pricePerMl: 0.00173263888, pricePerMg: 0.00000320076 },
  { id: 7, name: 'Tomatoes, grape', type: 'pantry', pricePerMl: 0.00395833333, pricePerMg: 0.00000637583 },
  { id: 8, name: 'Onion, red', type: 'pantry', pricePerMl: 0.001125, pricePerMg: 0.00000234782 },
];

export const DemoWidget = ( props: Props ): ReactElement => {
  const { t } = useTranslation();
  const classes = useStyles();

  const [ units, setUnits ] = useState< Unit[] >( [] );
  const [ ingredients, setIngredients ] = useState<RecipeIngredient[]>( [ ] );
  const [ plateCost, setPlateCost ] = useState( 0 );

  useEffect( () => {
    ( async () => {
      const { body: res } = await request.get( '/units' );
      setUnits( res.items );

      setIngredients( [
        { ingredient: demoIngredients[0] as Ingredient, amount: '1', unit: 'ea', waste: '4', cost: 0.83, key: '' + Math.random() },
        { key: '' + Math.random() },
      ] );
    } )();
  }, [] );

  useEffect( () => {
    ( async () => {
      const costs = await Promise.all( ingredients.map( async ( { ingredient, amount, unit, waste } ) => {
        try {
          const cost = ingredient ? ( await getCost( ingredient.id, +( amount ?? 0 ), unit || '', +( waste ?? 0 ) ) ) : 0;
          return cost;
        } catch ( err ) {
          return 0;
        }
      } ) );
      setPlateCost( costs.reduce( ( sum, curr ) => sum + curr, 0 ) );
    } )();
  }, [ ingredients ] );

  const getCost = async ( id: Ingredient['id'], amount: number, unitSymbol: string, waste?: number ): Promise<number> => {
    const ingredient = demoIngredients.find( ingredient => id === ingredient.id );
    const unit: Unit|undefined = units.find( ( { symbol } ) => symbol === unitSymbol );
    if ( ! ingredient || ! unit || ! unit.type )
      throw new Error( 'UNRECOGNIZED' );

    const priceField = {
      PURE: 'pricePerEa',
      WEIGHT: 'pricePerMg',
      VOLUME: 'pricePerMl',
    }[ Types[ unit.type ] ];

    if ( ! ( priceField in ingredient ) )
      throw new Error( 'NO_PRICE_INFO' );

    return amount*( unit.magnitude ?? 1 )*( ingredient[ priceField as 'pricePerEa' | 'pricePerMg' | 'pricePerMl' ] as number )*( 100/( 100 - ( waste ?? 0 ) ) );
  };

  return (
    <Box className={ classes.root } display="flex" flexDirection="column">
      <NavBar fake={ true } />
      <Box display="flex" alignItems="center">
        { /* Enough height for loading spinner + vertical padding */ }
        <Box minHeight={56} maxWidth="100%" flex={1} pt={1} pl={1} pr={2} pb={1} display="flex" flexWrap="wrap" alignItems="center">
          <Box maxWidth="100%" mr={4} display="flex" alignItems="center">
            <NameInput value={'Build Your Own Pizza'} editing={false} onChange={() => {}} />
          </Box>
          <Button
            tabIndex={1}
            style={{ marginLeft: 'auto' }}
            startIcon={ <CheckCircleOutline /> }
            text={ t( 'strings.save' ) }
            onClick={ () => { } }
          />
        </Box>
      </Box>
      <Box px={2} py={1} display="flex" justifyContent="flex-start" style={{ background: '#fff' }}>
        <Box mx={1} flex="shrink">
          <TextInput
            label={ t( 'strings.plate-cost' )}
            disabled
            value={plateCost !== undefined ? plateCost.toFixed( 2 ).replace( /\.00$/, '' ) : '\u00a0--\u00a0' }
            InputProps={{
              startAdornment: <InputAdornment position="start" style={{ pointerEvents: 'none' }}>$</InputAdornment>,
            }}
          />
        </Box>
      </Box>
      <RecipeTable fake={true} rows={ ingredients } getCost={ getCost } onChange={ ( rows: RecipeIngredient[] ) => {
        setIngredients( rows );
      } } IngredientSelectorComponent={ DemoIngredientSelector } />
    </Box>
  );
};

const DemoIngredientSelector = ( props: any ): ReactElement => {
  const [ query, setQuery ] = useState( '' );
  const [ ingredients, setIngredients ] = useState( demoIngredients );

  const onQueryChange = ( query: string ): void => {
    setQuery( query );
    setIngredients( demoIngredients.filter( ( { name } ) => name.toLowerCase().includes( query.trim().slice( query.indexOf( ' ' ) + 1 ).toLowerCase() ) ) );
  };

  return <IngredientSelector { ...props } query={ query } onQueryChange={ onQueryChange } ingredients={ ingredients } />;
};
