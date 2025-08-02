import { Box, Button as MuiButton } from '@material-ui/core';
import { useSnackbar } from 'notistack';
import React, { ReactElement } from 'react';
import useSWR from 'swr';

import request from '../../../../util/request';
import { Button } from '../../Button';
import { SquareIcon } from '../../Icons';

export const DisconnectSquareButton = ( ): ReactElement => {
  const rIntegrations = useSWR( '/pos' );

  const { enqueueSnackbar } = useSnackbar();

  const handleDisconnect = async ( pos: string ): Promise<void> => {
    await request.delete( `/${pos}` );
    const posName = pos[0].toUpperCase() + pos.slice( 1 );
    enqueueSnackbar( `Disconnected from ${posName}`, { variant: 'success' } );
    rIntegrations.mutate();
  };

  return (
    <>
      <Button style={{ flex: 1, background: '#000', cursor: 'default', padding: '14px 24px' }}>
        <Box display="flex" alignItems="center">
          <Box display="inline" fontSize="1.6em" lineHeight={0} my={0.5} mr={1.5}><SquareIcon /></Box>
          <Box display="inline">
            {'Connected'}
          </Box>
        </Box>
      </Button>
      <MuiButton variant="text" color="primary" onClick={() => handleDisconnect( 'square' )} style={{ flex: 0, margin: 'auto', textAlign: 'center', padding: 0 }}>Disconnect</MuiButton>
    </>
  );
};
