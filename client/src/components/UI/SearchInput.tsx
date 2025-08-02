import { InputAdornment, TextFieldProps, makeStyles } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { TextInput } from './TextInput';

const useStyles = makeStyles( theme => ( {
  root: {
    background: '#fff',
  },
  input: {
    padding: 12,
    [theme.breakpoints.down( 'sm' )]: {
      fontSize: '0.8rem',
    },
  },
  icon: {
    cursor: 'pointer',
  },
} ) );

type Props = Omit< TextFieldProps, 'onChange' | 'onSubmit' > & {
  onChange: ( query: string ) => void;
  onSubmit?: ( ) => void;
};

export const SearchInput = ( props: Props ): ReactElement => {
  const { t } = useTranslation();
  const classes = useStyles();

  const { onChange, onSubmit, ...otherProps } = props;

  const handleChange = ( e: any ): void => {
    props.onChange?.( e.target.value );
  };

  const handleSubmit = ( ): void => {
    props.onSubmit?.();
  };

  return (
    <TextInput
      label={false}
      placeholder={t( 'strings.search-name' )}
      size="small"
      onChange={handleChange}
      onKeyPress={( e: React.KeyboardEvent ) => {
        if ( e.key === 'Enter' ) handleSubmit();
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start" onClick={handleSubmit} className={classes.icon}>
            <SearchIcon />
          </InputAdornment>
        ),
        classes,
      }}
      { ...otherProps }
      value={props.value}
    />
  );
};
