import { Box, MenuItem, Table, TableBody, TableCell, TableHead, TableRow, Typography, Checkbox } from "@material-ui/core";
import { Button, TextInput } from "../../../UI";
import { Control, Controller, useForm, useWatch } from "react-hook-form";
import React, { useEffect, useState } from "react";

import { BackToLink } from "../../BackToLink";
import { CatalogItemInput } from "./CatalogItemInput";
import { Helmet } from "react-helmet";
import { IngredientInput } from "../../../UI/IngredientInput";
import { InvoiceForm } from "../../../../forms/invoice.form";
import { ListVendorsResponse } from "../../../../services/api/vendors";
import { ReactElement } from "react";
import { Vendor } from "../../../../services/api/models/vendor.api.model";
import log from 'loglevel';
import { useInvoiceApi } from "../../../../services/api/hooks/useInvoiceApi.api.hook";
import { useHistory, useParams } from "react-router-dom";
import useSWR from "swr";
import { Ingredient } from "../../../../models/Ingredient";
import { GetVendorPacksResponse } from "../../../../services/api/vendors/interface/GetVendorPacks.api.interface";
import { useSnackbar } from "notistack";
import { GetOrderResponse } from "../../../../services/api/vendors/interface/GetOrder.api.interface";
import { sumBy } from 'lodash';
import { DateInput } from "../../../Form";

export const InvoicePage = ( ): ReactElement => {

  const rVendors = useSWR<ListVendorsResponse>( '/vendors' );
  
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';

  const [ isEditing, setEditing ] = useState( isNew );

  const { control, register, reset, handleSubmit } = useForm<InvoiceForm>({
    mode: 'onTouched',
  });

  const rInvoice = useSWR( isNew ? null : `/invoices/${id}` );

  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();
  
  const orderId = (history.location.state as any)?.forOrderId;
  const rOrder = useSWR<GetOrderResponse>( isNew && orderId ? `/orders/${orderId}` : null );

  const vendorId = useWatch<Vendor['id']>( {
    name: 'vendorId',
    control,
  } );

  useEffect( () => {
    if ( rInvoice.data ) {
      log.info( 'Resetting with INVOICE', rInvoice.data );
      return reset( rInvoice.data);
    }

    if ( rOrder.data ) {
      log.info( 'Resetting witH ORDER', rOrder.data );

      reset({
        vendorId: rOrder.data.vendor.id,
        items: rOrder.data.items?.map( item => {
          return {
            ...item,
            paid: item.price*item.packs,
          } 
        }),
      });
    }
  }, [reset, rInvoice.data, rOrder.data] );

  const values = useWatch({ control });

  const rows = [];

  if ( vendorId ) {
    const numExistingRows = values.items?.length ?? 1;
    const numRows = numExistingRows + (values.items?.[numExistingRows-1]?.catalogNumber ? 1 : 0);

    for ( let i = 0; i < numRows; i++ )
      rows.push( <InvoiceRow isEditing={isEditing} vendorId={vendorId} register={register} control={control} index={i} /> );
  }

  const invoiceApi = useInvoiceApi();
  
  const onSubmit = async (values: InvoiceForm) => {
    const data = {
      ...values,
      items: values.items
        .filter( item => item.ingredient?.id && item.catalogNumber )
        .map( item => ({ 
          ingredientId: item.ingredient.id !,
          catalogNumber: item.catalogNumber,
          packs: item.packs,
          paid: item.paid,
        }) ),
      date: new Date( values.date ).toISOString().slice(0,10),
      orderId: undefined,
    };

    setEditing( false );

    if ( id === 'new' ) {
      data.orderId = orderId;
      const { body: { id } } = await invoiceApi.create(data);
      enqueueSnackbar( 'Successfully created Invoice', { variant: 'success' } );
      history.replace( `/invoices/${id}` );
    } else {
      await invoiceApi.update(id, data);
      enqueueSnackbar( 'Successfully saved Invoice', { variant: 'success' } );
      await rInvoice.mutate();
    }
  };

  return (
    <>
      <Helmet>
        <title>Invoice</title>
      </Helmet>
      <Box p={2} display="flex" flexDirection="column">
        <BackToLink />
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box p={2} display="flex" flexDirection="column">

            <Box display="flex" flexWrap="wrap" alignItems="flex-end">
              <Box flex={1} minHeight={56} p={1} display="flex" flexDirection="row" justifyContent="space-between" alignItems="center" flexWrap="wrap">
                <Typography variant="h3">Receive Items</Typography>
                <Box display="flex" flexDirection="row">
                  <Box display="flex" alignItems="center">
                    { isEditing 
                      ? <Button type="submit" style={{ marginLeft: 16 }}>Save</Button>
                      : <Button type="button" onClick={ (e: React.MouseEvent) => { e.preventDefault(); setEditing( true ); } }>Edit Invoice</Button>
                    }
                  </Box>
                </Box>
              </Box>
            </Box>

            <Box display="flex" flexDirection="row" justifyContent="space-evenly">
              <Box flex="0 1 220px">
                {
                  rVendors.data &&
                    <Controller
                      name="vendorId"
                      control={control}
                      defaultValue=""
                      render={
                        ({ onChange, value }) => 
                          <TextInput 
                            label="Vendor"
                            select={!vendorId}
                            disabled={!!vendorId}
                            onChange={onChange}
                            value={vendorId ? rVendors.data?.vendors.find( ({ id }) => id === vendorId )?.name ?? '' : value.name}
                          >
                            { rVendors.data?.vendors.map( vendor => 
                              <MenuItem key={vendor.id} value={vendor.id}>{vendor.name}</MenuItem>
                            ) }
                          </TextInput>
                      }
                    />
                }                
              </Box>
              <Box flex="0 1 220px">
                <TextInput
                  name="number"
                  label="Invoice Number"
                  autoFocus
                  defaultValue=""
                  required
                  disabled={!isEditing}
                  inputRef={register}
                />
              </Box>
              <Box flex="0 1 220px">
                <DateInput 
                  name="date"
                  control={control}
                  defaultValue={new Date()}
                  disabled={!isEditing}
                />
              </Box>
            </Box>

            <Box>
              { vendorId &&
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell style={{ width: '30%' }}>
                          <Typography variant="subtitle1">Item</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle1">Catalog #</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle1">Packs</Typography>
                        </TableCell>
                        <TableCell align={ isEditing ? 'left' : 'right' }>
                          <Typography variant="subtitle1">Paid</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="subtitle1">Price / pack</Typography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      { 
                        rows
                      }
                      { 
                        ! isEditing &&
                        <TableRow>
                          <TableCell></TableCell>
                          <TableCell></TableCell>
                          <TableCell></TableCell>
                          <TableCell style={{ textAlign: 'right' }}>
                            Total: ${ sumBy( rInvoice.data?.items ?? [], 'paid' ).toFixed(2) }
                          </TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      }
                    </TableBody>
                  </Table>
              }
            </Box>
          </Box>
          { isEditing &&
            <Box display="flex">
              <Box ml="auto" mr={2} display="flex" alignItems="center">
                <Checkbox
                  id="updateCatalogPrices"
                  name="updateCatalogPrices"
                  color="primary"
                  defaultChecked={false}
                  inputRef={register}
                />
                <label htmlFor="updateCatalogPrices">
                  <Typography style={{ userSelect: 'none', cursor: 'pointer' }}>
                    Update prices in catalog
                  </Typography>
                </label>
              </Box>
            </Box>
          }
        </form>
      </Box>
    </>
  );
}

interface InvoiceRowProps {
  isEditing: boolean;
  vendorId: Vendor['id'];
  register: ReturnType<typeof useForm>['register'];
  control: Control;
  index: number;
}

const InvoiceRow = ( { isEditing, vendorId, register, control, index }: InvoiceRowProps  ): ReactElement|null => {
  const ingredient = useWatch<Ingredient>({
    name: `items[${index}].ingredient`,
    control,
  });

  const catalogNumber = useWatch<string>( {
    name: `items[${index}].catalogNumber`,
    control,
  } );

  const packs = useWatch<number>( {
    name: `items[${index}].packs`,
    control,
  } );

  const paid = useWatch<number>( {
    name: `items[${index}].paid`,
    control,
  } );

  const rVendorItems = useSWR<GetVendorPacksResponse>( 
    (vendorId && ingredient?.id) ? `/vendors/${vendorId}/catalog/${ingredient.id}` : null
  );
  const pricePerPack = rVendorItems?.data?.find( pack => pack.catalogNumber === catalogNumber )?.price;

  if ( ! catalogNumber && ! isEditing )
    return null;
  
  return (
    <TableRow>
      <TableCell>
        <Controller
          name={`items[${index}].ingredient`}
          control={control}
          render={
            ({ onChange, value }) => 
              isEditing 
                ?
                  <IngredientInput 
                    type="pantry"
                    onCreate={onChange}
                    onSelect={onChange}
                    value={value?.name}
                  />
                : value?.name ?? ''
          }
        />
      </TableCell>
      <TableCell>
        <CatalogItemInput index={index} control={control} textOnly={!isEditing} />
      </TableCell>
      <TableCell>
        <Controller
          name={`items[${index}].packs`}
          control={control}
          render={
            ({ onChange, value }) => 
              isEditing
              ? 
                <TextInput 
                  value={value}
                  onChange={onChange}
                  size="small"
                />
              : <>{value ?? ' -- '}</>
          }
        />
      </TableCell>
      <TableCell align="right">
        <Controller
          name={`items[${index}].paid`}
          control={control}
          render={
            ({ onChange, value }) => 
              isEditing
              ? 
                <TextInput 
                  value={value ?? (packs && pricePerPack !== undefined ? packs*pricePerPack : '')}
                  onChange={onChange}
                  onBlur={onChange}
                  size="small"
                />
              : <>{value ?? ' -- '}</>
          }
        />
      </TableCell>
      <TableCell align="right">
        <Typography>
          { packs && paid !== undefined ? `$${(paid/packs).toFixed(2)}` : ' -- ' }
        </Typography>
      </TableCell>
    </TableRow>
  );
}