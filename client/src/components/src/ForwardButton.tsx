import { Box, makeStyles } from '@material-ui/core';
import { ArrowForward } from '@material-ui/icons';
import React, { ReactElement } from 'react';
import { useHistory } from 'react-router-dom';

export interface ForwardButtonProps {
  destination: string;
}

const useStyles = makeStyles( theme => ( {
  icon: {
    cursor: 'pointer',
    color: theme.palette.primary.main,
    '&:hover': {
      color: theme.palette.primary.dark,
    },
  },
} ) );

export const ForwardButton = ( props: ForwardButtonProps ): ReactElement => {
  const classes = useStyles();
  const history = useHistory();

  return (
    <Box textAlign="right" onClick={ () => history.push( props.destination, { previousTitle: document.title } ) }>
      <ArrowForward className={classes.icon} />
    </Box>
  );
};
