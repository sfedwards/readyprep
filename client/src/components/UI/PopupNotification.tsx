import { Popover, PopoverProps, Typography, makeStyles } from '@material-ui/core';
import React, { ReactElement } from 'react';

interface PopupNotificationProps extends PopoverProps {
  title?: string
  maxWidth?: string|number,
}

const useStyles = makeStyles( theme => ( {
  paper: {
    padding: '20px',
    maxWidth: ( props: PopupNotificationProps ) => props.maxWidth,
    textAlign: 'center',
  },
} ) );

export const PopupNotification = ( props: PopupNotificationProps ): ReactElement => {
  const { title, children, ...rest } = props;

  const classes = useStyles( props );

  return ( <>
    <Popover
      anchorOrigin={{
        vertical: 'center',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'center',
        horizontal: 'center',
      }}
      { ...rest }
      classes={ classes }
    >
      { title && <Typography variant="h5" color="primary">{title}</Typography> }
      { children }
    </Popover>
  </> );
};
