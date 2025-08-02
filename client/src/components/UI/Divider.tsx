import { Box, Divider as MuiDivider, Typography } from '@material-ui/core';
import React, { ReactElement } from 'react';

interface DividerProps {
  text?: string;
}

export const Divider = ( props: DividerProps ): ReactElement => {
  return ( <>
    <MuiDivider light style={{ margin: '4px -1.5rem' }} />

    { props.text &&
      <Box mt="-1em" display="flex" justifyContent="center">
        <Box flex="shrink" px="2rem" style={{ background: '#fff' }}>
          <Typography variant="body2" style={{ lineHeight: '1em' }}>{props.text}</Typography>
        </Box>
      </Box>
    }
  </> );
};
