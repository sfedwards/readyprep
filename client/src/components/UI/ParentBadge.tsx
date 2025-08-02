import { Badge, BadgeProps, makeStyles } from '@material-ui/core';
import React, { ReactElement } from 'react';

const useStyles = makeStyles( theme => ( {
  root: {
    position: 'absolute',
    top: 0,
    right: 0,
    cursor: 'pointer',
  },
  badge: {
    background: theme.palette.secondaryGray.main,
    color: '#fff',
    width: 24,
    height: 24,
    borderRadius: 12,
  },
} ) );

export const ParentBadge = ( props: BadgeProps ): ReactElement => {
  const classes = useStyles();
  return <Badge classes={ classes } { ...props } />;
};
