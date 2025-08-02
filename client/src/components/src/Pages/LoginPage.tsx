import { Box, Button, Checkbox, Container, FormControlLabel, Typography, withStyles } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import * as qs from 'query-string';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useHistory, useLocation } from 'react-router-dom';

import request from '../../../util/request';
import { Divider } from '../../UI/Divider';
import { GoogleButton } from '../../UI/GoogleButton';
import { Logo } from '../../UI/Logo';
import { PasswordInput } from '../../UI/PasswordInput';
import { TextInput } from '../../UI/TextInput';

interface Props {
  classes: {
    logInButton: string;
    dialog: string;
  } ;
  onLogIn?: ( ) => void;
}

const styles = {
  dialog: {
    background: '#fff',
  },
  logInButton: {
    color: '#fff',
    paddingTop: '1.375rem',
    paddingBottom: '1.375rem',
    fontWeight: 700,
    fontSize: '1.1rem',
    borderRadius: 0,
  },
};

export const LoginPage = withStyles( styles )( ( props: Props ) => {
  const { t } = useTranslation();
  const [ email, setEmail ] = useState( '' );
  const [ password, setPassword ] = useState( '' );
  const [ rememberMe, setRememberMe ] = useState( false );
  const [ successMessage, setSuccessMessage ] = useState( '' );
  const [ errorMessage, setErrorMessage ] = useState( '' );

  const history = useHistory();

  const query = useLocation().search;

  useEffect( () => {
    const parsed = qs.parse( query );
    if ( 'reset' in parsed )
      setSuccessMessage( t( 'strings.password-successfully-changed' ) );
    if ( 'logout' in parsed )
      setSuccessMessage( 'Successfully logged out' );
    if ( 'expired' in parsed )
      setErrorMessage( t( 'strings.session-expired' ) );
    history.replace( '/login' );
  }, [ query, history, t ] );

  const { classes } = props;

  const handleToggleRememberMe = (): void => {
    setRememberMe( ! rememberMe );
  };

  const handleLoginSubmit = async ( e: React.FormEvent<HTMLFormElement> ): Promise<void> => {
    e.preventDefault();

    try {
      const { status, body } = await request.post( '/auth/login', {
        body: {
          email,
          password,
          rememberMe,
        },
        noThrow: true,
      } );

      if ( status === 401 )
        throw new Error( t( 'strings.incorrect-credentials' ) );
      
      
      if ( status !== 201 )
        throw new Error( body.message || t( 'strings.unknown-error' ) );
      
      
      props.onLogIn?.();
    } catch ( e: any ) {
      setErrorMessage( e.message );
    }
  };

  return ( <>
    <Helmet>
      <title>ReadyPrep | Log In</title>
    </Helmet>
    <Container maxWidth="sm" disableGutters>
      <Container className={classes.dialog}>
        <Box py="3rem" textAlign="center">
          <a href="https://readyprep.io/"><Logo style={{ height: '6rem' }} /></a>
        </Box>

        <Box px="1rem" pb="2rem">

          { errorMessage && <Alert severity="error">{ errorMessage }</Alert> }
          { successMessage && <Alert>{ successMessage }</Alert> }

          <form onSubmit={ handleLoginSubmit }>
            <TextInput
              type="email"
              label={ t( 'strings.email' ) }
              value={ email }
              onChange={ ( e: any ) => setEmail( e.target.value ) }
              autoFocus
              required
              fullWidth
            />
            
            <PasswordInput value={password} onChange={ ( e: any ) => setPassword( e.target.value ) } />

            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={handleToggleRememberMe}
                  name="remember-me"
                  color="primary"
                />
              }
              label={t( 'strings.remember-me' )}
            />

            <Link to="/password/reset" style={{ float: 'right', paddingTop: 9 }}>{t( 'strings.forgot-password' )}</Link>
            
            <Container disableGutters>
              <Button type="submit" className={classes.logInButton} variant="contained" color="primary" disableElevation fullWidth>
                {t( 'strings.log-in' )}
              </Button>
            </Container>

          </form>
        </Box>

        <Divider text="Or" />

        <GoogleButton url="/api/auth/google/login" text={t( 'strings.google-log-in' )} />
      
      </Container>

      <Box mt="2rem" display="flex" justifyContent="center">
        <Typography>
          <Trans i18nKey="elements.login.signup-prompt">
            0
            <Link to="/signup">0</Link>
          </Trans>
        </Typography>
      </Box>
      
    </Container>

  </> );
} );
 
