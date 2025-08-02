import { Button as MuiButton, ButtonProps as MuiButtonProps, makeStyles, useTheme } from '@material-ui/core';
import React from 'react';

export interface ButtonProps extends MuiButtonProps {
  text?: string
}

const useStyles = makeStyles( theme => ( {
  root: {
    backgroundColor: theme.palette.primary.main,
    color: '#fff',
    borderRadius: 8,
    textTransform: 'none',
    fontWeight: 500,
    fontSize: '1.1rem',
    [theme.breakpoints.down( 'md' )]: {
      fontSize: '0.8rem',
    },
    '&:hover': {
      backgroundColor: theme.palette.primary.light,
    },
    paddingLeft: 16,
    paddingRight: 16,
  },
  startIcon: {
    [theme.breakpoints.down( 'md' )]: {
      marginRight: 4,
    },
    [theme.breakpoints.down( 'xs' )]: {
      marginRight: 10,
    },
  },
} ) );

export const Button: React.FC<ButtonProps> = props => {
  const theme = useTheme();
  const classes = useStyles( theme );

  const { children, text, ...buttonProps } = props;

  return <MuiButton className={classes.root} classes={classes} {...buttonProps}>{ children ?? text }</MuiButton>;
};
