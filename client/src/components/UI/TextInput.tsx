import React, { ReactElement } from 'react';
import { TextField, TextFieldProps, makeStyles } from '@material-ui/core';

import { useField } from 'formik';

export type TextInputProps = Omit<TextFieldProps, 'variant'>;

const useStyles = makeStyles( theme => ( {
  root: ( props: TextInputProps ) => ( {
    width: '100%',
    overflow: 'hidden',
    '& textarea': {
      background: '#fff',
    }
  } ),
  label: ( props: TextInputProps ) => ( {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    maxWidth: '80%',
    paddingRight: 16,
    '&.MuiFormLabel-root.Mui-disabled': {
      color: theme.palette.text.primary,
    },
  } ),
  input: ( props: TextInputProps ) => ( {
    background: props.disabled ? '#F0EBF0' : '#fff',
    paddingTop: props.label ? 8 : 0,
    [theme.breakpoints.down( 'sm' )]: {
      '&&&': {
        'input, select': {
          paddingTop: props.label ? 18: 0,
        },
      },
    },
    '& fieldset': {
      borderWidth: props.disabled ? 0 : 1,
    },
    '& .MuiInputAdornment-root': {
      marginTop: props.label ? 18 : 2,
      '& p': {
        fontSize: '0.8em',
      },
    },
  } ),

} ) );

export const useTextInputStyles = useStyles;

export const TextInput = ( props: TextInputProps ): ReactElement => {
  const classes = useStyles( props );

  const { InputProps, ...remainingProps } = props;

  return (
    <TextField
      className={ `${props.label ? 'labelled' : ''} ${classes.root}` }
      InputLabelProps={ props.label ?
        {
          shrink: false,
          variant: 'filled',
          className: classes.label,
        }
        : { shrink: true, variant: 'outlined' }
      }
      variant="outlined"
      InputProps={{
        notched: false,
        className: classes.input,
        ...InputProps,
      }}
      { ...remainingProps }
    />
  );
  
};

export const TextInputF = ( props: TextInputProps & { name: string } ): ReactElement => {
  const [ field ] = useField( props.name );
  return <TextInput {...field} { ...props } />;
};
