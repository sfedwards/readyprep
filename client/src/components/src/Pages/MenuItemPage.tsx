import { Box, CircularProgress, IconButton, InputAdornment, Slide, Snackbar, TextField, makeStyles, useMediaQuery, useTheme } from '@material-ui/core';
import { CheckCircleOutline, EditOutlined } from '@material-ui/icons';
import { Alert } from '@material-ui/lab';
import React, { ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Prompt, useHistory, useParams } from 'react-router-dom';

import { AppContext, saveAndContinueCallbackState } from '../../../App';
import { useNumberField } from '../../../hooks/useNumberField';
import { useTemporarilyTrueState } from '../../../hooks/useTemporarilyTrueState';
import { RecipeIngredient } from '../../../models/RecipeIngredient';
import { Unit } from '../../../models/Unit';
import request from '../../../util/request';
import { trackChanges } from '../../../util/trackChanges';
import RecipeTable from '../RecipeTable';
import { Button } from '../../UI/Button';
import { DeleteButton } from '../../UI/DeleteButton';
import { DeleteDialog } from '../../UI/DeleteDialog';
import { NameInput } from '../../UI/NameInput';
import { TextInput } from '../../UI/TextInput';
import { BackToLink } from '../BackToLink';
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

export const MenuItemPage = ( ): ReactElement => {
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
  const [ plateCost, setPlateCost ] = useState<number>( );
  const [ price, setPrice ] = useNumberField( setHasChanges );
  const [ averageWeeklySales, setAverageWeeklySales ] = useNumberField( setHasChanges );
  const [ ingredients, setIngredients ] = trackChanges( useState( [ { key: '' + Math.random() } ] as RecipeIngredient[] ), setHasChanges );
  const [ instructions, setInstructions ] = trackChanges( useState( '' ), setHasChanges );

  const [ showingDeleteDialog, setShowingDeleteDialog ] = useState( false );
  const [ editingName, setEditingName ] = useState( false );

  const theme = useTheme();
  const classes = useStyles( theme );
  const isLargeScreen = useMediaQuery( theme.breakpoints.up( 'md' ) );
  const isExtraLargeScreen = useMediaQuery( theme.breakpoints.up( 'lg' ) );

  const defaultErrorMessage = t( 'elements.pantry.error-loading' );

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
          document.title = 'New Menu Item';
        } else {
          requests.push( request.get( `/items/${id}` ) );
        }

        const [ units, item ] = await Promise.all( requests );
        setAllUnits( units.body.items );

        if ( ! item )
          return;

        const {
          name,
          price,
          averageWeeklySales,
          instructions,
          ingredients,
        } = item.body;

        ingredients?.forEach( ( ingredient: RecipeIngredient ) => ingredient.key = ( ingredient.ingredient?.id || '' ) + '' + Math.random() );

        setError( '' );
        setName( name );
        setPrice( price?.toFixed( 2 ).replace( /\.00$/, '' ) );
        setAverageWeeklySales( averageWeeklySales );
        setInstructions( instructions );
        setIngredients( ingredients.map( ( ingredient: any ) => ( {
          ingredient: {
            id: ingredient.id,
            type: ingredient.type,
            name: ingredient.name,
            deleted: ingredient.deleted,
          },
          amount: ingredient.amount,
          unit: ingredient.unit,
          waste: ingredient.waste,
          cost: ingredient.cost,
        } ) ).concat( [ {} ] ) );
        document.title = name;
      } catch ( err: any ) {
        setError( err.message || defaultErrorMessage );
      }
      setLoading( false );
      setHasChanges( false );
    } )();
  }, [ id, defaultErrorMessage, loading ] );

  useEffect( () => {
    setPlateCost( ingredients.reduce( ( sum, { cost } ) => sum + ( cost ?? 0 ), 0 ) );
  }, [ ingredients ] );

  const handleClickEditName = (): void => {
    setEditingName( true );
  };

  const handleClickDelete = (): void => {
    setShowingDeleteDialog( true );
  };

  const handleSave = async (): Promise<void> => {

    if ( price.value && +price.value !== +price.value )
      return;
    

    setSaving( true );

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
      price: price.value === '' ? undefined : +price.value,
      averageWeeklySales: averageWeeklySales.value === '' ? undefined : +averageWeeklySales.value,
      instructions,
      ingredients: formattedIngredients,
    };

    try {
      if ( id === 'new' ) {
        const { body: res } = await request.post( '/items', { body } );
        setSuccess( t( 'strings.successfully-created' ) );
        setHasChanges( false );
        history.replace( `/items/${res.id}`, { previousTitle: document.title } );
      } else {
        await request.put( `/items/${id}`, { body } );
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

  const handleConfirmDelete = async ( ): Promise<void> => {
    await request.delete( `/items/${id}` );
    history.push( '/items', { previousTitle: document.title } );
  };

  return (
    <>
      <Prompt message={t( 'strings.unsaved-changes-warning' )} when={hasChanges} />

      { isLargeScreen && <BackToLink /> }

      <Box display="flex" alignItems="center">
        { /* Enough height for loading spinner + vertical padding */ }
        <Box minHeight={56} maxWidth="100%" flex={1} px={2} pb={1} display="flex" flexWrap="wrap" alignItems="center">
          <Box maxWidth={ isLargeScreen ? '80%' : '100%' } mr={4} display="flex" alignItems="center">
            <NameInput value={name} editing={editingName} onChange={handleNameChange} />
            <IconButton onClick={handleClickEditName} className={classes.editButton} aria-label="Edit Name"><EditOutlined /></IconButton>
          </Box>
          { id !== 'new' && <DeleteButton onClick={handleClickDelete} /> }
          { loading && <CircularProgress /> }
          <Button
            tabIndex={1}
            style={{ marginLeft: 'auto' }}
            startIcon={ saving ? <CircularProgress size="1em" style={{ color: '#fff' }} /> : <CheckCircleOutline /> }
            text={ saving ? `${t( 'strings.saving' )} ...` : t( 'strings.save' ) }
            onClick={ handleSave }
          />
        </Box>
      </Box>
      <Box px={2} mb={2} display="flex" justifyContent="flex-start">
        <Box mx={0.5} flex={'0 1 160px'}>
          <TextInput
            label={ t( 'strings.plate-cost' )}
            disabled
            value={plateCost !== undefined ? plateCost.toFixed( 2 ).replace( /\.00$/, '' ) : '\u00a0--\u00a0' }
            InputProps={{
              startAdornment: <InputAdornment position="start" style={{ pointerEvents: 'none' }}>$</InputAdornment>,
            }}
          />
        </Box>
        <Box mx={0.5} flex={'0 1 160px'}>
          <TextInput
            label={t( 'strings.sales-price' )}
            { ...price }
            InputProps={{
              startAdornment: <InputAdornment position="start" style={{ pointerEvents: 'none' }}>$</InputAdornment>,
            }}
          />
        </Box>
        <Box mx={0.5} flex={'0 1 160px'}><TextInput label={t( 'strings.average-weekly-units' )} { ...averageWeeklySales } /></Box>
      </Box>
      <Box { ... isExtraLargeScreen ? { mx: 2.5 } : {} }>
        <RecipeTable
          units={allUnits}
          rows={ingredients}
          onChange={ useCallback( ( rows: RecipeIngredient[] ) => {
            setIngredients( rows );
          }, [] ) }
        />
      </Box>
      <Box display="flex" pt={2} px={2}>
        <TextField style={{ flex: 1 }} InputProps={{ style: { margin: 0, background: '#fff', padding: 16 } }} variant="outlined" placeholder={t( 'strings.instructions' )} multiline value={instructions} onChange={ ( e: any ) => setInstructions( e.target.value ) } />
      </Box>
      <DeleteDialog itemName={t( 'strings.menu-item' )} showing={showingDeleteDialog} onClose={() => setShowingDeleteDialog( false )} onConfirm={ handleConfirmDelete } />
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

