import React, { ReactElement } from 'react';
import { Box, Typography } from '@material-ui/core';
import { CloverIcon } from '../../Icons';

const OAUTH_URL = process.env.REACT_APP_ENV === 'development'
  ? `https://sandbox.dev.clover.com/oauth/authorize?client_id=${process.env.REACT_APP_CLOVER_CLIENT_ID}`
  : `https://www.clover.com/oauth/authorize?client_id=${process.env.REACT_APP_CLOVER_CLIENT_ID}`;

export const ConnectCloverButton = ( ): ReactElement => {
  return (
    <a href={OAUTH_URL}>
      <Box
        display="flex"
        alignItems="center"
        style={{
          width: 240,
          height: 48,
          background: '#fff',
          border: '2px solid #280',
          borderRadius: 8,
        }}
        >
        <Box
          width={56}
          my={0.5}
          mr={1.5}
          fontSize="1.6em"
          lineHeight={0}
          textAlign="right"
        >
          <CloverIcon />
        </Box>
        <Typography
          style={{
            fontSize: '1.1rem',
            fontWeight: 500,
            color: '#280',
          }}
        >
          Connect Clover
        </Typography>
      </Box>
    </a>
  );
};