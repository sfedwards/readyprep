import { Tooltip, makeStyles } from '@material-ui/core';
import { WarningRounded } from '@material-ui/icons';
import React, { ReactElement } from 'react';

interface WarningIconProps {
  tooltip: string;
}

const useStyles = makeStyles( {
  icon: {
    color: '#eb6',
  },
} );

export const WarningIcon = ( props: WarningIconProps ): ReactElement => {
  const classes = useStyles();
  return (
    <Tooltip title={props.tooltip}>
      <WarningRounded className={classes.icon} />
    </Tooltip>
  );
};
