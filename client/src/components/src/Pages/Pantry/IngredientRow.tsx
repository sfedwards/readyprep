import { Box, TableCell, TableRow, Tooltip } from '@material-ui/core';
import React, { ReactElement } from 'react';
import { Link } from 'react-router-dom';

import { ForwardButton } from '../../ForwardButton';

interface Props {
  ingredient: any
}

export const IngredientRow = ( props: Props ): ReactElement => {
  const { ingredient } = props;
  const { id, name, pricePerPack, itemsPerPack, amountPerItem, uom, parLevel } = ingredient;

  return (
    <TableRow>
      <TableCell>
        <Tooltip title={name}>
          <Box maxHeight="2em" overflow="hidden"><Link to={`/pantry/${id}`}>{name}</Link></Box>
        </Tooltip>
      </TableCell>
      <TableCell>{pricePerPack != null ? '$' + pricePerPack.toFixed( 2 ).replace( /\.0*$/, '' ) : '\u00a0--\u00a0' }</TableCell>
      <TableCell>{itemsPerPack != null ? itemsPerPack.toFixed( 2 ).replace( /\.0*$/, '' ) : '\u00a0--\u00a0' }</TableCell>
      <TableCell>
        <Tooltip title={ `${amountPerItem} ${uom.name}` }><span>{amountPerItem} {uom.symbol}</span></Tooltip>
      </TableCell>
      <TableCell>{parLevel != null ? parLevel.toFixed( 2 ).replace( /\.0*$/, '' ) : '\u00a0--\u00a0' }</TableCell>
      <TableCell>
        <ForwardButton destination={`/pantry/${id}`} />
      </TableCell>
    </TableRow>
  );
};
