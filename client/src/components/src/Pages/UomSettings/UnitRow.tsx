import { Box, IconButton, Portal, TableCell, TableRow, Tooltip, makeStyles } from '@material-ui/core';
import { EditOutlined } from '@material-ui/icons';
import React, { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Unit } from '../../../../models/Unit';
import request from '../../../../util/request';
import { DeleteButton } from '../../../UI/DeleteButton';
import { DeleteDialog } from '../../../UI/DeleteDialog';

interface Props {
  unit: Unit;
  onDelete: () => void;
  onClickEdit: () => void;
}

const useStyles = makeStyles( theme => ( {
  row: {
    background: '#fff',
    height: 69,
    '&:hover': {
      background: '#f5fcff',
    },
  },
} ) );

export const UnitRow = ( props: Props ): ReactElement => {
  const { unit } = props;
  const { id, name, symbol, amount, unit: definitionUnit } = unit;
  const classes = useStyles();
  const { t } = useTranslation();

  const [ showingDeleteDialog, setShowingDeleteDialog ] = useState( false );
  const [ usage, setUsage ] = useState<any>( );

  const handleClickDelete = async ( ): Promise<void> => {
    setUsage( null );
    setShowingDeleteDialog( true );
    const { body: usage } = await request.post( `/units/${id}/getUsage` );
    setUsage( usage );
  };

  const handleConfirmDelete = async ( ): Promise<void> => {
    setShowingDeleteDialog( false );
    await request.delete( `/units/${id}` );
    props.onDelete( );
  };

  return ( <>
    <TableRow className={classes.row}>
      <TableCell>
        <Tooltip title={name}>
          <Box maxHeight="2em" overflow="hidden">{name}</Box>
        </Tooltip>
      </TableCell>
      <TableCell>{symbol}</TableCell>
      <TableCell>
        {amount?.toFixed( 4 ).replace( /\.0*$/, '' )}
      </TableCell>
      <TableCell>
        {definitionUnit}
      </TableCell>
      <TableCell>
        <Box textAlign="right">
          { id && <IconButton onClick={ props.onClickEdit }><EditOutlined /></IconButton> }
          { id && <DeleteButton onClick={ handleClickDelete } /> }
        </Box>
      </TableCell>
    </TableRow>
    <Portal>
      <DeleteDialog itemName={t( 'strings.unit-of-measure' )} usage={usage} showing={showingDeleteDialog} onClose={() => setShowingDeleteDialog( false )} onConfirm={ handleConfirmDelete } />
    </Portal>
  </> );
};
