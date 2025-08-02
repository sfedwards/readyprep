import { Box, CircularProgress, IconButton, InputAdornment, Button as MuiButton, Paper, Slide, Snackbar, TextField, makeStyles, useMediaQuery, useTheme } from '@material-ui/core';
import { CheckCircleOutline, EditOutlined } from '@material-ui/icons';
import { Alert } from '@material-ui/lab';
import React, { ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Prompt, useHistory, useParams } from 'react-router-dom';

import { AppContext, saveAndContinueCallbackState } from '../../../App';
import { useNumberField } from '../../../hooks/useNumberField';
import { useTemporarilyTrueState } from '../../../hooks/useTemporarilyTrueState';
import { Conversion } from '../../../models/Conversion';
import { RecipeIngredient } from '../../../models/RecipeIngredient';
import { Unit } from '../../../models/Unit';
import request from '../../../util/request';
import { trackChanges } from '../../../util/trackChanges';
import RecipeTable from '../RecipeTable';
import { Button } from '../../UI/Button';
import { DeleteButton } from '../../UI/DeleteButton';
import { DeleteDialog } from '../../UI/DeleteDialog';
import { ScaleIcon } from '../../UI/Icons';
import { NameInput } from '../../UI/NameInput';
import { ParentBadge } from '../../UI/ParentBadge';
import { TextInput } from '../../UI/TextInput';
import { UnitInput } from '../../UI/UnitInput';
import { UsedInList } from '../../UI/UsedInList';
import { BackToLink } from '../BackToLink';
import ConversionsDialog from '../ConversionsDialog';
import { useSetRecoilState } from 'recoil';

const useStyles = makeStyles( theme => ( {
  editableName: {
    paddingLeft: 16,
    paddingRight: 16,
    cursor: 'default',
    '& br': {
      display: 'none',
    },
  },
  editButton: {
    margin: '0 0 0 16px',
    color: theme.palette.text.primary,
    cursor: 'pointer',
  },
} ) );

export const PrepPage = ( ): ReactElement => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const history = useHistory();
  
  const [ hasChanges, setHasChanges ] = useState( false );
  
  useEffect( () => {
    if ( ! hasChanges )
      return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      return e.returnValue = 'You have unsaved changes';
    };
    window.addEventListener( 'beforeunload', handler );
    return () => window.removeEventListener( 'beforeunload', handler );
  }, [ hasChanges ] );

  const [ loading, setLoading ] = useTemporarilyTrueState( true );
  const [ saving, setSaving ] = useTemporarilyTrueState( false );
  const [ success, setSuccess ] = useState( '' );
  const [ error, setError ] = useState( '' );
  const [ showingAlert, setShowingAlert ] = useState( false );
  const [ allUnits, setAllUnits ] = useState( [] as Unit[] );

  const [ name, setName ] = trackChanges( useState( '' ), setHasChanges );
  const [ batchAmount, setBatchAmount ] = useNumberField( setHasChanges );
  const [ loadedBatchAmount, setLoadedBatchAmount ] = useState( 0 );
  const [ loadedBatchUnit, setLoadedBatchUnit ] = useState( '' );
  const [ batchUnit, setBatchUnit ] = trackChanges( useState<string>( ), setHasChanges );
  const [ waste, setWaste ] = useNumberField( setHasChanges );
  const [ shelfLife, setShelfLife ] = useNumberField( setHasChanges );
  const [ conversions, setConversions ] = trackChanges( useState( [] as Conversion[] ), setHasChanges );
  const [ parRange, setParRange ] = trackChanges( useState<[number, number]>( ), setHasChanges );
  const [ ingredients, setIngredients ] = trackChanges( useState( [ { key: '' + Math.random() } ] as RecipeIngredient[] ), setHasChanges );
  const [ instructions, setInstructions ] = trackChanges( useState( '' ), setHasChanges );
  const [ usedIn, setUsedIn ] = useState<{id: number, type: string, name: string }[]>( [] );
  
  const [ showingDeleteDialog, setShowingDeleteDialog ] = useState( false );
  const [ showingConversionsDialog, setShowingConversionsDialog ] = useState( false );

  const [ editingName, setEditingName ] = useState( false );

  const [ usage, setUsage ] = useState<any>( );

  const theme = useTheme();
  const classes = useStyles( theme );
  const isLargeScreen = useMediaQuery( theme.breakpoints.up( 'md' ) );
  const isExtraLargeScreen = useMediaQuery( theme.breakpoints.up( 'lg' ) );

  const defaultErrorMessage = t( 'elements.prep.error-loading' );

  const { handlePlanUpgradeRequired } = useContext( AppContext );

  useEffect( () => {
    if ( !( error || success ) )
      return;
    setShowingAlert( true );
    const timer = setTimeout( () => {
      setShowingAlert( false );
    }, 4000 );
    return () => clearTimeout( timer );
  }, [ !!( error || success ) ] );

  useEffect( () => {
    ( async () => {
      try {
        const requests = [ request.get( '/units' ) ];

        if ( id === 'new' ) {
          setEditingName( true );
          setName( '' );
          handleClickEditName();
          setLoading( false );
          document.title = 'New Prep Ingredient';
        } else {
          requests.push( request.get( `/prep/${id}` ) );
        }

        const [ { body: { items: units } }, ingredient ] = await Promise.all( requests );
        setAllUnits( units );

        if ( ! ingredient )
          return;

        const {
          name,
          batchSize,
          batchUnit,
          waste,
          shelfLife,
          parRange,
          conversions,
          ingredients,
          instructions,
          usedIn,
        } = ingredient.body;

        setError( '' );
        setName( name );
        setBatchAmount( batchSize );
        setLoadedBatchAmount( batchSize );
        setLoadedBatchUnit( batchUnit );
        setBatchUnit( batchUnit );
        setParRange( parRange );
        setWaste( waste );
        setShelfLife( shelfLife );
        setConversions( ( conversions || [] ).map( ( { amountA, unitA, amountB, unitB }: { amountA: number, unitA: string, amountB: number, unitB: string } ) => (
          {
            a: { amount: amountA, unit: units.find( ( unit: Unit ) => unit.symbol === unitA ) },
            b: { amount: amountB, unit: units.find( ( unit: Unit ) => unit.symbol === unitB ) },
          }
        ) ) );
        setIngredients( ingredients.map( ( ingredient: any ) => ( {
          ingredient: {
            id: ingredient.id,
            name: ingredient.name,
            type: ingredient.type,
            deleted: ingredient.deleted,
          },
          amount: ingredient.amount,
          unit: ingredient.unit,
          waste: ingredient.waste,
          cost: ingredient.cost,
        } ) ).concat( [ {} ] ) );
        setInstructions( instructions );
        setUsedIn( usedIn );
        setHasChanges( false );
        document.title = name;
      } catch ( err: any ) {
        setError( err.message || defaultErrorMessage );
      }
      setLoading( false );
    } )();
    
  }, [ id, defaultErrorMessage, loading ] );

  const handleClickEditName = (): void => {
    setEditingName( true );
  };

  const handleClickDelete = async (): Promise<void> => {
    setUsage( null );
    setShowingDeleteDialog( true );
    const { body: usage } = await request.post( `/ingredients/${id}/getUsage` );
    setUsage( usage );
  };

  const handleSave = async (): Promise<void> => {
    setSaving( true );
    
    const formattedConversions = conversions.filter( ( { a, b } ) => {
      return a.amount !== undefined && a.unit && b.amount !== undefined && b.unit;
    } ).map( ( { a, b } ) => ( {
      amountA: +( a.amount as string ),
      unitA: a.unit?.symbol,
      amountB: +( b.amount as string ),
      unitB: b.unit?.symbol,
    } ) );
    
    const formattedIngredients = ingredients.flatMap( recipeIngredient => {
      const { ingredient, amount, unit, waste } = recipeIngredient;
      if ( ! ingredient )
        return [ ];
      return [
        {
          id: ingredient.id,
          amount: amount ? +amount : null,
          unit,
          waste: waste ? +waste: null,
        },
      ];
    } );

    const body = {
      name,
      batchSize: batchAmount,
      batchUnit: batchUnit,
      waste,
      shelfLife,
      conversions: formattedConversions,
      ingredients: formattedIngredients,
      instructions,
    };
    try {
      if ( id === 'new' ) {
        const { body: res } = await request.post( '/prep', { body } );
        setSuccess( t( 'strings.successfully-created' ) );
        setHasChanges( false );
        history.replace( `/prep/${res.id}`, { previousTitle: document.title } );
      } else {
        await request.put( `/prep/${id}`, { body } );
        setError( '' );
        setSuccess( t( 'strings.successfully-saved-changes' ) );
        setLoading( true );
      }
    } catch ( err: any ) {
      if ( err.message === 'PLAN_UPGRADE_REQUIRED' )
        handlePlanUpgradeRequired( err.plan );
      else
        setError( `Problem saving: ${err.message || defaultErrorMessage}` );
      
    }
    setSaving( false );
  };

  const setSaveAndContinueCallback  = useSetRecoilState( saveAndContinueCallbackState );
  setSaveAndContinueCallback( () => handleSave );

  const handleNameChange = ( newName: string ): void => {
    setEditingName( false );
    setName( newName );
  };

  const handleSelectUnit = ( unit: Unit ): void => {
    setBatchUnit( unit.symbol );
  };

  const handleCreateNewUnit = ( symbol: Unit['symbol'], type: Unit['type'] ): void => {
    setAllUnits( [ ...allUnits, { name: symbol, symbol, type, wellDefined: false } ] );
  };

  const handleConfirmDelete = async ( ): Promise<void> => {
    await request.delete( `/prep/${id}` );
    history.push( '/prep', { previousTitle: document.title } );
  };

  return (
    <>
      <Prompt message={t( 'strings.unsaved-changes-warning' )} when={hasChanges} />

      { isLargeScreen && <BackToLink /> }

      <Box pb={2} display="flex" alignItems="center">
        { /* Enough height for loading spinner + vertical padding */ }
        <Box minHeight={56} maxWidth="100%" flex={1} px={2} pb={1} display="flex" flexWrap="wrap" alignItems="center">
          <Box maxWidth={ isLargeScreen ? '80%' : '100%' } mr={4} display="flex" alignItems="center">
            <NameInput value={name} editing={editingName} onChange={handleNameChange} />
            <IconButton onClick={handleClickEditName} className={classes.editButton} aria-label="Edit Name"><EditOutlined /></IconButton>
          </Box>
          { id !== 'new' && <DeleteButton onClick={handleClickDelete} /> }
          { loading && ! saving && <CircularProgress /> }
          <Button
            tabIndex={1}
            style={{ marginLeft: 'auto' }}
            startIcon={saving ? <CircularProgress size="1em" style={{ color: '#fff' }} /> : <CheckCircleOutline />}
            text={ saving ? `${t( 'strings.saving' )} ...` : t( 'strings.save' ) }
            onClick={handleSave}
          />
        </Box>
      </Box>
      <Box px={2} mb={2} display="flex" justifyContent="flex-start" flexWrap="wrap">
        <Box mx={1} flex={'2 0 80px'}>
          <TextInput
            disabled
            label={ t( 'strings.par-level' )}
            value={parRange ? ( loadedBatchAmount*( parRange[0] + 0.8*( parRange[1] - parRange[0] ) ) ).toFixed( 2 ).replace( /\.0*$/, '' ) : '\u00a0--\u00a0' }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end" style={{ pointerEvents: 'none' }}>{ loadedBatchUnit }</InputAdornment>
              ),
            }}
          />
        </Box>
        <Box flex={'4 0 200px'} display="flex">
          <Box mx={1} flex={1}>
            <TextInput label={ t( 'strings.batch-amount' ) } { ...batchAmount } />
          </Box>
          <Box mx={1} flex={1}>
            <UnitInput units={allUnits} value={batchUnit} onSelect={handleSelectUnit} onCreateNewUnit={handleCreateNewUnit} />
          </Box>
        </Box>
        <Box mx={1} flex={`${isLargeScreen ? 6 : 1} 0 120px`} display="flex">
          <Paper style={{ margin: '8px 0', flex: 1, display: 'flex', alignItems: 'center', position: 'relative' }}>
            <ParentBadge
              badgeContent={ conversions.filter( ( { a, b } ) => Object.keys( a ).length > 0 && Object.keys( b ).length > 0 ).length }
              onClick={() => setShowingConversionsDialog( true )}>
            </ParentBadge>
            <MuiButton onClick={() => setShowingConversionsDialog( true )} style={{ position: 'absolute', top: 0, bottom: 0, textTransform: 'none', color: theme.palette.primaryGray.main }} fullWidth><ScaleIcon />{ isLargeScreen && t( 'strings.set-uom-conversions' ) }</MuiButton>
          </Paper>
        </Box>
        <Box mx={1} flex={'1 0 80px'}>
          <TextInput
            label={t( 'strings.waste' )}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end" style={{ pointerEvents: 'none' }}>%</InputAdornment>
              ),
              inputProps: {
                style: { textAlign: 'right' },
              },
            }}
            { ...waste }
          />
        </Box>
        <Box mx={1} flex={'1 0 80px'}>
          <TextInput
            label={t( 'strings.shelf-life' )}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end" style={{ pointerEvents: 'none' }}>{ t( 'strings.day_plural' ) }</InputAdornment>
              ),
              inputProps: {
                style: { textAlign: 'right' },
              },
            }}
            { ...shelfLife }
          />
        </Box>
      </Box>
      <Box { ... isExtraLargeScreen ? { mx: 2.5 } : {} }>
        <RecipeTable units={allUnits} rows={ingredients} onChange={ useCallback( ( rows: RecipeIngredient[] ) => setIngredients( rows ), [] ) } />
      </Box>
      <Box display="flex" pt={2} px={2}>
        <TextField style={{ flex: 1 }} InputProps={{ style: { margin: 0, background: '#fff', padding: 16 } }} variant="outlined" placeholder={t( 'strings.instructions' )} multiline value={instructions} onChange={ ( e: any ) => setInstructions( e.target.value ) } />
      </Box>
      <Box pt={4} px={2}>
        { loading || <UsedInList usedIn={usedIn} /> }
      </Box>
      <DeleteDialog itemName={t( 'strings.prep-ingredient' )} showing={showingDeleteDialog} usage={usage} onClose={() => setShowingDeleteDialog( false )} onConfirm={ handleConfirmDelete } />
      <ConversionsDialog
        showing={showingConversionsDialog}
        conversions={conversions}
        onClose={() => setShowingConversionsDialog( false )}
        onConfirm={conversions => {
          setConversions( conversions ); setShowingConversionsDialog( false );
        }}
        onCreateNewUnit={handleCreateNewUnit}
        units={allUnits}
      />
      <Snackbar
        open={ showingAlert }
        onExited={ () => {
          setError( '' ); setSuccess( '' );
        } }
        TransitionComponent={useCallback( props => <Slide direction="down" {...props} />, [] )}
      >
        <Alert variant="filled" severity={ error ? 'error' : 'success' }>{ error || success }</Alert>
      </Snackbar>
    </>
  );
};

