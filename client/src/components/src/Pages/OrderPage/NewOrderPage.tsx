import { Box, Container, Drawer, Typography, MenuItem, CircularProgress } from '@material-ui/core';
import { Controller, useFieldArray, useForm, useWatch } from 'hookform';
import React, { ChangeEvent, ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router-dom';
import { debounce } from 'lodash';
import { Button, TextInput } from 'src/components/UI';
import { useIsFullWidth, useScalingValue } from 'src/hooks';
import { ListVendorsResponse, useVendorApi } from 'src/services/api';
import { GetVendorItemsResponse } from 'src/services/api/vendors/interface/GetVendorItems.api.interface';
import useSWR from 'swr';
import { CreateCatalogItemDialog } from '../..';
import { BackToLink } from '../../BackToLink';
import { Remove, Add } from '@material-ui/icons';
import theme from 'src/theme';
import { map } from 'lodash';
import { useSnackbar } from 'notistack';
import log from 'loglevel';

interface OrderForm {
  vendorId: string;
  items: {
    id: string;
    packs: number|''|null;
    price: number;
  }[];
}

export const NewOrderPage = ( ): ReactElement => {
  const history = useHistory();
  const state = history.location.state as { vendorId: string };
  
  const isFullWidth = useIsFullWidth();

  const { control, register, handleSubmit, setValue, reset, getValues } = useForm<OrderForm>({
    mode: 'onTouched',
  });

  (window as any).tmp = getValues;

  const values = useWatch({ control });
  const packs = useFieldArray({
    control,
    name: 'items',
  });

  const [ isShowingCreateCatalogItem, setShowingCreateCatalogItem ] = useState( false );

  const rVendors = useSWR<ListVendorsResponse>( '/vendors' );

  const vendorId = useWatch( {
    name: 'vendorId',
    control,
    defaultValue: state?.vendorId ?? '',
  } );
  const vendorName = vendorId ? rVendors.data?.vendors.find( ({ id }) => id === vendorId )?.name : null;
  
  const rCatalog = useSWR<GetVendorItemsResponse['items']>(
    vendorId ? `/vendors/${vendorId}/catalog` : null,
    {
      revalidateOnMount: true,
    }
  );

  useEffect( () => {
    if ( ! rCatalog.data )
      return;

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

  
  const { enqueueSnackbar } = useSnackbar();
  const vendorApi = useVendorApi();

  const onSubmit = async ( data: OrderForm ) => {
    const items = map( data.items, v => ({ ...v, packId: v.id })).filter( item => item.packs && +item.packs ) as { packId: string, packs: number, price: number; }[];

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

  const orderTableRef = useRef<HTMLDivElement>(null);

  useEffect( () => {
    if ( isFullWidth )
      return;

    const interval = setInterval( () => {
      if ( ! orderTableRef.current ) 
        return;

      const rect = orderTableRef.current?.getBoundingClientRect();
      console.log( rect );
      console.log( window.innerHeight - (rect.top + orderTableRef.current.offsetHeight) );

      const hdiff = window.innerHeight - (rect.top + orderTableRef.current.offsetHeight)
      const el = orderTableRef.current.children[0] as HTMLDivElement;
      el.style.height = `${el.offsetHeight + hdiff}px`;
    }, 200 );

    return () => clearInterval( interval );
  }, [ isFullWidth ] );

  const incrementButtonSize = useScalingValue(2, 2);

  const items = getValues( 'items' );
  const totalPrice = items?.reduce( (sum, item ) => {
    if ( item.packs )
      sum += item.packs * item.price;
    return sum;
  }, 0 ).toFixed(2);

  const hasPacks = !! items?.some( item => item.packs || item.packs === '' );
  const isShowingTotal = hasPacks;

  return (
    <>
      <Helmet>
        <title>Order</title>
      </Helmet>
      <Box mr={isFullWidth ? `360px` : 0} p={isFullWidth ? 2 : 0} display="flex" flexDirection="column">
        <Container maxWidth="lg" disableGutters>
          <BackToLink />
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box p={isFullWidth ? 2 :0} display="flex" flexDirection="column">
            
              <Box display="flex" flexWrap="wrap" alignItems="flex-end">
                <Box flex={1} minHeight={56} p={1} display="flex" flexDirection="row" justifyContent="space-between" alignItems="center" flexWrap="wrap">
                  <Typography variant="h3">Order</Typography>
                  <Box display="flex" flexDirection="row">
                    <Box display="flex" alignItems="center">
                      <Button onClick={() => setShowingCreateCatalogItem( true )}>+ New Catalog Item</Button>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box display="flex" flexDirection="row" justifyContent="flex-start" lineHeight={0}>
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
                              select={!hasPacks}
                              disabled={!!hasPacks}
                              onChange={onChange}
                              value={hasPacks && vendorId ? vendorName ?? '' : value}
                            >
                              { rVendors.data?.vendors.map( vendor => 
                                <MenuItem key={vendor.id} value={vendor.id}>{vendor.name}</MenuItem>
                              ) }
                            </TextInput>
                        }
                      />
                  }                
                </Box>
                { vendorId &&
                  <Box ml={2}>
                    <TextInput
                      label="Search catalog"
                      onChange={handleSearchChange}
                    />
                  </Box>
                }
              </Box>

              <div
                ref={orderTableRef}
                style={{
                  position: 'relative',
                  paddingBottom: isShowingTotal ? 60 : 0,
                  lineHeight: 0,
                }}
              >
                <div
                  style={{
                    overflowY: isFullWidth ? 'auto' : 'scroll',
                  }}
                >
                  { vendorId && (
                      filteredCatalog ?
                        <Box
                          display="grid"
                          gridTemplateColumns={isFullWidth ? '5fr 3fr 1fr' : 'auto'}
                        >

                          { isFullWidth 
                            ?
                              <>
                                
                                <Box
                                  p={2}
                                  style={{
                                    background: '#fff',
                                    borderBottom: '1px solid #e0e0e0',
                                  }}
                                >
                                  <Typography variant="subtitle1">Catalog&nbsp;Item</Typography>
                                </Box>
                                <Box
                                  py={2}
                                  style={{
                                    background: '#fff',
                                    borderBottom: '1px solid #e0e0e0',
                                  }}
                                >
                                  <Typography variant="subtitle1">Packs</Typography>
                                </Box>
                                <Box
                                  py={2}
                                  pr={4}
                                  textAlign="right"
                                  style={{
                                    background: '#fff',
                                    borderBottom: '1px solid #e0e0e0',
                                  }}
                                >
                                  <Typography variant="subtitle1">Price/Pack</Typography>
                                </Box>
                              </>
                            :
                              <Box
                                p={1}
                                display="flex"
                                justifyContent="space-between"
                                style={{
                                  background: '#fff',
                                  borderBottom: '1px solid #e0e0e0',
                                }}
                              >
                                <Typography variant="subtitle1">Catalog&nbsp;Item</Typography>
                                <Box minWidth={120}>
                                  <Typography variant="subtitle1">Price</Typography>
                                </Box>
                              </Box>
                          }

                            { 
                              packs.fields?.map( ({ id }, i) => {
                                const item = filteredCatalog.find( item => item.id === id );

                                if ( ! item )
                                  return <></>;

                                const pack = getValues(`items.${i}`);
                                const price = item?.price;

                                const nameSection = (
                                  <Typography>
                                    { 
                                      [
                                        item.pantryIngredient.name +
                                        (item.unit
                                          ? ` (${((item.amountPerItem ?? 1)*(item.numItems ?? 1)).toFixed(2).replace( /\.0*$/, '' ) } ${ item.unit })`
                                          : ''),
                                        item.catalogNumber,
                                      ].filter( Boolean ).join( ' - ' )
                                    }
                                  </Typography>
                                );

                                const packsSection = (
                                  <Controller
                                    name={`items.${i}.packs` as const}
                                    control={control}
                                    defaultValue={pack?.packs ?? null}
                                    render={({ field: { onChange, value, ...field }}) =>
                                      <Box
                                        flex={1}
                                        maxWidth={200}
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
                                          <Remove style={{ fontSize: `${incrementButtonSize}em` }} />
                                        </Box>
                                        <TextInput
                                          inputProps={{
                                            style: {
                                              paddingTop: isFullWidth ? 12 : 0,
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
                                          <Add style={{ fontSize: `${incrementButtonSize}em` }} />
                                        </Box>
                                      </Box>
                                    }
                                  />
                                );

                                const priceSection = (
                                  <Typography style={{ minWidth: 120 }}>
                                    ${ price }{ isFullWidth ? '' : <sub style={{ fontSize: '0.7em' }}>/pack</sub> }
                                  </Typography>
                                );

                                const subtotalSection = (
                                  <Typography style={{ fontWeight: 500, color: '#00000099' }}>
                                    { pack.packs && price !== undefined
                                      ? `$${(pack.packs*price).toFixed(2)}`
                                      : ''
                                    }
                                  </Typography>
                                );

                                if ( isFullWidth ) {
                                  return (
                                    <React.Fragment key={pack.id}>
                                      <Box
                                        p={2}
                                        display="flex"
                                        alignItems="center"
                                        style={{
                                          background: '#ffffff88',
                                          borderBottom: '1px solid #e0e0e0',
                                        }}
                                      >
                                        { nameSection }
                                      </Box>
                                      <Box
                                        pr={8}
                                        textAlign="center"
                                        style={{
                                          background: '#ffffff88',
                                          borderBottom: '1px solid #e0e0e0',
                                        }}
                                      >
                                        { packsSection }
                                      </Box>
                                      <Box
                                        py={2}
                                        pr={4}
                                        display="flex"
                                        alignItems="center"
                                        textAlign="right"
                                        style={{
                                          background: '#ffffff88',
                                          borderBottom: '1px solid #e0e0e0',
                                        }}
                                      >
                                        { priceSection }
                                      </Box>
                                    </React.Fragment>
                                  );
                                }

                                return (
                                  <React.Fragment key={pack.id}>
                                    <Box
                                      p={1}
                                      style={{
                                        background: '#ffffff88',
                                        borderBottom: '1px solid #e0e0e0',
                                      }}
                                    >
                                      <Box
                                        py={1.5}
                                        display="flex"
                                        justifyContent="space-between"
                                      >
                                        { nameSection }
                                        { priceSection }
                                      </Box>
                                      <Box display="flex" alignItems="center">
                                        { packsSection }
                                        <Box ml="auto" width={120} textAlign="right">
                                          { subtotalSection }
                                        </Box>
                                      </Box>
                                    </Box>
                                  </React.Fragment>
                                );
                              })
                            }
                        </Box>
                      : <Box display="flex" justifyContent="center" alignItems="center"><CircularProgress /></Box>
                    )
                  }
                </div>    
                { isShowingTotal && ! isFullWidth &&
                  <Box
                    position="absolute"
                    bottom={0}
                    left={0}
                    right={0}
                    height={60}
                    px={2}
                    display="flex"
                    alignItems="center"
                    textAlign="right"
                    style={{ 
                      background: '#fff',
                    }}
                  >
                    <Typography>
                      Total: 
                    </Typography>
                    <Typography style={{ width: 80, fontWeight: 500, color: '#000000aa' }}>
                      ${ totalPrice }
                    </Typography>
                    <Box ml="auto">
                      <Button type="submit" style={{ marginLeft: 16, cursor: 'pointer' }}>Submit Order</Button>
                    </Box>
                  </Box>    
                }
              </div>
              { ! isFullWidth && <Box height="100vh"></Box> }
            </Box>
            { isFullWidth &&
              <Drawer
                anchor="right"
                open
                variant="persistent"
                PaperProps={{
                  style: {
                    background: 'none',
                    pointerEvents: 'none',
                    border: 'none',
                  }
                }}
                style={{
                  position: 'relative',
                  paddingBottom: 60,
                  width: 380,
                  background: 'none',
                }}
              >
                <Box
                  height="100%"
                  mt="78px"
                  pb={60}
                  width={380}
                  style={{
                    background: '#fff',
                    borderTop: '1px solid #ddd',
                    borderLeft: '1px solid #ddd',
                    pointerEvents: 'all',
                  }}
                >
                  <Box
                    height={50}
                    display="flex"
                    alignItems="center"
                    style={{
                      borderBottom: '1px solid #e0e0e0'
                    }}
                  >
                    <Box pl={2}>
                      <Typography variant="h3" style={{ fontSize: 24 }}>My Order</Typography>
                    </Box>
                  </Box>
                  <Box height="calc(100vh - 50px - 79px - 60px)" style={{ overflowY: 'auto' }}>
                    {
                      packs.fields?.map( ({ id }, i) => {
                        const item = rCatalog.data?.find( item => item.id === id );

                        if ( ! item )
                          return <></>;

                        const key = `items.${i}` as const;
                        const pack = getValues(key);
                        const price = item?.price;
                        const value = pack.packs;

                        if ( value === null || value === 0 )
                          return <></>;

                        const nameSection = (
                          <Typography>
                            { 
                              [
                                item.pantryIngredient.name +
                                (item.unit
                                  ? ` (${((item.amountPerItem ?? 1)*(item.numItems ?? 1)).toFixed(2).replace( /\.0*$/, '' ) } ${ item.unit })`
                                  : ''),
                                item.catalogNumber,
                              ].filter( Boolean ).join( ' - ' )
                            }
                            { 
                            }
                          </Typography>
                        );

                        const packsSection = (
                          <Box
                            flex={1}
                            maxWidth={200}
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
                                  setValue(`${key}.packs` as const, (+value - 1));
                              }}
                            >
                              <Remove style={{ fontSize: `${incrementButtonSize}em` }} />
                            </Box>
                            <TextInput
                              inputProps={{
                                style: {
                                  paddingTop: isFullWidth ? 12 : 0,
                                  minWidth: 80,
                                  maxWidth: 80,
                                },
                              }}
                              value={value}
                              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                const value = e.target.value.replace( /\D/g, '' );
                                setValue(`${key}.packs` as const, value === '' || value === '0' ? '' : value ? +value : null );
                              }}
                              onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                                const value = e.target.value.replace( /\D/g, '' );
                                setValue(`${key}.packs` as const, value ? +value : null );
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
                                setValue(`${key}.packs` as const, +(value ?? 0) + 1);
                              }}
                            >
                              <Add style={{ fontSize: `${incrementButtonSize}em` }} />
                            </Box>
                          </Box>
                        );

                        const priceSection = (
                          <Typography>
                            ${ price }
                          </Typography>
                        );

                        const subtotalSection = (
                          <Typography style={{ fontWeight: 500, color: '#00000099' }}>
                            { pack.packs && price !== undefined
                              ? `$${(pack.packs*price).toFixed(2)}`
                              : ''
                            }
                          </Typography>
                        );

                        return (
                          <React.Fragment key={pack.id}>
                            <Box
                              p={2}
                              style={{
                                background: '#ffffff88',
                                borderBottom: '1px solid #e0e0e0',
                                pointerEvents: 'all',
                              }}
                            >
                              <Box
                                py={1.5}
                                display="flex"
                                justifyContent="space-between"
                              >
                                { nameSection }
                                { priceSection }
                              </Box>
                              <Box display="flex" alignItems="center">
                                { packsSection }
                                <Box ml="auto" width={120} textAlign="right">
                                  { subtotalSection }
                                </Box>
                              </Box>
                            </Box>
                          </React.Fragment>
                        );
                      })
                    }
                  </Box>
                </Box>

                <Box
                  position="absolute"
                  bottom={0}
                  width={380}
                  right={0}
                  height={60}
                  px={2}
                  display="flex"
                  alignItems="center"
                  textAlign="right"
                  style={{ 
                    background: '#f6f6f6',
                    borderLeft: '1px solid #ddd',
                    pointerEvents: 'all',
                  }}
                >
                  <Typography>
                    Total: 
                  </Typography>
                  <Typography style={{ width: 80, fontWeight: 500, color: '#000000aa' }}>
                    ${ totalPrice }
                  </Typography>
                  <Box ml="auto">
                    <Button type="submit" style={{ marginLeft: 16, cursor: 'pointer' }}>Submit Order</Button>
                  </Box>
                </Box>    
              </Drawer>
            }
          </form>
        </Container>
      </Box>
      <CreateCatalogItemDialog
        open={isShowingCreateCatalogItem}
        onClose={() => setShowingCreateCatalogItem( false )}
        onConfirm={() => rCatalog.mutate()}
        vendorId={vendorId}
      />
    </>
  )
};