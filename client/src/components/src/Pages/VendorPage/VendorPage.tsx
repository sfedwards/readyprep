import * as log from 'loglevel';

import { Box, IconButton, MenuItem, Typography, makeStyles, Checkbox } from '@material-ui/core';
import { Controller, useForm, useWatch } from 'react-hook-form';
import React, { ReactElement, useEffect, useState } from 'react';
import { VendorForm, vendorFormSchema } from '../../../../forms';
import { forOwn, get } from 'lodash';
import { useHistory, useParams } from 'react-router-dom';

import { BackToLink } from '../../BackToLink';
import { Button } from '../../../UI/Button';
import { EditOutlined } from '@material-ui/icons';
import { GetVendorResponse } from '../../../../services/api/vendors';
import { NameInput } from '../../../UI/NameInput';
import { TextInput } from '../../../UI/TextInput';
import { flatten } from 'flat';
import useSWR from 'swr';
import { useSnackbar } from 'notistack';
import { useVendorApi } from '../../../../services/api/hooks/useVendorApi.api.hook';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert } from '@material-ui/lab';
import { OrderMethod } from '../../../../enum/order-methods.enum';

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

export const VendorPage = ( ): ReactElement => {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';

  const rVendor = useSWR<GetVendorResponse>( isNew ? null : `/vendors/${id}` );

  const { control, register, reset, errors, getValues, setValue, handleSubmit, formState } = useForm<VendorForm>( {
    mode: 'onTouched',
    defaultValues: rVendor.data,
    resolver: yupResolver(vendorFormSchema),
  } );

  (window as any).tmp = getValues;

  const orderMethod = useWatch<OrderMethod>({
    control,
    name: 'orderMethod',
  });

  useWatch<OrderMethod>({
    control,
    name: 'includePricesOnPurhcaseOrders',
  });

  useEffect( () => {
    if ( ! rVendor.data ) 
      return;

    console.log( 'The deets', rVendor.data, rVendor.data.includePricesOnPurchaseOrders );
    
    setValue(
	'includePricesOnPurchaseOrders',
	!! rVendor.data.includePricesOnPurchaseOrders
      );

    forOwn( flatten( getValues() ), (v,k) => {
      const newValue = get( rVendor.data, k );
      if ( ! (flatten( formState.touched ) as any)[k] && newValue !== undefined && newValue !== v )
        setValue( k, newValue );
    });
  }, [formState.touched, getValues, rVendor.data, reset, setValue]);

  const [ isEditingName, setEditingName ] = useState( isNew );
  const handleClickEditName = ( ): void => setEditingName( true );

  const vendorApi = useVendorApi();

  const history = useHistory();

  const { enqueueSnackbar } = useSnackbar();
  
  const onSubmit = async (data: VendorForm): Promise<void> => {
    return await (isNew ? handleCreate( data ) : handleUpdate( data ));
  };

  const handleCreate = async (data: VendorForm): Promise<void> => {
    try {
      const res = await vendorApi.create( data );
      history.replace( `/vendor/${res.body.id}`, history.location.state );
      enqueueSnackbar( 'Successfully added vendor', { variant: 'success' } );
    } catch ( err: any ) {
      log.error( err );
      enqueueSnackbar( err.message, { variant: 'error' } );
    }
  };

  const handleUpdate = async (data: VendorForm): Promise<void> => {
    try {
      await vendorApi.update( id, data );
      enqueueSnackbar( 'Successfully updated vendor', { variant: 'success' } );
      await rVendor.mutate();
    } catch ( err: any ) {
      log.error( err );
      enqueueSnackbar( err.message, { variant: 'error' } );
    }
  };

  const classes = useStyles();

  log.info( errors );

  return (
    <Box p={2} display="flex" flexDirection="column">
      <BackToLink />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box display="flex" flexWrap="wrap" alignItems="flex-end">
          <Box flex={1} minHeight={56} p={2} display="flex" flexDirection="row" justifyContent="space-between" alignItems="center" flexWrap="wrap">
            <Box display="flex" flexDirection="row" justifyContent="flex-start">
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
                      onChange( ...args ); onBlur(); setEditingName( false );
                    }}
                  />
                  <IconButton onClick={handleClickEditName} className={classes.editButton} aria-label="Edit Name"><EditOutlined /></IconButton>
                </>}
              />
            </Box>
            <Box display="flex" flexDirection="row" alignItems="center">
              {
                ! isNew &&
                  <Button onClick={() => { history.push( `/vendor/${id}/catalog`, { previousTitle: document.title } ) }}>View Catalog</Button>
              }
              <Button type="submit" style={{ marginLeft: 16 }}>Save</Button>
            </Box>
          </Box>
        </Box>

        <Box>
          { (errors as any)?.['undefined'] &&
            <Alert severity="error">{ (errors as any)?.['undefined'].message }</Alert>
          }
        </Box>

        <Box px={2} maxWidth={640} display="flex" flexDirection="row" flexWrap="wrap">
          <Box flex={1} px={1} minWidth={300}>
            <TextInput name="accountNumber" inputRef={register} label="Account Number" />
          </Box>
          <Box flex={1} px={1} minWidth={300}>
            <Controller
              name="orderMethod"
              control={control}
              defaultValue="manual"
              as={({ onBlur, onChange, value }) => 
                <TextInput 
                  label="Order Method"
                  error={!!errors.orderMethod}
                  select 
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                >
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="manual">Manual</MenuItem>
                </TextInput>
              }
            />
          </Box>
        </Box>

      {
          orderMethod === 'email' &&
          <Box px={2} display="flex" alignItems="center">
	    <Controller
	      control={control}
              name="includePricesOnPurchaseOrders"
	      defaultValue={rVendor.data?.includePricesOnPurchaseOrders}
	      render={ ({ value, onChange, onBlur }) => <Checkbox
		  color="primary"
		  checked={!! value}
		  defaultChecked={false}
		  onChange={e => onChange( e.target.checked )}
		  onBlur={onBlur}
		/>
	      }
	    />
            <Typography>Include prices on purchase orders</Typography>
          </Box>
        }

        <Box px={2}><Typography variant="h3">Primary Contact</Typography></Box>
        <Box px={2} maxWidth={640} display="flex" flexDirection="row" flexWrap="wrap">
          <Box flex={1} px={1} minWidth={300}>
            <TextInput name="primaryContact.name" inputRef={register} label="Name" />
            <TextInput 
              name="primaryContact.email"
              inputRef={register} 
              error={!!errors.primaryContact?.email}
              label={`Email${errors.primaryContact?.email?.message ? ` (${errors.primaryContact.email.message})` : ''}`}
              />
          </Box>
          <Box flex={1} px={1} minWidth={300}>
            <TextInput 
              name="primaryContact.officePhone" 
              inputRef={register} 
              error={!!errors.primaryContact?.officePhone}
              label={`Office Number${errors.primaryContact?.officePhone?.message ? ` (${errors.primaryContact.officePhone.message})` : ''}`}
            />
            <TextInput 
              name="primaryContact.mobilePhone" 
              inputRef={register} 
              error={!!errors.primaryContact?.mobilePhone}
              label={`Mobile Number${errors.primaryContact?.mobilePhone?.message ? ` (${errors.primaryContact.mobilePhone.message})` : ''}`}
            />
          </Box>
        </Box>

        <Box px={2}><Typography variant="h3">Address</Typography></Box>
        <Box px={2} maxWidth={640} display="flex" flexDirection="row" flexWrap="wrap">
          <Box flex={1} px={1} minWidth={300}>
            <TextInput name="address.street1" inputRef={register} label="Street 1" />
            <TextInput name="address.street2" inputRef={register} label="Street 2" />
          </Box>
          <Box flex={1} px={1} minWidth={300}>
            <TextInput name="address.city" inputRef={register} label="City" />
            <TextInput name="address.state" inputRef={register} label="State" />
            <TextInput name="address.zip" inputRef={register} label="Zip" />
          </Box>
        </Box>
      </form>
    </Box>
  );
};
