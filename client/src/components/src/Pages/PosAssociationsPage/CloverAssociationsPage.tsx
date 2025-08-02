import { Box, Chip, IconButton, MenuItem as MuiMenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, makeStyles } from '@material-ui/core';
import { EditOutlined } from '@material-ui/icons';
import React, { ReactElement, useEffect, useState } from 'react';
import useSWR from 'swr';

import { MenuItem } from '../../../../models/MenuItem';
import request from '../../../../util/request';
import { Button } from '../../../UI/Button';
import { TextInput } from '../../../UI/TextInput';
import MenuItemSelector from '../../MenuItemSelector';

interface CloverItem {
  id: string;
  name: string;
  match?: MenuItem;
  link?: MenuItem;
  ignored?: boolean;
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

export const CloverAssociationsPage = ( ): ReactElement|null => {
  const rCloverItems = useSWR<CloverItem[]>( '/pos/clover/items', async () => {
    const { body: { items } } = await request.get( '/pos/clover/items' );

    const allCloverItems: CloverItem[] = items.map(
      ( item: CloverItem ) => ({
          id: item.id,
          name: item.name,
          match: item.match,
          link: item.link,
          ignored: !!item.ignored,
      } )
    );

    allCloverItems.sort( ( a, b ) => {
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

    return allCloverItems;
  } );

  const [ items, setCloverItems ] = useState<CloverItem[]>( [] );

  useEffect( () => {
    setCloverItems( rCloverItems.data ?? [] );
  }, [ rCloverItems.data ] );

  const classes = useStyles( );

  const handleSelectCloverItem = ( item: CloverItem, index: number ): void => {
    const newCloverItems = [ ...items ];
    const newCloverItem = { ...newCloverItems[ index ] };
    delete newCloverItem.link;
    newCloverItem.match = item;
    newCloverItems[ index ] = newCloverItem;
    setCloverItems( newCloverItems );
  };

  const handleClickEdit = ( index: number ): void => {
    const newCloverItems = [ ...items ];
    const newCloverItem = { ...newCloverItems[ index ] };
    if ( newCloverItem.link )
      newCloverItem.match = newCloverItem.link;
    delete newCloverItem.link;
    delete newCloverItem.ignored;
    newCloverItems[ index ] = newCloverItem;
    setCloverItems( newCloverItems );
  };

  const handleIgnore = async ( index: number ): Promise<void> => {
    const body: { posId: string, item: 'ignore' }[] = [
      {
        posId: items[index].id,
        item: 'ignore',
      },
    ];
    await request.post( '/pos/clover/associate', { body } );
    rCloverItems.mutate();
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

    await request.post( '/pos/clover/associate', { body } );
    rCloverItems.mutate();
  };

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
                      : <Selector item={ item } onSelect={ item => handleSelectCloverItem( item, index ) } />
                    }
                  </TableCell>
                  <TableCell>
                    { isConfirmed
                      ? <IconButton onClick={ () => handleClickEdit( index ) } aria-label="Edit CloverItem Link"><EditOutlined />Edit</IconButton>
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
  item: CloverItem;
  onSelect?: ( item: CloverItem ) => void;
}

const Selector = ( props: SelectorProps ): ReactElement => {
  const [ anchor, setAnchor ] = useState<HTMLElement|null>( null );

  const { item } = props;
  const { id = 'new', name } = item.match ?? item;

  const handleSelectMenuItem = ( item: CloverItem ): void => {
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
