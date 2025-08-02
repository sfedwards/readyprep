import { Box, Chip, CircularProgress, IconButton, Link, makeStyles, Menu, MenuItem, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@material-ui/core';
import React, { ReactElement, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { Alert } from '@material-ui/lab';
import { BackToLink } from '../../BackToLink';
import { GetVendorItemsResponse } from '../../../../services/api/vendors/interface/GetVendorItems.api.interface';
import { Helmet } from 'react-helmet';
import { ListVendorsResponse } from '../../../../services/api/vendors';
import { PaginationSection } from '../../../UI';
import { TextInput } from '../../../UI/TextInput';
import { VendorItem } from '../../../../services/api/models/vendor-item.api.model';
import { useQueryState } from '../../../../hooks/useQueryState';
import useSWR from 'swr';
import { Assignment, EditOutlined, Publish } from '@material-ui/icons';

import { Button } from '../../../UI';

import { CreateCatalogItemDialog, EditCatalogItemDialog } from '../..';
import request from 'src/util/request';
import { useTranslation } from 'react-i18next';
import { ImportPackDto, useVendorApi } from 'src/services/api';
import { IngredientInput } from 'src/components/UI/IngredientInput';
import { Ingredient } from 'src/models/Ingredient';
import { Controller, useFieldArray, useForm } from 'hookform';

const useStyles = makeStyles( theme => ( {
  confirmButton: {
    background: theme.palette.primary.main,
    borderRadius: 8,
    color: '#fff',
    '&:hover.MuiIconButton-root': {
      background: theme.palette.primary.dark,
    },
  },
  ignoreButton: {
    background: theme.palette.secondary.main,
    borderRadius: 8,
    color: theme.palette.primary.main,
    '&:hover.MuiIconButton-root': {
      background: theme.palette.secondary.dark,
    },
  },
  newChip: {
    backgroundColor: '#a5cfa8',
  },
} ) );

export const VendorCatalogPage = ( ): ReactElement => {
  const { id } = useParams<{ id: string }>();
  const [ 
    { params: query }, 
    setQueryState
  ] = useQueryState( { page: '1', pageSize: '10' } );
  
  const [ isShowingCreateCatalogItem, setShowingCreateCatalogItem ] = useState( false );
  const [ editCatalogItem, setEditCatalogItem ] = useState<VendorItem|null>( null );

  const rVendors = useSWR<ListVendorsResponse>( '/vendors' );
  const rCatalog = useSWR<GetVendorItemsResponse>( `/vendors/${id}/catalog?page=${query.page}&pageSize=${query.pageSize}` );

  const vendor = rVendors.data?.vendors.find( vendor => vendor.id === id );

  const history = useHistory();

  const handleChangeVendor = ( id: string ): void => {
    history.replace( `/vendor/${id}/catalog`, history.location.state );
  };

  const handleChangePage = ( page: number ): void => {
    setQueryState({ ...query, page });
  };

  const handleChangePageSize = ( pageSize: number ): void => {
    setQueryState({ ...query, pageSize });
  };

  const isLoading = ! rCatalog.data && ! rCatalog.error;

  const [ numNewPacks, setNumNewPacks ] = useState( 0 );
  const [ numSkippedPacks, setNumSkippedPacks ] = useState( 0 );
  const [ updatedPacks, setUpdatedPacks ] = useState<ImportPackDto[]>( [] );
  const [ isImportMenuOpen, setImportMenuOpen ] = useState( false );

  const classes = useStyles();

  const inputElRef = useRef( null as HTMLInputElement|null );
  const importMenuAnchorRef = useRef( null );

  const vendorApi = useVendorApi();

  const handleFileSelect = async ( e: React.ChangeEvent ): Promise<void> => {
    const files = ( e.currentTarget as HTMLInputElement ).files;
    if ( ! files?.length )
      return;

    const file = files[0];

    if ( inputElRef.current )
      inputElRef.current.value = '';
    setImportMenuOpen( false );

    const result = await vendorApi.importCatalog( id, file );
    setUpdatedPacks( result.updatedPacks );
    const skippedPacks = result.newPacks.filter( pack => ! pack.catalogNumber && ! pack.ingredientName );
    const includedPacks = result.newPacks.filter( pack => pack.catalogNumber || pack.ingredientName);
    setNumNewPacks( includedPacks?.length ?? 0 );
    setNumSkippedPacks( skippedPacks.length );

    form.reset( {
      packs: includedPacks.map( pack => ({
        catalogNumber: pack.catalogNumber,
        price: +(pack.price ?? 0),
        numItems: +(pack.numItems ?? 1),
        amountPerItem: +(pack.amountPerItem ?? 1),
        uom: pack.uom,
        ingredientName: pack.ingredientName,
        makePrimary: !! pack.makePrimary,
        ingredient: pack.match
          ? {
              ...pack.match,
              isMatch: true,
            }
          : null,
      })),
    } );

    await rCatalog.mutate();
  };

  const handleClickDownload = async ( ): Promise<void> => {
    setImportMenuOpen( false );

    const { res } = await request.get(
      `/vendors/${id}/catalog/export`,
      { parseBody: false }
    );
    const blob = await res.blob();
    const url = URL.createObjectURL( blob );

    const anchor = document.createElement( 'a' );
    anchor.style.display = 'none';
    anchor.href = url;
    anchor.download = `${vendor?.name ?? 'Vendor'} Catalog - ReadyPrep.xlsx`;
    document.body.appendChild( anchor );
    anchor.click();
    anchor.remove();
  };

  const createIngredient = async ( name: string ) => {
    const body = { name };
    const { body: ingredient } = await request.post( '/pantry', { body } );
    return ingredient;
  }

  const { t } = useTranslation();

  const form = useForm<{
    packs: {
      catalogNumber: string;
      price: number;
      numItems: number;
      amountPerItem: number;
      uom: string;
      ingredientName: string;
      makePrimary: boolean;
      ingredient: {
        id: number;
        name: string;
        isMatch?: boolean;
      } | null;
    }[]
  }>();

  const newPacks = useFieldArray( {
    control: form.control,
    name: 'packs',
    keyName: 'key',
  } );

  return (
    <>
      <Helmet>
        <title>{ 
          `${vendor?.name ?? 'Vendor'} Catalog`
        }</title>
      </Helmet>
      <Box p={2} display="flex" flexDirection="column">
        <BackToLink />
        <Box display="flex" flexWrap="wrap" alignItems="flex-end">
          <Box flex={1} minHeight={56} p={1} display="flex" flexDirection="row" justifyContent="space-between" alignItems="center" flexWrap="wrap">
            <Box width="100%" display="flex" justifyContent="flex-start" alignItems="center">
              <Box pr={2}><Typography variant="h3">Catalog</Typography></Box>
              {
                rVendors.data &&
                <Box width={200}>
                  <TextInput 
                    label="Vendor"
                    select
                    onChange={ (e) => handleChangeVendor(e.target.value) }
                    value={id}
                  >
                    { rVendors.data.vendors.map( vendor => 
                      <MenuItem key={vendor.id} value={vendor.id}>{vendor.name}</MenuItem>
                    ) }
                  </TextInput>
                </Box>
              }
              <div
                style={{
                  flex: '0 1',
                  display: 'flex',
                  marginLeft: 'auto',
                  marginRight: 16,
                }}
                ref={ importMenuAnchorRef }
              >
                <Button
                  startIcon={<Publish />}
                  text={t( 'strings.import' )}
                  style={{ flex: 1 }}
                  onClick={() => setImportMenuOpen( true )}
                />
                <input
                  accept="text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  id="contained-button-file"
                  multiple
                  type="file"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                  ref={inputElRef}
                />
                <Menu
                  id="simple-menu"
                  keepMounted
                  open={ isImportMenuOpen }
                  onClose={() => setImportMenuOpen( false )}
                  anchorEl={ importMenuAnchorRef.current }
                >
                  <label
                    htmlFor="contained-button-file"
                    style={{ flex: 1, display: 'flex' }}
                  >
                    <MenuItem style={{ flex: 1 }}><Publish /><span style={{ paddingLeft: 8 }}>{t( 'elements.upload-menu.upload' )}</span></MenuItem>
                  </label>
                  <MenuItem onClick={ handleClickDownload }><Assignment /><span style={{ paddingLeft: 8 }}>{t( 'elements.upload-menu.download-template' )}</span></MenuItem>
                </Menu>
              </div>
              <Box>
                <Button onClick={() => setShowingCreateCatalogItem( true )}>+ New Catalog Item</Button>
              </Box>
            </Box>
            <Box display="flex" flexDirection="row" flexWrap="wrap">
            </Box>
          </Box>
        </Box>
        { ( (updatedPacks?.length ?? 0) + newPacks.fields.length ) > 0 &&
          <Box mb={2}>
            <Alert>
              { ( updatedPacks?.length ?? 0 ) > 0 &&
                <>
                  Updated {updatedPacks.length} catalog item{updatedPacks.length === 1 ? '' : 's'}.
                  <br />
                </>
              }
              {
                numSkippedPacks > 0 &&
                <>
                  Skipped {numSkippedPacks} pack{numSkippedPacks === 1 ? '' : 's'} with no catalog number or ingredient name.
                  <br />
                </>
              }
              { numNewPacks > 0 &&
                <>
                  Found {numNewPacks} new catalog item{numNewPacks === 1 ? '' : 's'}. Confirm ingredients to import.
                  <br />
                </>
              }
            </Alert>
          </Box>
        }
        {
          newPacks.fields.length > 0 &&
          <Box
            mb={3}
            display="grid"
            gridTemplateColumns="3fr auto auto 2fr auto"
            alignItems="stretch"
            style={{
              background: '#ffffff88',
              borderTop: '1px solid #e0e0e0',
              borderLeft: '1px solid #e0e0e0',
              borderRight: '1px solid #e0e0e0',
            }}
          >
            <Box p={2} style={{ background: '#fff', borderBottom: '1px solid #e0e0e0' }}>
              <Typography variant="subtitle1">
                Catalog Number
              </Typography>
            </Box>
            <Box p={2} style={{ background: '#fff', borderBottom: '1px solid #e0e0e0' }}></Box>
            <Box p={2} style={{ background: '#fff', borderBottom: '1px solid #e0e0e0' }}></Box>
            <Box
              py={2}
              style={{ background: '#fff', borderBottom: '1px solid #e0e0e0' }}
              display="flex"
              alignItems="center"
            >
              <Typography variant="subtitle1">
                Ingredient
              </Typography>
            </Box>
            <Box p={2} style={{ background: '#fff', borderBottom: '1px solid #e0e0e0' }}></Box>

            { newPacks.fields.map( (pack, i) => {
              console.log( { pack } );
              return (
                <React.Fragment key={pack.key}>
                  <Box
                    px={2}
                    display="flex"
                    alignItems="center"
                    style={{ borderBottom: '1px solid #e0e0e0' }}
                  >
                    <Box flex={0} minWidth={120}>
                      <Controller
                        control={form.control}
                        name={`packs.${i}.catalogNumber`}
                        defaultValue={pack.catalogNumber}
                        render={({ field }) => 
                          <TextInput
                            label="Catalog Number"
                            size="small"
                            { ...field }
                          />
                        }
                      />
                    </Box>
                    { pack.ingredientName &&
                      <Typography
                        style={{
                          marginLeft: 16,
                          fontSize: '1.2rem',
                          fontWeight: 500,
                          color: '#4D474D',
                        }}
                      >
                        { pack.ingredientName }
                      </Typography>
                    }
                  </Box>
                  <Box
                    p={2}
                    display="flex"
                    justifyContent="flex-start"
                    alignItems="center"
                    style={{ borderBottom: '1px solid #e0e0e0' }}
                  >
                    <Typography
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: 500,
                        color: '#4D474D',
                      }}
                    >
                      ${ (+pack.price).toFixed(2) } / {((+pack.numItems ?? 1) * (+pack.amountPerItem ?? 1)).toFixed(2).replace( /\.0*$/, '' ) } {pack.uom}
                    </Typography>
                  </Box>
                  <Box
                    pr={2}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    style={{ borderBottom: '1px solid #e0e0e0' }}
                  >
                    {
                      pack.ingredient?.isMatch
                        ? <Chip size="small" color="primary" label="MATCH" />
                        : <Chip size="small" label="NEW" style={{ backgroundColor: '#a5cfa8' }} />
                    }
                  </Box>
                  <Box
                    pr={6}
                    display="flex"
                    alignItems="center"
                    style={{ borderBottom: '1px solid #e0e0e0' }}
                  >
                    <Box width="100%">
                      <Controller
                        control={form.control}
                        name={`packs.${i}.ingredient` as const}
                        defaultValue={pack.ingredient}
                        render={({ field: { onChange, ...field } }) => 
                          <IngredientInput
                            type="pantry"
                            style={{
                              background: '#fff',
                            }}
                            value={field.value?.name}
                            onCreate={async (ingredient: Partial<Ingredient>) => {
                              const name = ingredient.name;
                              if ( typeof name === 'undefined' )
                                return;
                              ingredient = await createIngredient( name );
                              onChange( ingredient );
                            }}
                            onSelect={(ingredient: Ingredient) => {
                              onChange( ingredient );
                            }}
                          />
                        }
                      />
                    </Box>
                  </Box>
                  <Box
                    py={2}
                    pr={4}
                    whiteSpace="nowrap"
                    display="flex"
                    alignItems="center"
                    style={{ borderBottom: '1px solid #e0e0e0' }}
                  >
                    <Button 
                      className={ classes.confirmButton }
                      onClick={ async ( ) => {
                        const pack = form.getValues().packs[i];
                        newPacks.remove( i );
                        await vendorApi.confirmImport( id, pack );
                        await rCatalog.mutate();
                      } }
                      text="Confirm"
                    />
                    <span style={{ padding: '0 6px' }}>/</span>
                    <Button
                      className={ classes.ignoreButton }
                      onClick={ ( ) => { 
                        newPacks.remove( i );
                      } }
                      text="Skip"
                    />
                  </Box>
                </React.Fragment>
              )
            })}
          </Box>
        }
        <Box>
          { 
            isLoading && 
              <Box width="100%" display="flex" justifyContent="center"><CircularProgress/></Box>
          }
          { 
            rCatalog.error &&
              <Alert severity="error">{ rCatalog.error }</Alert>
          }
          {
            rCatalog.data &&
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ width: '30%' }}>
                      <Typography variant="subtitle1">Item</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle1">Catalog&nbsp;#</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle1">Price/pack</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle1">Units/pack</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle1">Amount per unit</Typography>
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  { rCatalog.data.items.map( (vendorItem: VendorItem) => 
                      <TableRow key={vendorItem.id}>
                        <TableCell><Link style={{ cursor: 'pointer' }} onClick={() => history.push(`/pantry/${vendorItem.pantryIngredient.scopedId}`)}>{vendorItem.pantryIngredient.name}</Link></TableCell>
                        <TableCell>{vendorItem.catalogNumber}</TableCell>
                        <TableCell>{vendorItem.price}</TableCell>
                        <TableCell>{vendorItem.numItems}</TableCell>
                        <TableCell>{vendorItem.amountPerItem} {vendorItem.unit}</TableCell>
                        <TableCell>
                          <Box textAlign="right">
                            <IconButton
                              style={{ cursor: 'pointer' }}
                              onClick={ () => { setEditCatalogItem( vendorItem ); } }
                            >
                              <EditOutlined />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )
                  }
                </TableBody>
              </Table>
          }
        </Box>
      </Box>
      { rCatalog.data && 
        <PaginationSection 
          numPages={rCatalog.data.numPages}
          currentPage={+query.page}
          pageSize={+query.pageSize}
          onChangePage={handleChangePage}
          onChangePageSize={handleChangePageSize}
        />
      }
      <CreateCatalogItemDialog
        open={isShowingCreateCatalogItem}
        onClose={() => setShowingCreateCatalogItem( false )}
        onConfirm={() => rCatalog.mutate()}
        vendorId={id}
      />
      { editCatalogItem?.id &&
        <EditCatalogItemDialog
          packId={editCatalogItem.id}
          open
          onClose={() => setEditCatalogItem( null )}
          onConfirm={() => rCatalog.mutate()}
          vendorId={id}
          ingredientId={editCatalogItem.pantryIngredient.scopedId}
        />
      }
    </>
  );
};
