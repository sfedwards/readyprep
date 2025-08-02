import { Box, Button, CircularProgress, Container, Typography, withStyles } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useHistory, useParams } from 'react-router-dom';

import request from '../../../util/request';
import { PasswordInput } from '../../UI/PasswordInput';
import { TextInput } from '../../UI/TextInput';
import { Title } from '../Title';

interface Props {
  classes: {
    logInButton: string;
    dialog: string;
  } ;
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

export const PasswordResetPage = withStyles( styles )( ( props: Props ) => {
  const { t } = useTranslation();
  const [ email, setEmail ] = useState( '' );
  const [ errorMessage, setErrorMessage ] = useState( '' );
  const [ loading, setLoading ] = useState( false );
  const [ requestedToken, setRequestedToken ] = useState( false );

  const [ token, setToken ] = useState<string>( );
  const [ password, setPassword ] = useState( '' );

  const history = useHistory();
  const params = useParams<{ token?: string }>();

  useEffect( () => {
    if ( ! params.token )
      return;
    setToken( params.token );
    history.replace( '/password/reset' );
  }, [ params.token ] );

  const { classes } = props;

  const handleRequestToken = async ( e: React.FormEvent<HTMLFormElement> ): Promise<void> => {
    e.preventDefault();
    setLoading( true );

    try {
      const { status, body } = await request.post( '/auth/password-reset', {
        body: {
          email,
        },
      } );
      
      if ( status !== 201 )
        throw new Error( body.message || t( 'strings.unknown-error' ) );
      

      setErrorMessage( '' );
      setRequestedToken( true );
    } catch ( e: any ) {
      setErrorMessage( e.message );
    }

    setLoading( false );
  };

  const handleSubmitNewPassword = async ( e: React.FormEvent<HTMLFormElement> ): Promise<void> => {
    e.preventDefault();
    setLoading( true );

    try {
      const { status, body } = await request.post( '/auth/password-reset/confirm', {
        body: {
          token,
          password,
        },
        noAuth: true,
        noThrow: true,
      } );

      if ( status === 403 )
        setToken( undefined );
      

      if ( status !== 201 )
        throw new Error( body.message || t( 'strings.unknown-error' ) );
      

      window.location.href = '/login?reset';
    } catch ( err: any ) {
      setErrorMessage( err.message );
    }
  
    setLoading( false );
  };

  return (
    <Container maxWidth="sm" disableGutters>
      <Container className={classes.dialog}>
        <Box py="3rem" textAlign="center">
          <Link to="/login"><Title variant="h2" color="primary" /></Link>
        </Box>

        <Box px="1rem" pb="2rem">
          
          { errorMessage &&
            <Alert severity="error">
              {errorMessage}
            </Alert>
          }

          { requestedToken
            ?
            <Alert>
              { t( 'elements.password-reset.email-sent', { email } ) }
            </Alert>
            :
            <>
              <Box display="flex" minHeight={56} alignItems="center">
                <Typography variant="h1" style={{ paddingRight: 32 }}>
                  {
                    token ? t( 'strings.enter-a-new-password' ) : t( 'strings.reset-password' )
                  }
                </Typography>

                { loading && <CircularProgress /> }
              </Box>
              <form onSubmit={token ? handleSubmitNewPassword : handleRequestToken}>
                  
                {
                  token
                    ? <PasswordInput value={password} onChange={ ( e: any ) => setPassword( e.target.value ) } />
                    : <TextInput
                      type="email"
                      label={t( 'strings.email' )}
                      value={email}
                      onChange={ ( e: any ) => setEmail( e.target.value ) }
                      autoFocus
                      required
                      fullWidth
                    />
                }
                  
                <Container disableGutters>
                  <Button type="submit" className={classes.logInButton} variant="contained" color="primary" disableElevation fullWidth>
                    { token ? t( 'strings.set-password' ) : t( 'strings.request-password-reset-link' ) }
                  </Button>
                </Container>

              </form>
            </>
          }
        </Box>
      
      </Container>

      <Box mt="1rem" display="flex" justifyContent="center">
        <Typography>Already know your password? <Link to="/login">{t( 'strings.log-in' )}</Link></Typography>
      </Box>

    </Container>

  );
} );
 
