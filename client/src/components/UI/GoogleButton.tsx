import { Box, Paper, Typography, makeStyles } from '@material-ui/core';
import React, { ReactElement } from 'react';

import { GoogleIcon } from './Icons';

interface GoogleButtonProps {
  url: string;
  text: string;
}

const useStyles = makeStyles( {
  button: {
    padding: '0.5rem 1.5rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
} );

export const GoogleButton = ( props: GoogleButtonProps ): ReactElement => {
  const classes = useStyles();

  return (
    <Box py="2rem" textAlign="center" display="flex" justifyContent="center">
      <a href={props.url}>
        <Paper className={classes.button}>
          <Box display="flex" alignItems="center">
            <GoogleIcon />
            <Typography color="primary" variant="body2">
              {props.text}
            </Typography>
          </Box>
        </Paper>
      </a>
    </Box>
  );
};
