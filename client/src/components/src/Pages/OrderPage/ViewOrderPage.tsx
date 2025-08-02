import { Box, CircularProgress, MenuItem, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@material-ui/core";

import { BackToLink } from "../../BackToLink";
import { Helmet } from "react-helmet";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import { ReactElement } from "react";
import { Control, Controller, useForm, useWatch, useFieldArray, UseFormRegister } from "hookform";
import { useHistory, useParams } from "react-router-dom";

import { Button, TextInput } from '../../../UI';
import useSWR from "swr";
import { ListVendorsResponse } from "../../../../services/api/vendors";
import { Vendor } from "../../../../services/api/models/vendor.api.model";

import log from 'loglevel';
import { debounce, map } from 'lodash';

import { GetVendorItemsResponse } from '../../../../services/api/vendors/interface/GetVendorItems.api.interface'
import { useVendorApi } from "../../../../services/api/hooks/useVendorApi.api.hook";
import { useSnackbar } from "notistack";

import { GetOrderResponse } from '../../../../services/api/vendors/interface/GetOrder.api.interface';
import { Order } from "../../../../services/api/models/order.api.model";

import { CreateCatalogItemDialog } from '../..';
import { Add, Remove } from "@material-ui/icons";
import theme from "src/theme";
import { useIsFullWidth } from "src/hooks";

interface OrderForm {
  vendorId: string;
  items: {
    id: string;
    packs: number|null;
    price: number;
  }[];
}

export const ViewOrderPage = ( props: any ): ReactElement => {
  const history = useHistory();
  const state = history.location.state as { vendorId: Vendor['id'] };

  const [ isShowingCreateCatalogItem, setShowingCreateCatalogItem ] = useState( false );

  const rVendors = useSWR<ListVendorsResponse>( '/vendors' );
  
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';

  const rOrder = useSWR<GetOrderResponse>( id && ! isNew ? `/orders/${id}` : null );

  const { control, register, handleSubmit, setValue, reset } = useForm<OrderForm>({
    mode: 'onTouched',
  });

  const vendorId = useWatch( {
    name: 'vendorId',
    control,
    defaultValue: state?.vendorId ?? '',
  } );
  
  const rCatalog = useSWR<GetVendorItemsResponse['items']>(
    vendorId ? `/vendors/${vendorId}/catalog` : null,
    {
      revalidateOnMount: true,
    }
  );

  console.log( { vendorId }, rCatalog );
  
  useEffect( () => {
    if ( ! rCatalog.data )
      return;

    console.log( 'Resetting' );

    reset({
      vendorId,
      items: rCatalog.data.map( (item, i) => ({
        id: item.id,
        packs: null,
        price: item.price,
        index: i,
      })),
    })
  }, [ rCatalog.data ] );
  useEffect( () => {
    if ( ! rOrder.data )
      return;

    setValue( 'vendorId', rOrder.data?.vendor.id );
  }, [ rOrder.data, setValue ])
  
  const values = useWatch({ control });

  const vendorApi = useVendorApi();
  const { enqueueSnackbar } = useSnackbar();

  const onSubmit = async ( data: any ) => {
    const items = map( values.items, (v,k) => ({ ...v, packId: k.toString() })).filter( item => item.packs && +item.packs ) as { packId: string, packs: number, price: number; }[];

    if ( items.length === 0 ) {
      enqueueSnackbar( 'Order cannot be empty', { variant: 'warning' } );
      return;
    }

    try {
      const { body: { id } } = await vendorApi.createOrder( 
        vendorId,
        { items },
      );
      enqueueSnackbar( 'Created Order', { variant: 'success' } );
      history.replace( `/orders/${id}` );
    } catch ( e ) {
      log.error( e );
      enqueueSnackbar( 'Problem Creating Order', { variant: 'error' } );
    }
  };
  
  useWatch({
    control,
    name: 'items',
  });

  const packs = useFieldArray({
    control,
    name: 'items',
  })

  let totalPrice;

  console.log( { isNew } );
  
  if ( isNew ) {
    console.log( packs.fields );
  } else {
    totalPrice = rCatalog.data?.reduce( (sum, item ) => {
      const orderItem = rOrder.data?.items.find( orderItem => orderItem.packId === item.id );
      if ( orderItem?.packs )
        sum += orderItem.packs * item.price;
      return sum;
    }, 0 ).toFixed(2);
  }

  const [ search, setSearch ] = useState( '' );

  const handleSearchChange = useCallback( 
    debounce( ( e: React.ChangeEvent<HTMLInputElement> ) => {
      setSearch( e.target.value );
    }, 200 ), 
    []
  );

  const filteredCatalog =
    search
      ? rCatalog.data?.filter( item => item.pantryIngredient.name.toLowerCase().includes( search.toLowerCase() ) || item.catalogNumber.toLowerCase().includes( search.toLowerCase() ) )
      : rCatalog.data;

  const isFullWidth = useIsFullWidth();

  return (
    <>
      <Helmet>
        <title>Order</title>
      </Helmet>
      <Box p={isFullWidth ? 2 : 0} display="flex" flexDirection="column">
        <BackToLink />
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box p={isFullWidth ? 2 :0} display="flex" flexDirection="column">
          
            <Box display="flex" flexWrap="wrap" alignItems="flex-end">
              <Box flex={1} minHeight={56} p={1} display="flex" flexDirection="row" justifyContent="space-between" alignItems="center" flexWrap="wrap">
                <Typography variant="h3">Order</Typography>
                <Box display="flex" flexDirection="row">
                  <Box display="flex" alignItems="center">
                    {
                      isNew &&
                        <>
                          <Button onClick={() => setShowingCreateCatalogItem( true )}>+ New Catalog Item</Button>
                          <Button type="submit" style={{ marginLeft: 16, cursor: 'pointer' }}>Submit Order</Button>
                        </>
                    }
                    { !isNew && rOrder.data && (
                        rOrder.data.invoiceId
                          ? <Button onClick={() => history.push( `/invoices/${rOrder.data?.invoiceId}`, { previousTitle: document.title } )}>View Invoice</Button>
                          : <Button onClick={() => history.push( '/invoices/new', { previousTitle: document.title, forOrderId: id } )}>Receive Items</Button>
                      )
                    }
                  </Box>
                </Box>
              </Box>
            </Box>

            <Box display="flex" flexDirection="row" justifyContent="flex-start">
              <Box flex="0 1 220px">
                {
                  rVendors.data &&
                    <Controller
                      name="vendorId"
                      control={control}
                      defaultValue={ vendorId ?? '' }
                      render={
                        ({ field: { onChange, value } }) => 
                          <TextInput 
                            label="Vendor"
                            select={!vendorId}
                            disabled={!!vendorId}
                            onChange={onChange}
                            value={vendorId ? rVendors.data?.vendors.find( ({ id }) => id === vendorId )?.name ?? '' : value}
                          >
                            { rVendors.data?.vendors.map( vendor => 
                              <MenuItem key={vendor.id} value={vendor.id}>{vendor.name}</MenuItem>
                            ) }
                          </TextInput>
                      }
                    />
                }                
              </Box>
              {
                isNew && vendorId &&
                <Box ml={2}>
                  <TextInput
                    label="Search catalog"
                    onChange={handleSearchChange}
                  />
                </Box>
              }
              { ! isNew &&
                <>
                  <Box flex="0 1 220px" ml={2}>
                    <TextInput label="Order #" disabled value={rOrder.data?.number} />
                  </Box>
                  <Box flex="0 1 220px" ml={2}>
                    <TextInput label="State" disabled value={rOrder.data?.state} />
                  </Box>
                </>
              }
            </Box>
            
            <Box>
              { vendorId && (
                  filteredCatalog && (isNew || rOrder.data) ?
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell style={{ width: '30%' }}>
                            <Typography variant="subtitle1">Catalog Item</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle1">Packs</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle1">Price / pack</Typography>
                          </TableCell>
                          <TableCell style={{ textAlign: 'right' }}>
                            <Typography variant="subtitle1">Subtotal</Typography>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        { 
                          packs.fields?.map( (pack, i) => {
                            const item = filteredCatalog.find( item => item.id === pack.id );

                            if ( ! item )
                              return <></>;

                            const price = item?.price;

                            console.log( { price, packs: pack.packs } );

                            if ( isNew ) {
                              return (
                                <TableRow key={pack.id}>
                                  <TableCell>{ item.pantryIngredient.name } - { item.catalogNumber }</TableCell>
                                  <TableCell>
                                    { 
                                      isNew ? 
                                        <Controller
                                          name={`items.${i}.packs` as const}
                                          control={control}
                                          defaultValue={pack?.packs ?? null}
                                          render={({ field: { onChange, value, ...field }}) =>
                                          <Box
                                            display="flex"
                                            alignItems="center"
                                            lineHeight={0}
                                          >
                                            <Box
                                              mr={1}
                                              style={{
                                                background: theme.palette.primary.main,
                                                borderRadius: 50,
                                                color: '#fff',
                                                opacity: value ? 1 : 0.28,
                                                cursor: value ? 'pointer' : 'default',
                                              }}
                                              onClick={() => {
                                                if ( value )
                                                  onChange(+value - 1);
                                              }}
                                            >
                                              <Remove />
                                            </Box>
                                            <TextInput
                                              inputProps={{
                                                style: {
                                                  paddingTop: 0,
                                                  minWidth: 80,
                                                  maxWidth: 80,
                                                },
                                                ...field
                                              }}
                                              value={value}
                                              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                                const value = e.target.value.replace( /\D/g, '' );
                                                onChange( value ? +value : '' );
                                              }}
                                            />
                                            <Box
                                              ml={1}
                                              style={{
                                                cursor: 'pointer',
                                                background: theme.palette.primary.main,
                                                borderRadius: 50,
                                                color: '#fff',
                                              }}
                                              onClick={() => {
                                                onChange(+(value ?? 0) + 1);
                                              }}
                                            >
                                              <Add />
                                            </Box>
                                          </Box>
                                          }
                                        />
                                      : packs
                                    }
                                  </TableCell>
                                  <TableCell>
                                  { price }            
                                  </TableCell>
                                  <TableCell style={{ textAlign: 'right' }}>
                                    <Typography>
                                      { pack.packs && price !== undefined ? `$${(pack.packs*price).toFixed(2)}` : '' }
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              )
                            }

                            const orderItem = rOrder.data?.items.find( orderItem => orderItem.packId === item.id );

                            if ( ! orderItem )
                              return null;

                            return (
                              <React.Fragment key={item.id}>
                                <OrderItemRow
                                  index={i}
                                  orderId={id}
                                  catalogItem={item}
                                  orderItem={orderItem}
                                  register={register}
                                  control={control}
                                />
                              </React.Fragment>
                            );
                          })
                        }

                        { ! isNew && rOrder.data &&
                          <TableRow>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell style={{ textAlign: 'right' }}>Total: ${ totalPrice }</TableCell>
                          </TableRow>
                        }

                        { isNew && values.items &&
                          <>
                            <TableRow></TableRow>
                            <Box style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 60 }}>
                              <Typography>
                                Total: $
                                {
                                  totalPrice
                                }
                              </Typography>
                            </Box>
                          </>
                        }
                      </TableBody>
                    </Table>
                  : <Box display="flex" justifyContent="center" alignItems="center"><CircularProgress /></Box>
                )
              }
            </Box>            

          </Box>
        </form>
      </Box>
      <CreateCatalogItemDialog
        open={isShowingCreateCatalogItem}
        onClose={() => setShowingCreateCatalogItem( false )}
        onConfirm={() => rCatalog.mutate()}
        vendorId={vendorId}
      />
    </>
  );
}

interface OrderItemRowProps {
  orderId: Order['id'];
  register: UseFormRegister<OrderForm>;
  control: Control<OrderForm>;
  catalogItem: any;
  orderItem?: any;
  index: number;
}

const OrderItemRow = ( 
  {
    orderId,
    register,
    control,
    orderItem,
    catalogItem,
    index,
  }: OrderItemRowProps
) => {

  const isNew = orderId === 'new';

  const packs = useWatch({
    name: `items.${index}.packs` as const,
    control,
    defaultValue: orderItem?.packs ?? null
  });

  const price = catalogItem?.price;

  return (
    <TableRow>
      <TableCell>{ catalogItem.pantryIngredient.name } - { catalogItem.catalogNumber }</TableCell>
      <TableCell>
        { 
          isNew ? 
            <Controller
              name={`items.${index}.packs` as const}
              control={control}
              defaultValue={orderItem?.packs ?? null}
              render={({ field: { onChange, value, ...field }}) =>
              <Box
                display="flex"
                alignItems="center"
                lineHeight={0}
              >
                <Box
                  mr={1}
                  style={{
                    cursor: 'pointer',
                    background: theme.palette.primary.main,
                    borderRadius: 50,
                    color: '#fff',
                    opacity: value ? 1 : 0.28,
                  }}
                  onClick={() => {
                    if ( value )
                      onChange(+value - 1);
                  }}
                >
                  <Remove />
                </Box>
                <TextInput
                  size="small"
                  inputProps={field}
                  value={value}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const value = e.target.value.replace( /\D/g, '' );
                    onChange( value ? +value : '' );
                  }}
                />
                <Box
                  ml={1}
                  style={{
                    cursor: 'pointer',
                    background: theme.palette.primary.main,
                    borderRadius: 50,
                    color: '#fff',
                  }}
                  onClick={() => {
                    onChange(+(value ?? 0) + 1);
                  }}
                >
                  <Add />
                </Box>
              </Box>
              }
            />
          : packs
        }
      </TableCell>
      <TableCell>
       { price }            
      </TableCell>
      <TableCell style={{ textAlign: 'right' }}>
        <Typography>
          { packs && price !== undefined ? `$${(packs*price).toFixed(2)}` : '' }
        </Typography>
      </TableCell>
    </TableRow>
  )
};
