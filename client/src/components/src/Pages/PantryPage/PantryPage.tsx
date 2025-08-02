import { CheckCircleOutline, EditOutlined } from '@material-ui/icons';
import { Box, CircularProgress, Divider, IconButton, InputAdornment, Button as MuiButton, Paper, makeStyles, useMediaQuery, useTheme } from '@material-ui/core';
import { Button, DeleteButton, DeleteDialog, NameInput, ParentBadge, ScaleIcon, TextInput, UnitInput, UsedInList } from '../../../UI';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { PantryIngredientForm, pantryIngredientFormSchema } from '../../../../forms';
import { Prompt, useHistory, useParams } from 'react-router-dom';
import React, { ReactElement, useContext, useEffect, useState } from 'react';

import { AppContext, saveAndContinueCallbackState } from '../../../../App';
import { BackToLink } from '../../BackToLink';
import { CalculatedPricePerUom } from './CalculatedPricePerUom';
import ConversionsDialog from '../../ConversionsDialog';
import { PacksTable } from './PacksTable/PacksTable';
import log from 'loglevel';
import request from '../../../../util/request';
import useSWR from 'swr';
import { useSnackbar } from 'notistack';
import { useTemporarilyTrueState } from '../../../../hooks/useTemporarilyTrueState';
import { useTranslation } from 'react-i18next';
import { yupResolver } from '@hookform/resolvers/yup';
import { Pack } from './PacksTable/PackRow';
import { useRecoilCallback, useSetRecoilState } from 'recoil';

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
  completeRowButton: {
    borderRadius: 8,
    color: '#fff',
    '&:hover.MuiIconButton-root': {
      background: theme.palette.primary.dark,
    },
  }
} ) );

export const PantryPage = ( ): ReactElement => {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  
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

  const [ loading, setLoading ] = useTemporarilyTrueState( ! isNew );
  const [ saving, setSaving ] = useTemporarilyTrueState( false );
  const { data: unitsData, mutate: mutateUnits } = useSWR( '/units' );

  const [ packs, setPacks ] = useState<Pack[]>( [] );
  const [ conversions, setConversions ] = useState<{
    unitA?: string;
    amountA?: string;
    unitB?: string;
    amountB?: string;
  }[]>( [] );

  const allUnits = unitsData?.items;

  const rPantryIngredient = useSWR( isNew ? null : `/pantry/${id}`, { revalidateOnFocus: false, revalidateOnReconnect: false } );

  const {
    parLevel,
    usedIn,
  } = rPantryIngredient.data ?? {};

  const {
    unit: { symbol: uom },
  } = rPantryIngredient.data?.packs[0] ?? { unit: { } };

  const methods = useForm<PantryIngredientForm>( {
    mode: 'onTouched',
    resolver: yupResolver(pantryIngredientFormSchema),
    shouldUnregister: true,
  } );

  const { control, register, reset, errors, getValues, handleSubmit, formState: {isDirty } } = methods;

  const { enqueueSnackbar } = useSnackbar();

  useEffect( () => {
    const data = rPantryIngredient.data;
    if ( ! data ) 
      return;

    setLoading( false );
  
    reset( data );

    setPacks( rPantryIngredient.data.packs );
    setConversions( rPantryIngredient.data.conversions );
  }, [rPantryIngredient.data, reset, setLoading, setPacks, setConversions]);

  const [ showingDeleteDialog, setShowingDeleteDialog ] = useState( false );
  const [ showingConversionsDialog, setShowingConversionsDialog ] = useState( false );

  const [ isEditingName, setEditingName ] = useState( isNew );
  const handleClickEditName = ( ): void => setEditingName( true );

  const [ usage, setUsage ] = useState<any>( );

  const theme = useTheme();
  const classes = useStyles( theme );
  const isLargeScreen = useMediaQuery( theme.breakpoints.up( 'md' ) );

  const defaultErrorMessage = t( 'elements.pantry.error-loading' );

  const { handlePlanUpgradeRequired } = useContext( AppContext );

  const handleClickDelete = async (): Promise<void> => {
    setUsage( null );
    setShowingDeleteDialog( true );
    const { body: usage } = await request.post( `/ingredients/${id}/getUsage` );
    setUsage( usage );
  };

  const handleSave = async (): Promise<void> => {
    setSaving( true );

    const {
      name,
      orderFrequency,
      unit,
      waste,
    } = getValues();

    const body = {
      name,
      conversions,
      orderFrequency: orderFrequency !== '' ? orderFrequency : undefined,
      packs: packs.filter(Boolean).map( pack => {
        const newPack: any = { ...pack };
        if ( pack.vendor )
          newPack.vendorId = pack.vendor.id;
        delete newPack.vendor;
        if ( pack.unit && typeof pack.unit !== 'string' )
          newPack.unit = newPack.unit.symbol;          
        delete newPack.par;
        return newPack;
      }),
      waste,
      unit: unit?.symbol,
    };

    try {
      if ( isNew ) {
        const { body: res } = await request.post( '/pantry', { body } );
        enqueueSnackbar( t( 'strings.successfully-created' ), { variant: 'success' } );
        setHasChanges( false );
        history.replace( `/pantry/${res.id}` );
      } else {
        await request.put( `/pantry/${id}`, { body } );
        enqueueSnackbar( t( 'strings.successfully-saved-changes' ), { variant: 'success' } );
        rPantryIngredient.mutate();
      }
    } catch ( err: any ) {
      if ( err.message === 'PLAN_UPGRADE_REQUIRED' )
        handlePlanUpgradeRequired( err.plan );
      else
      enqueueSnackbar( `Problem saving: ${err.message || defaultErrorMessage}`, { variant: 'error' } );      
    }

    reset({
      name,
      orderFrequency,
      unit,
      waste,
    })

    setSaving( false );
    setHasChanges( false );
  };

  const setSaveAndContinueCallback  = useSetRecoilState( saveAndContinueCallbackState );
  setSaveAndContinueCallback( () => handleSave );

  const handleCreateNewUnit = (  ): void => {
    mutateUnits();
  };

  const handleConfirmDelete = async ( ): Promise<void> => {
    await request.delete( `/pantry/${id}` );
    history.push( '/pantry', { previousTitle: document.title } );
  };

  return (
    <FormProvider { ...methods }>
      <Prompt message={t( 'strings.unsaved-changes-warning' )} when={hasChanges || isDirty} />

      { isLargeScreen && <BackToLink /> }
      
      <Box pb={2}>

        <Box display="flex" alignItems="center">
          { /* Enough height for loading spinner + vertical padding */ }
          <Box minHeight={56} maxWidth="100%" flex={1} px={2} pb={1} display="flex" flexWrap="wrap" alignItems="center">
            <Box maxWidth={ isLargeScreen ? '80%' : '100%' } mr={4} display="flex" alignItems="center">
             <Controller
                name="name"
                control={control}
                defaultValue=""
                render={( { onBlur, onChange, value } ) => <>
                  <NameInput   
                    value={value}
                    error={!!errors.name}
                    editing={isEditingName}
                    onChange={( ...args ) => {
                      onChange( ...args );
                      onBlur();
                      setEditingName( false );
                    }}
                  />
                  <IconButton onClick={handleClickEditName} className={classes.editButton} aria-label="Edit Name"><EditOutlined /></IconButton>
                </>}
              />
            </Box>
            { ! isNew && <DeleteButton onClick={handleClickDelete} /> }
            { loading && ! saving && <CircularProgress /> }
            <Button
              tabIndex={1}
              style={{ marginLeft: 'auto' }}
              startIcon={saving ? <CircularProgress size="1em" style={{ color: '#fff' }} /> : <CheckCircleOutline />}
              text={ saving ? `${t( 'strings.saving' )} ...` : t( 'strings.save' ) }
              onClick={handleSubmit(handleSave, console.error)}
            />
          </Box>
        </Box>

      </Box>

      <Paper elevation={0}>
        <Box p={2}>
          <Box display="flex" justifyContent="flex-start">
            <Box mx={0.5} flex={'0 1 200px'}>
              <CalculatedPricePerUom
                ingredientId={+id}
                control={control}
                packs={packs}
                conversions={conversions.filter( conversion => {
                  return conversion.amountA && conversion.amountB && conversion.unitA && conversion.unitB;
                }) as {
                  unitA: string;
                  amountA: string;
                  unitB: string;
                  amountB: string;
                }[]}
              />
            </Box>
            <Box ml={0.5} mr={1.5} flex={'0 1 200px'}>
              <Controller 
                name="unit"
                render={
                  ({ value, onChange }) => 
                    <UnitInput 
                      value={value?.symbol}
                      onSelect={onChange} 
                      onCreateNewUnit={onChange} 
                      onChange={onChange}
                    />                  
                }
              />
            </Box>
            <Box ml="auto" mr="6px" flex={'0 12 380px'} display="flex" alignSelf="stretch">
              <Paper style={{ margin: '8px 0', flex: 1, display: 'flex', alignItems: 'center', position: 'relative' }}>
                { 
                  conversions?.length > 0 && 
                  <ParentBadge
                    badgeContent={conversions?.length}
                    onClick={() => setShowingConversionsDialog( true )}>
                  </ParentBadge>
                }
                <MuiButton onClick={() => setShowingConversionsDialog( true )} style={{ position: 'absolute', top: 0, bottom: 0, textTransform: 'none', color: theme.palette.primaryGray.main }} fullWidth><ScaleIcon />{ isLargeScreen && t( 'strings.set-uom-conversions' ) }</MuiButton>
              </Paper>
            </Box>
          </Box>
          { isLargeScreen || <Divider /> }
          <Box display="flex" flexWrap="wrap" justifyContent="flex-start">
            <Box mx={0.5} flex={'1 1 120px'} maxWidth={200}>
              <TextInput
                label={ t( 'strings.par-level' )}
                disabled
                value={parLevel ? ( +parLevel ).toFixed( 2 ).replace( /\.?0*$/, '' ) : 0}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end" style={{ pointerEvents: 'none' }}>{ uom }</InputAdornment>
                  ),
                }}
              />
            </Box>
	    {
/*		    
            <Box mx={0.5} flex={'1 1 120px'} maxWidth={200}>
              <TextInput
                label="Theoretical Inventory"
                disabled
                value={0}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end" style={{ pointerEvents: 'none' }}>{ uom }</InputAdornment>
                  ),
                }}
              />
            </Box>
*/
	    }
            <Box mx={0.5} flex={'1 1 120px'} maxWidth={200}>
              <TextInput
                name="orderFrequency"
                inputRef={register}
                label={t( 'strings.order-frequency' )}
                required={false}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end" style={{ pointerEvents: 'none' }}>{t( 'strings.day_plural' )}</InputAdornment>
                  ),
                  inputProps: {
                    style: { textAlign: 'right' },
                  },
                }}
              />
            </Box>
            <Box mx={0.5} flex={'1 1 120px'} maxWidth={200}>
              <TextInput
                name="waste"
                inputRef={register({ required: false })}
                label={t( 'strings.waste' )}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end" style={{ pointerEvents: 'none' }}>%</InputAdornment>
                  ),
                  inputProps: {
                    style: { textAlign: 'right' },
                  },
                }}
              />
            </Box>
          </Box>
        </Box>
      </Paper>
      <Box mt={2}>
        <Paper elevation={0}>
          <PacksTable packs={packs} setPacks={(packs: Pack[]) => { setPacks( packs ); setHasChanges( true ); }} />
        </Paper>
      </Box>
      <Box pt={4} px={2}>
        { ! isNew && ! loading && <UsedInList usedIn={usedIn} /> }
      </Box>
      <DeleteDialog itemName={t( 'strings.pantry-ingredient' )} showing={showingDeleteDialog} usage={usage} onClose={() => setShowingDeleteDialog( false )} onConfirm={ handleConfirmDelete } />
      <ConversionsDialog
        showing={showingConversionsDialog}
        conversions={conversions ?? []}
        onClose={() => setShowingConversionsDialog( false )}
        onConfirm={conversions => {
          setShowingConversionsDialog( false );
          log.warn( conversions );
          setConversions( conversions.map( ({ a, b }) => ({
            unitA: a?.unit?.symbol,
            amountA: a?.amount,
            unitB: b?.unit?.symbol,
            amountB: b?.amount,
          })));
        }}
        onCreateNewUnit={handleCreateNewUnit}
        units={allUnits}
        ingredient={getValues()['name']}
      />
    </FormProvider>
  );
};

