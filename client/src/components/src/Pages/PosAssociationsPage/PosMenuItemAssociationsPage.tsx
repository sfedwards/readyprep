import { Box, Typography } from '@material-ui/core';
import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { ConnectCloverButton } from 'src/components/UI/PosButtons/CloverButton/ConnectCloverButton';
import { ConnectSquareButton, SquareConnectionButton } from 'src/components/UI/PosButtons/SquareButton';
import { usePosApi } from 'src/services/api';
import { ListConnectedPosResponse } from 'src/services/api/pos';
import useSWR from 'swr';
import { CloverAssociationsPage } from './CloverAssociationsPage';
import { SquareAssociationsPage } from './SquareAssociationsPage';

export const PosMenuItemAssociationsPage = ( ): ReactElement|null => {

  const posApi = usePosApi();
  const rPosIntegrations = useSWR<ListConnectedPosResponse>([posApi.listConnectedPos]);

  const { t } = useTranslation();

  if ( ! rPosIntegrations.data )
    return null;

  const integrations = rPosIntegrations.data;

  if ( integrations.square?.status === 'ACTIVE' ) {
    return <SquareAssociationsPage />
  }

  if ( integrations.clover?.status === 'ACTIVE' ) {
    return <CloverAssociationsPage />
  }

  return (
    <>
      <Box
        p={2}
        display="flex" 
        flexDirection="column"
        justifyContent="flex-start"
      >
        <Typography variant="h5">{ t( 'strings.connect-POS' ) }</Typography>
        <Typography variant="body2">Connect your POS to automatically calculate prep requirements and inventory</Typography>
        <Box
          py={2}
          display="flex"
          flexWrap="wrap"
          style={{
            rowGap: 20,
          }}
        >
          <Box mr={2}><ConnectSquareButton /></Box>
          <Box mr={2}><ConnectCloverButton /></Box>
        </Box>
      </Box>
    </>
  );
}