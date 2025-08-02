import { Box, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@material-ui/core"

import { AddCircleOutline } from "@material-ui/icons"
import { Pack, PackRow } from "./PackRow"
import React, {  } from "react"
import { produce } from 'immer';

export interface PacksTableProps {
  packs: Pack[];
  setPacks: (packs: Pack[]) => void;
}

export const PacksTable = ( { packs, setPacks }: PacksTableProps ) => {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>
            <Typography variant="subtitle1" title="The Primary Pack is used for cost calculations">Primary</Typography>
          </TableCell>
          <TableCell style={{ width: '20%' }}>
            <Typography variant="subtitle1">Vendor</Typography>
          </TableCell>
          <TableCell>
            <Typography variant="subtitle1">Catalog&nbsp;#</Typography>
          </TableCell>
          <TableCell>
            <Typography variant="subtitle1">PAR</Typography>
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
        { packs?.map( (pack, i) => 
          <PackRow 
            key={i}
            pack={pack}
            index={i}
            setPack={ pack => {
              setPacks( produce( packs, packs => { packs.splice( i, 1, pack ) } ) )
            }}
            remove={ () => {
              setPacks( produce( packs, packs => { packs.splice( i, 1 ) } ) );
            }}
            onSetDefault={() => { 
              setPacks( packs.map( (pack, index) => ({ 
                ...pack,
                isDefault: index === i,
              })));
            }}
          /> 
          ) }
        <TableRow>
          <TableCell colSpan={8}>
            <Box textAlign="center">
              <IconButton onClick={() => {
                setPacks( [ ...packs, { } ] );
              }}><AddCircleOutline /></IconButton>
            </Box>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
} 