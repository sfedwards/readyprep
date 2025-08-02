import { Box, Collapse, Grow, Theme, makeStyles } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import React from 'react';

export interface MessageProps {
  showing?: boolean;
  onClose?: () => void;
}

const useStyles = makeStyles( ( theme: Theme ) => ( {
  root: {
    background: theme.palette.disabled.main,
    borderColor: theme.palette.primary.main,
  },
  icon: {
    '&&': {
      color: theme.palette.primary.main,
    },
  },
} ) );


export const Message: React.FC<MessageProps> = props => {
  const { children, onClose, showing } = Object.assign( {}, Message.defaultProps, props );

  const classes = useStyles();

  return (
    <Collapse in={showing} appear={true} timeout={{ enter: 300, exit: 800 }}>
      <Grow in={showing} appear={true} timeout={{ enter: 1200, exit: 800 }}>
        <Box p={2} pb={0}>
          <Alert variant="outlined" severity="info" classes={ classes } onClose={onClose}>
            { children }
          </Alert>
        </Box>
      </Grow>
    </Collapse>
  );
};

Message.defaultProps = {
  showing: true,
};
