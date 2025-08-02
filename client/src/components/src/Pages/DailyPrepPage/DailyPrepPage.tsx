import { Box, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import { CheckCircleOutline } from '@material-ui/icons';
import { produce } from 'immer';
import { useSnackbar } from 'notistack';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { useRecoilCallback, useRecoilState } from 'recoil';
import useSWR from 'swr';

import { AppContext } from '../../../../App';
import formatDate from '../../../../util/formatDate';
import formatNumber from '../../../../util/formatNumber';
import request from '../../../../util/request';
import { Button } from '../../../UI/Button';
import { TextInput } from '../../../UI/TextInput';
import { BackToLink } from '../../BackToLink';
import { PrintRecipesDialog } from './PrintRecipesDialog';
import { prepList, prepOverride } from './state';

interface DailyPrepPageProps {

}

export const DailyPrepPage: React.FC<DailyPrepPageProps> = ( ) => {
  const { date } = useParams<{ date: string }>( );
  const { data, error: loadingError, isValidating, mutate } = useSWR( `/prep-log/${date}`, { revalidateOnFocus: false, revalidateOnReconnect: false } );
  const [ isSaving, setSaving ] = useState( false );
  const [ isPrintRecipesDialogOpen, setPrintRecipesDialogOpen ] = useState( false );

  const theme = useTheme();
  const isLargeScreen = useMediaQuery( theme.breakpoints.up( 'md' ) );

  useEffect( () => {
    document.title = `Daily Prep (${date})`;
  }, [ ] );

  const { handlePlanUpgradeRequired } = useContext( AppContext );

  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const res = [];

  const handleSave = useRecoilCallback( ( { snapshot } ) => async ( ) => {
    setSaving( true );

    const ids = await snapshot.getPromise( prepList );

    try {
      const body =
        ( await Promise.all( ids.map( async id => ( { id, ...await snapshot.getPromise( prepOverride( id ) ) } ) ) ) )
          .filter( ( { inventory, prep } ) => inventory != null || prep != null )
      ;
      await request.post( `/prep-log/${date}`, { body } );
    } catch ( err: any ) {
      if ( err.message === 'PLAN_UPGRADE_REQUIRED' )
        handlePlanUpgradeRequired( err.plan );
      else
        enqueueSnackbar( `Problem saving: ${err.message ?? ''}`, { variant: 'error' } );
      
    }
    await mutate();
    setSaving( false );
    enqueueSnackbar( 'Successfully Saved', { variant: 'success' } );
  } );

  const handlePrintRecipes = async ( recipes: { recipeId: string, batches: number }[] ): Promise<void> => {
    const { res } = await request.post( '/recipes', {
      body: {
        date, recipes,
      },
      parseBody: false,
    } );

    const blob = await res.blob();
    const url = URL.createObjectURL( blob );
    window.open( url );
    /* const anchor = document.createElement( 'a' );
    anchor.style.display = 'none';
    anchor.href = url;
    anchor.target = '_blank';
    anchor.download = `ReadyPrep Recipes - ${date}.pdf`;
    document.body.appendChild( anchor );
    anchor.click();
    anchor.remove();*/
  };

  res.push(
    <>
      { isLargeScreen && <BackToLink /> }
      <Box display="flex" flexWrap="wrap" alignItems="flex-end">
        <Box flex={1} display="flex" alignItems="center">
          <Box minHeight={56} flex={'1 10'} p={1} display="flex" flexDirection="column" justifyContent="flex-end" alignItems="flex-start">
            <Typography variant="h3">{ 'Daily Prep Requirements' }</Typography>
            <Typography variant="h4">{ `Date: ${formatDate( date )}` }</Typography>
          </Box>
          <Box flex={1}>
            { isValidating && <CircularProgress /> }
          </Box>
        </Box>
        <Box mb={4} px={2} flex="shrink" display="flex" alignItems="center">
          <Box flex={1} px={2}>
            <Button onClick={() => setPrintRecipesDialogOpen( true )} text={'Print\u00a0Recipes'} />
          </Box>
          <Box flex={1}>
            <Button
              tabIndex={1}
              style={{ marginLeft: 'auto' }}
              startIcon={ isSaving ? <CircularProgress size="1em" style={{ color: '#fff' }} /> : <CheckCircleOutline /> }
              text={ isSaving ? `${t( 'strings.saving' )} ...` : t( 'strings.save' ) }
              onClick={ handleSave }
            />
          </Box>
        </Box>
      </Box>
    </>
  );

  const items: ProductionItem[] = useMemo( () => {
    if ( ! data )
      return [];

    return data.sort( ( a: any, b: any ) => {
      if ( a.suggested > 0 && b.suggested === 0 )
        return -1;
      if ( b.suggested > 0 && a.suggested === 0 )
        return 1;
      return a.name.localeCompare( b.name );
    } );
  }, [ data ] );

  const recipes = useMemo( () => items.map( item => ( {
    id: item.recipeId,
    name: item.name,
    ingredientId: item.ingredientId,
    batchSize: item.batchSize,
    batchUnit: item.unit,
    batches: Math.round( item.actualPrep/item.batchSize*2 )/2,
  } ) ), [ items ] );

  const initState = useRecoilCallback( ( { set } ) => () => {
    set( prepList, items.map( ( { id } ) => id ) );
  }, [ items ] );

  useEffect( initState, [ initState ] );

  if ( ! data || loadingError )
    return <>{ res }</>;

  res.push(
    <>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={{ width: '30%' }}>
                <Typography variant="subtitle1">Ingredient</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle1">Theoretical / Actual Inventory</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle1">Suggested Prep</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle1">Actual Prep</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            { items.map( item => (
              <TableRow>
                <DailyPrepEntryRow
                  { ...item }
                  actuals={{
                    inventory: item.actualInventory ? +( +item.actualInventory ).toFixed( 2 ) : null,
                    prep: item.actualPrep ? +( +item.actualPrep ).toFixed( 2 ) : null,
                  }}
                />
              </TableRow>
            ) ) }
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );

  res.push( <PrintRecipesDialog recipes={recipes} onConfirm={handlePrintRecipes} open={isPrintRecipesDialogOpen} onClose={() => setPrintRecipesDialogOpen( false )} /> );

  return <>{ res }</>;
};

export default DailyPrepPage;

interface DailyPrepEntry {
  id: string;
  actuals: {
    inventory: number | null;
    prep: number | null;
  },
  batchSize: number;
  inventory: number;
  name: string;
  ingredientId: string;
  suggested: number;
  unit: string;
}

const DailyPrepEntryRow: React.FC<DailyPrepEntry> = props => {
  const { actuals, batchSize, id, name, ingredientId, inventory, suggested, unit } = props;

  const suggestedInUOM = formatNumber( suggested*batchSize );

  const [ overrides, setOverrides ] = useRecoilState( prepOverride( id ) );

  const handleChangeInventory = ( e: React.ChangeEvent<HTMLInputElement> ): void => {
    setOverrides( produce( overrides => {
      overrides.inventory = e.currentTarget.value;
    } ) );
  };

  const handleChangePrep = ( e: React.ChangeEvent<HTMLInputElement> ): void => {
    setOverrides( produce( overrides => {
      overrides.prep = e.currentTarget.value;
    } ) );
  };

  return ( <>
    <TableCell>
      <Link to={{ pathname: `/prep/${ingredientId}`, state: { previousTitle: document.title } }}>{ name }</Link>
    </TableCell>
    <TableCell>
      <Box display="flex" alignItems="center">
        <Box>{ formatNumber( inventory ) } /</Box>
        <Box px={1} maxWidth={80}><TextInput size="small" value={ overrides?.inventory ?? actuals?.inventory ?? '' } onChange={ handleChangeInventory } /></Box>
        <Box>{ unit }</Box>
      </Box>
    </TableCell>
    <TableCell>
      { formatNumber( suggested ) } batches ({ suggestedInUOM } { unit })
    </TableCell>
    <TableCell>
      <Box display="flex" alignItems="center">
        <Box px={1} maxWidth={80}><TextInput size="small" value={ ( overrides?.prep ?? actuals?.prep ?? suggestedInUOM ?? '' ) } onChange={ handleChangePrep } /></Box>
        <Box>{ unit }</Box>
      </Box>
    </TableCell>
  </> );
};

interface ProductionItem {
  recipeId: any;
  id: string;
  name: string;
  ingredientId: string;
  inventory: number;
  actualInventory: number;
  suggested: number;
  actualPrep: number;
  batchSize: number;
  unit: string;
}
