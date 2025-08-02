import { Box, IconButton, TableCell, TableRow, makeStyles, Radio, useTheme, useMediaQuery } from "@material-ui/core";
import { CheckCircleOutline, Clear, EditOutlined } from "@material-ui/icons";
import { DeleteButton, TextInput, UnitInput } from "../../../../UI";
import React, { useState } from "react";

import { Unit } from "../../../../../models/Unit";
import { VendorInput } from "../../../..";
import formatNumber from "../../../../../util/formatNumber";

export interface PackRowProps {
  pack: Pack;
  index: number;
  setPack: (pack: Pack) =>void;
  remove?: () => void;
  insert?: (pack: any) => void;
  onSetDefault: () => void;
}

const useStyles = makeStyles( theme => ( {
  completeRowButton: {
    borderRadius: 8,
    '&:hover.MuiIconButton-root': {
      background: theme.palette.primary.dark,
      color: '#fff',
    },
  }
} ) );

export interface Pack {
  id?: string;
  vendor?: {
    id: string;
    name: string;
  };
  catalogNumber?: string;
  par?: number;
  price?: number;
  numItems?: number;
  amountPerItem?: number;
  unit?: Unit;
  isDefault?: boolean;
}

export const PackRow = ( props: PackRowProps ) => {
  const { pack, index, setPack } = props;

  const [ isEditing, setEditing ] = useState( pack?.id ? false : true );

  const classes = useStyles();

  const theme = useTheme();
  const isLargeScreen = useMediaQuery( theme.breakpoints.up( 'md' ) );

  if ( isEditing || ! pack ) {
    return (
      <TableRow>
        <TableCell>
          <Radio 
            name="defaultPackIndex" 
            value={index}
            color="primary"
            checked={pack.isDefault}
            onChange={() => props.onSetDefault()}
          />
        </TableCell>
        <TableCell>
          <VendorInput 
	          name="vendor"
            value={pack.vendor}
            onChange={vendor => setPack( { ...pack, vendor } )}
          />
        </TableCell>
        <TableCell>
          <TextInput 
            value={pack.catalogNumber}
            size="small"
            label={ isLargeScreen ? 'Catalog #' : '' }
            onChange={e => setPack( { ...pack, catalogNumber: e.target.value })}
          />
        </TableCell>
        <TableCell></TableCell>
        <TableCell>
          <TextInput 
            value={pack.price}
            size="small"
            label={ isLargeScreen ? 'Price' : '' }
            onChange={e => setPack( { ...pack, price: +e.target.value } )}
          />
        </TableCell>
        <TableCell>
          <TextInput 
            value={pack.numItems}
            size="small"
            label={ isLargeScreen ? 'Units/pack' : '' }
            onChange={e => setPack( { ...pack, numItems: +e.target.value })}
          />
        </TableCell>
        <TableCell>
          <Box display="flex">
            <TextInput 
              value={pack.amountPerItem}
              size="small"
              label={ isLargeScreen ? 'Amount per unit' : '' }
              style={{ marginRight: 16, minWidth: 120 }}
              onChange={e => setPack( { ...pack, amountPerItem: +e.target.value })}
            />
            <UnitInput 
              size="small"
              label={ isLargeScreen ? 'UOM' : '' }
              onSelect={unit => setPack( { ...pack, unit })}
              value={pack?.unit?.symbol}
            />
          </Box>
        </TableCell>
        <TableCell>
          <Box textAlign="right" whiteSpace="nowrap">
            <IconButton 
              style={{ cursor: 'pointer' }}
              onClick={ () => { 
                props.remove?.();
                props.insert?.({ });
              }}
            >
              <Clear />
            </IconButton>
            <IconButton
              className={classes.completeRowButton}
              onClick={ () => setEditing( false ) }
            >
              <CheckCircleOutline />
            </IconButton>
          </Box>
        </TableCell>
      </TableRow>
    );
  }
  
  return (
    <TableRow key={(pack as any).hookformId}>
      <TableCell>
        <Radio 
          name="defaultPackIndex" 
          value={index}
          color="primary"
          checked={pack.isDefault}
          onChange={() => props.onSetDefault()}
        />
      </TableCell>
      <TableCell>{pack.vendor?.name || 'Default'}</TableCell>
      <TableCell>{pack.catalogNumber}</TableCell>
      <TableCell>{pack.par ? formatNumber( pack.par ) : '--'}</TableCell>
      <TableCell>${pack.price}</TableCell>
      <TableCell>{pack.numItems}</TableCell>
      <TableCell>{pack.amountPerItem} {pack.unit?.symbol}</TableCell>
      <TableCell>
        <Box textAlign="right">
          <IconButton style={{ cursor: 'pointer' }} onClick={ () => setEditing( true ) }><EditOutlined /></IconButton>
          <DeleteButton mild={true} onClick={ () => {
            props.remove?.();
          }
          } />
        </Box>
      </TableCell>
    </TableRow>
  );
}