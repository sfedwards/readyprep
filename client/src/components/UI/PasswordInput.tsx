import { IconButton, InputAdornment } from '@material-ui/core';
import { Visibility, VisibilityOff } from '@material-ui/icons';
import React, { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TextInput, TextInputProps } from './TextInput';

export type PasswordInputProps = TextInputProps;

export const PasswordInput = ( props: PasswordInputProps ): ReactElement => {
  const [ showingPassword, setShowingPassword ] = useState( false );
  const { t } = useTranslation();

  const handleClickShowPassword = ( ): void => setShowingPassword( ! showingPassword );

  return (
    <TextInput
      type={ showingPassword ? 'text': 'password' }
      label={t( 'strings.password' )}
      required
      fullWidth
      InputProps={{
        endAdornment: (
          <InputAdornment position="end" style={{ marginTop: -8, display: 'flex' }}>
            <IconButton
              aria-label={t( 'elements.login.toggle-password-visibility-label' )}
              onClick={handleClickShowPassword}
            >
              { showingPassword ? <Visibility /> : <VisibilityOff /> }
            </IconButton>
          </InputAdornment>
        ),
      }}
      {...props}
    />
  );
};
