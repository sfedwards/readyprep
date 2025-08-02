import { Box, Chip, Container, IconButton, MenuItem as MuiMenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, makeStyles } from '@material-ui/core';
import { EditOutlined } from '@material-ui/icons';
import { Formik } from 'formik';
import React, { ReactElement, useContext, useEffect, useState } from 'react';
import useSWR from 'swr';

import { AppContext } from '../../../../App';
import { MenuItem } from '../../../../models/MenuItem';
import request from '../../../../util/request';
import { Button } from '../../../UI/Button';
import { SquareConnectionButton } from '../../../UI/PosButtons/SquareButton';
import { TextInput } from '../../../UI/TextInput';
import MenuItemSelector from '../../MenuItemSelector';

interface SquareItem {
  id: string;
  item_data: {
    name: string;
    variations: any[];
  };
  match?: MenuItem;
  link?: MenuItem;
  ignored?: boolean;
}

interface SquareModifier {
  id: string;
  modifier_data: {
    name: string;
  };
  match?: MenuItem;
  link?: MenuItem;
  ignored?: boolean;
}

enum ItemType {
  REGULAR = 'REGULAR',
  MODIFIER = 'MODIFIER',
}

interface Item {
  link?: MenuItem;
  match?: MenuItem;
  ignored?: boolean;
  id: string;
  type: ItemType;
  name: string;
}

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

export const SquareAssociationsPage = ( ): ReactElement|null => {
  const rLocations = useSWR<{ id: string, name: string, pos?: string}[]>( '/square/locations' );

  const { handlePlanUpgradeRequired } = useContext( AppContext );

  useEffect( () => {
    if ( rLocations.error?.message === 'PLAN_UPGRADE_REQUIRED' )
      handlePlanUpgradeRequired( rLocations.error.plan );
       
  }, [ rLocations.error, handlePlanUpgradeRequired ] );

  let showingLocationSelector = false;
  if ( rLocations.data && rLocations.data.length > 1 && rLocations.data.filter( ( { pos } ) => pos ).length !== 1 )
    showingLocationSelector = true;
  

  const rItems = useSWR<Item[]>( ! rLocations.data || showingLocationSelector ? null : '/square/items', async () => {
    const { body: { items, modifiers } } = await request.get( '/square/items' );

    const allItems: Item[] = items.flatMap(
      ( item: SquareItem ) => item.item_data?.variations.map(
        variation => ( {
          id: variation.id,
          type: ItemType.REGULAR,
          name: item.item_data?.name + ( item.item_data.variations.length > 1 ? ` (${variation.item_variation_data?.name})` : '' ),
          match: variation.match,
          link: variation.link,
          ignored: !!variation.ignored,
        } )
      )
    );

    allItems.push( ...modifiers.map( ( modifier: SquareModifier ) => ( {
      id: modifier.id,
      type: ItemType.MODIFIER,
      name: modifier.modifier_data.name,
      match: modifier.match,
      link: modifier.link,
      ignored: !!modifier.ignored,
    } ) ) );

    allItems.sort( ( a, b ) => {
      if ( a.ignored && ! b.ignored )
        return 1;
      if ( b.ignored && ! a.ignored )
        return -1;
      if ( a.link && ! b.link )
        return 1;
      if ( b.link && ! a.link )
        return -1;
      if ( a.match && ! b.match )
        return 1;
      if ( ! a.match && b.match )
        return -1;
      return a.name.localeCompare( b.name );
    } );

    return allItems;
  } );

  const [ items, setItems ] = useState<Item[]>( [] );

  useEffect( () => {
    setItems( rItems.data ?? [] );
  }, [ rItems.data ] );

  const handleSelectLocation = async ( location: string ): Promise<void> => {
    await request.post( '/square/location', { body: { location } } );
    rLocations.mutate();
  };

  const classes = useStyles( );

  const handleSelectItem = ( item: Item, index: number ): void => {
    const newItems = [ ...items ];
    const newItem = { ...newItems[ index ] };
    delete newItem.link;
    newItem.match = item;
    newItems[ index ] = newItem;
    setItems( newItems );
  };

  const handleClickEdit = ( index: number ): void => {
    const newItems = [ ...items ];
    const newItem = { ...newItems[ index ] };
    if ( newItem.link )
      newItem.match = newItem.link;
    delete newItem.link;
    delete newItem.ignored;
    newItems[ index ] = newItem;
    setItems( newItems );
  };

  const handleIgnore = async ( index: number ): Promise<void> => {
    const body: { posId: string, item: 'ignore' }[] = [
      {
        posId: items[index].id,
        item: 'ignore',
      },
    ];
    await request.post( '/square/associate', { body } );
    rItems.mutate();
  };

  const handleConfirm = async ( filter?: ( index: number ) => boolean ): Promise<void> => {
    const body: { posId: string, item: string, name?: string }[] = [];
    for ( let i = 0; i < items.length; i++ ) {
      const item = items[i];

      if ( filter?.( i ) === false )
        continue;

      const data: {
        posId: string;
        item: string;
        name?: string;
      } = {
        posId: item.id,
        item: 'new',
        name: '',
      };
  
      if ( ! item.match?.id && ! item.link ) {
        if ( item.ignored )
          data.item = 'ignore';
        else
          data.name = item.match?.name ?? item.name;
      } else {
        data.item = ( item.match ?? item.link )!.id;
        delete data.name;
      }

      body.push( data );
    }

    await request.post( '/square/associate', { body } );
    rItems.mutate();
  };

  if ( rLocations.error ) {
    return (
      <Container maxWidth="sm">
        <Box flex={1} pt={8} display="flex" flexDirection="column" alignItems="center">
          <SquareConnectionButton />
        </Box>
      </Container>
    );
  }

  if ( ! rLocations.data )
    return null;

  if ( showingLocationSelector ) {
    return (
      <Container maxWidth="sm">
        <Box flex={1} pt={8} display="flex" flexDirection="column" alignItems="center">
          <Formik initialValues={{ location: '' }} onSubmit={ ( { location } ) => handleSelectLocation( location ) }>{
            ( { values, handleBlur, handleChange, handleSubmit } ) => (
              <>
                <Box pb={1}>
                  <Typography variant="h1">Choose Location</Typography>
                </Box>
                <TextInput name="location" size="small" select fullWidth={false} onChange={ handleChange } onBlur={ handleBlur } style={{ width: 'auto', minWidth: 280 }}>
                  <MuiMenuItem value={values.location} disabled>Select a Location</MuiMenuItem>
                  {
                    rLocations.data?.map( location => {
                      return <MuiMenuItem value={location.id}>{ location.name }</MuiMenuItem>;
                    } )
                  }
                </TextInput>
                {
                  values.location &&
                  <Box py={1}>
                    <Button onClick={ () => handleSubmit() }>Confirm</Button>
                  </Box>
                }
              </>
            )
          }
          </Formik>
        </Box>
      </Container>
    );
  }

  return <>
    <Box py={1} display="flex" justifyContent="space-between">
      <Typography variant="h1">POS Item Mapping</Typography>
      <Button onClick={ () => handleConfirm() }>Confirm All</Button>
    </Box>
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell style={{ width: '30%' }}>
              <Typography variant="subtitle1">POS</Typography>
            </TableCell>
            <TableCell colSpan={2} style={{ width: '48%' }}>
              <Typography variant="subtitle1" align="center">ReadyPrep Menu Item</Typography>
            </TableCell>
            <TableCell style={{ width: '22%' }}>
              <Typography variant="subtitle1">Action</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          { items.map( ( item, index ) => {
            const { name } = item.match ?? item.link ?? item;
            const isConfirmed = item.link || item.ignored;
            return (
              <React.Fragment key={ item.id }>
                <TableRow>
                  <TableCell>
                    { item.name }
                  </TableCell>
                  <TableCell style={{ width: '0.1%' }}>
                    <Box display="flex" justifyContent="center">
                      {
                        item.ignored
                          ? <Chip size="small" label="IGNORED" />
                          : item.link
                            ? <Chip size="small" label="Linked" />
                            : item.match?.id
                              ? <Chip size="small" color="primary" label="MATCH" />
                              : <Chip size="small" label="NEW" className={ classes.newChip } />
                      }
                    </Box>
                  </TableCell>
                  <TableCell>
                    { isConfirmed
                      ? <Typography variant="subtitle1">{ name }</Typography>
                      : <Selector item={ item } onSelect={ item => handleSelectItem( item, index ) } />
                    }
                  </TableCell>
                  <TableCell>
                    { isConfirmed
                      ? <IconButton onClick={ () => handleClickEdit( index ) } aria-label="Edit Item Link"><EditOutlined />Edit</IconButton>
                      : <Box whiteSpace="nowrap">
                        <Button className={ classes.confirmButton } onClick={ ( ) => handleConfirm( i => i === index ) } text="Confirm" />
                        <span style={{ padding: '0 12px' }}>/</span>
                        <Button className={ classes.ignoreButton } onClick={ ( ) => handleIgnore( index ) } text="Ignore" />
                      </Box>
                    }
                  </TableCell>
                </TableRow>
              </React.Fragment>
            );
          } ) }
        </TableBody>
      </Table>
    </TableContainer>
  </>;
};

interface SelectorProps {
  item: Item;
  onSelect?: ( item: Item ) => void;
}

const Selector = ( props: SelectorProps ): ReactElement => {
  const [ anchor, setAnchor ] = useState<HTMLElement|null>( null );

  const { item } = props;
  const { id = 'new', name } = item.match ?? item;

  const handleSelectMenuItem = ( item: Item ): void => {
    props.onSelect?.( item );
    setAnchor( null );
  };

  return ( <>
    <TextInput size="small" value={ id } select SelectProps={{
      open: false,
      onOpen: ( e: any ) => setAnchor( e.target ),
    }}>
      <MuiMenuItem key={ id } value={ id }>{ name }</MuiMenuItem>
    </TextInput>
    <MenuItemSelector
      onSelect={ handleSelectMenuItem }
      onClose={ () => setAnchor( null ) }
      anchorEl={ anchor }
      showing={ !! anchor }
      allowCreation={ true }
    />
  </> );
};
