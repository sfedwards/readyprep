import { IconButton, IconButtonProps, makeStyles } from '@material-ui/core';
import { DeleteOutlined } from '@material-ui/icons';
import React, { ReactElement } from 'react';

type DeleteButtonProps = {
  mild?: boolean;
  onClick: () => void;
} & IconButtonProps;

const useStyles = makeStyles( theme => ( {
  root: ( props: DeleteButtonProps ) => ( {
    color: props.mild ? theme.palette.text.primary : theme.palette.error.main,
    cursor: 'pointer',
  } ),
} ) );

export const DeleteButton = ( props: DeleteButtonProps ): ReactElement => {
  const classes = useStyles( props );
  const { onClick, ...otherProps } = props;
  return (
    <IconButton onClick={onClick} className={classes.root} aria-label="Delete" {...otherProps }><DeleteOutlined /></IconButton>
  );
};
