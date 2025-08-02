import { Box, Button, Container, Typography, withStyles } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import request from '../../../util/request';
import { Divider } from '../../UI/Divider';
import { GoogleButton } from '../../UI/GoogleButton';
import { Logo } from '../../UI/Logo';
import { PasswordInput } from '../../UI/PasswordInput';
import { TextInput } from '../../UI/TextInput';

interface Props {
  classes: {
    dialog: string;
    googleSigninButton: string;
    logInButton: string;
  } ;
}

const styles = {
  dialog: {
    background: '#fff',
  },
  googleSigninButton: {
    padding: '0.5rem 1.5rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'stretch',
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

export const SignUpPage = withStyles( styles )( ( props: Props ) => {
  const { t } = useTranslation();
  const [ name, setName ] = useState( '' );
  const [ email, setEmail ] = useState( '' );
  const [ password, setPassword ] = useState( '' );
  const [ errorMessage, setErrorMessage ] = useState( '' );
  const [ isSubmitting, setIsSubmitting ] = useState( false );


  const { classes } = props;

  const handleSignUpSubmit = async ( e: React.FormEvent<HTMLFormElement> ): Promise<void> => {
    e.preventDefault();

    if ( isSubmitting )
      return;

    setIsSubmitting( true );

    try {
      const { status, body } = await request.post( '/auth/register', {
        body: {
          name,
          email,
          password,
        },
      } );

      if ( status !== 201 )
        throw new Error( body.message || t( 'strings.unknown-error' ) );
      
      
      window.location.href = 'https://www.readyprep.io/signup-confirm';
    } catch ( err: any ) {
      setErrorMessage( err.message );
    }

    setIsSubmitting( false );
  };

  return ( <>
    <Helmet>
      <title>ReadyPrep | Sign Up</title>
    </Helmet>
    <Container maxWidth="sm" disableGutters>
      <Container className={classes.dialog}>
        <Box pt="3rem" textAlign="center">
          <a href="https://readyprep.io/"><Logo style={{ height: '6rem' }} /></a>
        </Box>

        <Box pt="1rem" pb="1.5rem" display="flex" flexDirection="column" alignItems="center">
          <Box><Typography variant="h4">Try ReadyPrep for free</Typography></Box>
          <Box pt="0.4rem"><Typography>Get started in minutes, no credit card required</Typography></Box>
        </Box>

        <Box px="1rem" pb="2rem">
          
          { errorMessage &&
            <Alert severity="error">
              {errorMessage}
            </Alert>
          }

          <form onSubmit={handleSignUpSubmit}>
            <TextInput
              type="text"
              label={t( 'strings.name' )}
              value={name}
              onChange={ e => setName( e.target.value ) }
              autoFocus
              required
              fullWidth
            />
            
            <TextInput
              type="email"
              label={t( 'strings.email' )}
              value={email}
              onChange={ e => setEmail( e.target.value ) }
              required
              fullWidth
            />
            
            <PasswordInput value={password} onChange={ ( e: any ) => setPassword( e.target.value ) } />

            <Container disableGutters>
              <Button type="submit" className={classes.logInButton} variant="contained" color="primary" disableElevation fullWidth>
                {t( 'strings.sign-up' )}
              </Button>
            </Container>

          </form>
        </Box>
      
        <Container>
          <Divider text="Or" />
        </Container>

        <GoogleButton url="/api/auth/google/login" text={t( 'strings.google-sign-up' )} />

      </Container>

      <Box display="flex" justifyContent="center">
        <Typography>
          <Trans i18nKey="elements.signup.tos-agreement">
            0
            <Link to="/privacy-policy">0</Link>
            2
            <Link to="/terms-of-service">0</Link>
          </Trans>
        </Typography>
      </Box>
      
      <Box mt="4rem" display="flex" justifyContent="center">
        <Typography>
          <Trans i18nKey="elements.signup.login-prompt">
            0
            <Link to="/Login">0</Link>
          </Trans>
        </Typography>
      </Box>
      
    </Container>

  </> );
} );
 
