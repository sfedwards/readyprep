import { Box, CircularProgress, Dialog, Button as MuiButton, Typography, makeStyles, useTheme } from '@material-ui/core';
import { CheckCircleOutline, Clear } from '@material-ui/icons';
import { Controller, useForm, useWatch } from 'react-hook-form';
import React, { ReactElement, useEffect } from 'react';
import { TextInput, UnitInput } from '../../UI';

import { GetVendorResponse } from '../../../services/api/vendors';
import { Unit } from '../../../models/Unit';
import request from '../../../util/request';
import useSWR, { mutate } from 'swr';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { VendorInput } from '../../Form';
import { IngredientInput } from '../../UI/IngredientInput';

import { Ingredient } from '../../../models/Ingredient';
import { Pack } from '../Pages/PantryPage/PacksTable/PackRow';

export interface EditCatalogItemDialogProps {
  vendorId: string;
  ingredientId: string;
  packId: string;
  open: boolean;
  onClose: () => void;
  onConfirm: (catNumber: string) => void;
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

export const EditCatalogItemDialog = ( props: EditCatalogItemDialogProps ): ReactElement => {
  const theme = useTheme();
  const classes = useStyles( theme );
  const { t } = useTranslation();

  const { control, register, getValues, reset } = useForm();

  const ingredient = useWatch<Ingredient|null>( {
    name: 'ingredient',
    control,
  } );

  const vendorId = props.vendorId;
  const ingredientId = props.ingredientId || ingredient?.id;

  const rVendor = useSWR<GetVendorResponse>( ! vendorId ? null : `/vendors/${vendorId}` );
  const rIngredient = useSWR( ! ingredientId ? null  : `/pantry/${ingredientId}` );

  const { enqueueSnackbar } = useSnackbar();

  const loading = !! ((! rVendor.data && props.vendorId) || (! rIngredient.data && props.ingredientId));

  useEffect( () => {
    if ( ! rIngredient.data )
      return;

    const pack = rIngredient.data.packs.find( (pack: Pack) => pack.id === props.packId );

    if ( ! pack )
      props.onClose();

      console.log( pack );

    reset( {
      catalogNumber: pack.catalogNumber,
      price: pack.price,
      numItems: pack.numItems,
      amountPerItem: pack.amountPerItem,
      unit: pack.unit.symbol,
    });

  }, [ rIngredient.data ]);

  const handleConfirm = async ( ) => {
    const data = rIngredient.data;

    const formValues = getValues();

    delete formValues.vendor;
    delete formValues.ingredient;

    const pack = data.packs.find( (pack: Pack) => pack.id === props.packId );
    Object.assign( pack, formValues );
    
    data.packs.forEach( (pack: any) => {
      if ( pack.unit?.symbol )
        pack.unit = pack.unit.symbol;
      if ( pack.vendor?.id )
        pack.vendorId = pack.vendor.id;
      delete pack.vendor;
      delete pack.par;

      if ( pack.numItems )
        pack.numItems = +pack.numItems;
      else
        delete pack.numItems;

      if ( pack.amountPerItem )
        pack.amountPerItem = +pack.amountPerItem;
      else
        delete pack.amountPerItem;
    } );
    
    delete data.parLevel;
    delete data.usedIn;
    
    await request.put( `/pantry/${ingredientId}`, { body: data } );
    enqueueSnackbar( t( 'strings.successfully-saved-changes' ), { variant: 'success' } );
    await rIngredient.mutate();
    await mutate( `/vendors/${vendorId}/catalog/${ingredientId}` );

    props.onClose();
    props.onConfirm( formValues.catalogNumber );
  }

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      className={classes.root}
      fullWidth
      maxWidth="md"
    >
      <Box display="flex" flexDirection="column" alignItems="center">
        <div className={classes.title} id="alert-dialog-title">
          Edit Catalog Item
        </div>
        { loading 
            ? <Box py={2}><CircularProgress /></Box>
            : 
              <Box minWidth="70%">
                <Box display="flex" flexDirection="row" alignItems="center">
                  <Box pr={1}><Typography variant="subtitle1">Vendor: </Typography></Box>
                  { props.vendorId 
                      ? <Typography>{ rVendor.data?.name }</Typography>
                      : <VendorInput name="vendor" control={control} />
                  }
                </Box>
                <Box display="flex" flexDirection="row" alignItems="center">
                  <Box pr={1}><Typography variant="subtitle1">Ingredient: </Typography></Box>
                  { props.ingredientId 
                      ? <Typography>{ rIngredient.data?.name }</Typography>
                      : 
                        <Controller
                          name="ingredient"
                          control={control}
                          defaultValue={null}
                          render={
                            ({ onChange, value }) => 
                              <IngredientInput 
                                type="pantry"
                                onCreate={onChange}
                                onSelect={onChange}
                                value={value?.name}
                              />
                          }
                       />
                  }
                </Box>
                <form>
                  <Box my={2} display="flex" flexDirection="column">
                    <Box display="flex" flexDirection="row" justifyContent="space-evenly">
                      <Box flex={1} mr={4}>
                        <TextInput name="catalogNumber" inputRef={register} size="small" label="Catalog #" />
                        </Box>
                      <Box flex={1}>
                        <TextInput name="price" inputRef={register} size="small" label="Price" />
                        </Box>
                    </Box>
                    <Box display="flex" flexDirection="row" justifyContent="space-evenly">
                      <Box flex={1} mr={4}>
                        <TextInput name="numItems" inputRef={register} size="small" label="Units" />
                      </Box>
                      <Box flex={1} mr={4}>
                        <TextInput name="amountPerItem" inputRef={register} size="small" label="Amount per unit" />
                      </Box>
                      <Box flex={1}>
                        <Controller
                          name="unit"
                          control={control}
                          render={
                            ({ onChange, value }) => 
                              <UnitInput
                                value={value}
                                size="small"
                                onSelect={(unit: Unit) => onChange(unit.symbol)} 
                                onCreateNewUnit={onChange}
                              />
                          }
                        />
                      </Box>
                    </Box>
                  </Box>
                </form>
              </Box>
        }
        <div className={classes.buttons}>
          <MuiButton className="cancel" onClick={ props.onClose } autoFocus>
            <Clear />{t( 'strings.cancel' )}
          </MuiButton>
          <MuiButton disabled={loading} onClick={ handleConfirm }>
            <CheckCircleOutline />{t( 'strings.save' )}
          </MuiButton>
        </div>
      </Box>
    </Dialog>
  );
};