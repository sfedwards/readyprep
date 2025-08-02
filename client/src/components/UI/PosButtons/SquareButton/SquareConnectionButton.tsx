import { Box } from '@material-ui/core';
import React, { ReactElement } from 'react';
import useSWR from 'swr';

import { ConnectSquareButton } from './ConnectSquareButton';
import { DisconnectSquareButton } from './DisconnectSquareButton';

export const SquareConnectionButton = ( ): ReactElement => {
  const rIntegrations = useSWR( '/pos' );
  return ( <Box display="flex" flexDirection="column" alignItems="center">
    {
      rIntegrations.data
        ? rIntegrations.data.square
          ? <DisconnectSquareButton />
          : <ConnectSquareButton />
        : ''
    }
  </Box> );
};
