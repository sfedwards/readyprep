import { Box, CircularProgress, Container, Button as MuiButton, Paper, Typography, makeStyles } from '@material-ui/core';
import { CheckCircleOutline, Visibility, VisibilityOff } from '@material-ui/icons';
import { Elements, useStripe } from '@stripe/react-stripe-js';
import { Formik, FormikHelpers } from 'formik';
import { useSnackbar } from 'notistack';
import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { ConnectCloverButton } from 'src/components/UI/PosButtons/CloverButton/ConnectCloverButton';
import useSWR from 'swr';

import { useTemporarilyTrueState } from '../../../hooks/useTemporarilyTrueState';
import { useLocationsApi } from '../../../services/api/hooks/useLocationsApi.api.hook';
import request from '../../../util/request';
import { BillingDialog } from '../../UI/BillingDialog';
import { Button } from '../../UI/Button';
import { ChangePlanDialog } from '../../UI/ChangePlanDialog';
import { DeleteDialog } from '../../UI/DeleteDialog';
import { CloverIcon, SquareIcon } from '../../UI/Icons';
import { SquareConnectionButton } from '../../UI/PosButtons/SquareButton';
import { TextInput, TextInputF } from '../../UI/TextInput';
import { useAddressFieldStyles } from './SetupRestaurantDetailsPage/styles';

export const CONNECT_SQUARE_URL = `https://squareup.com/oauth2/authorize?client_id=${process.env.REACT_APP_SQUARE_CLIENT_ID}&scope=ITEMS_READ+ORDERS_READ+MERCHANT_PROFILE_READ+PAYMENTS_READ`;

class SettingsData {
  firstName = '';
  lastName = '';

  email = '';

  currentPassword = '';
  password = '';

  restaurantName = '';
  restaurantAddress = '';
  restaurantPhone = '';

  constructor ( name: string, restaurantDetails?: { name: string; address: string; phoneNumber: string; } ) {
    const names = name?.split( /\s+/g ) ?? [ '' ];
    this.firstName = names.length === 1 ? names[0] : names.slice( 0, -1 ).join( ' ' );
    this.lastName = names.length === 1 ? '' : names.slice( -1 )?.[0];

    if ( restaurantDetails ) {
      this.restaurantName = restaurantDetails.name;
      this.restaurantAddress = restaurantDetails.address;
      this.restaurantPhone = restaurantDetails.phoneNumber;
    }
  }
}

export const SettingsPage = ( ): ReactElement => {
  const stripe = useMemo( async () => {
    const { loadStripe } = await import( '@stripe/stripe-js' );
    return loadStripe( process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '' );
  }, [ ] );

  return (
    <Elements { ...{ stripe } }>
      <SettingsPageContent />
    </Elements>
  );
};

const useStyles = makeStyles( theme => ( {
  save: {
    paddingTop: 4,
    paddingBottom: 4,
  },
  deleteButton: {
    backgroundColor: theme.palette.error.main,
    '&:hover': {
      backgroundColor: theme.palette.error.dark,
    },
  },
} ) );

const SettingsPageContent = ( ): ReactElement => {
  const { t } = useTranslation();

  const [ saving, setSaving ] = useTemporarilyTrueState( false );

  const rProfile = useSWR( '/profile' );
  const rPlans = useSWR( '/billing/plans' );
  const rIntegrations = useSWR( '/pos' );

  const rRestaurantDetails = useSWR( rProfile.data?.location.id ? `/locations/${rProfile.data?.location.id}`: null );

  const loading = rProfile.isValidating || rPlans.isValidating;

  const [ showPasswords, setShowPasswords ] = useState( false );

  const [ showingDeleteDialog, setShowingDeleteDialog ] = useState( false );
  const [ showingPlansDialog, setShowingPlansDialog ] = useState( false );
  const [ showingBillingDialog, setShowingBillingDialog ] = useState( false );

  const classes = useStyles();
  
  const query = useLocation().search;

  const stripe = useStripe();

  const { enqueueSnackbar } = useSnackbar();

  const handleSelectNewPlan = async ( planName: string, planId: string, promoCode = '' ): Promise<void> => {
    if ( ! planId || ! stripe )
      return;

    setShowingPlansDialog( false );

    const body = {
      plan: planId,
      promoCode,
    };

    try {
      const subscribeResult = await request.post( '/billing/subscribe', { body } );

      if ( subscribeResult.next_action ) {
        if ( subscribeResult.next_action?.type === 'redirect_to_url' )
          window.location.href = subscribeResult.next_action?.redirect_to_url;

        const confirmResult = await stripe.confirmCardSetup( subscribeResult.client_secret );

        if ( confirmResult.error ) {
          enqueueSnackbar( confirmResult.error?.message || 'Error processing payment method', { variant: 'error' } );
          return;
        }
      }
    } catch ( err: any ) {
      enqueueSnackbar( err.message, { variant: 'success' } );
    }

    enqueueSnackbar( 'Successfully changed plan to ' + planName, { variant: 'success' } );
    rPlans.mutate();
  };

  useEffect( () => {
    if ( query === '?emailChanged' )
      enqueueSnackbar( t( 'strings.email-successfully-changed' ), { variant: 'success' } );
  }, [ query, enqueueSnackbar, t ] );

  const locationsApi = useLocationsApi();

  const handleSave = async ( values: SettingsData, formik: FormikHelpers<SettingsData> ): Promise<void> => {
    setSaving( true );

    const body: any = {
      name: ( `${values.firstName} ${values.lastName}` ).trim(),
      email: values.email || undefined,
      currentPassword: values.currentPassword || undefined,
      password: values.password || undefined,
    };

    try {
      const { status, body: res } = await request.patch( '/profile', { body, noThrow: true } );

      if ( status === 401 )
        throw new Error( 'Incorrect password' );

      if ( status !== 200 )
        throw new Error( res.message );

      if ( values.email )
        enqueueSnackbar( 'Email change requires confirmation', { variant: 'success' } );
      else
        enqueueSnackbar( t( 'strings.successfully-saved-changes' ), { variant: 'success' } );
      

      rProfile.mutate();
      formik.setFieldValue( 'email', '' );
      formik.setFieldValue( 'currentPassword', '' );
      formik.setFieldValue( 'password', '' );
      
    } catch ( err: any ) {
      enqueueSnackbar( `Problem saving: ${err.message || ''}`, { variant: 'error' } );
    }

    await locationsApi.updateLocationDetails(
      rProfile.data?.location.id,
      {
        name: values.restaurantName,
        address: values.restaurantAddress,
        phoneNumber: values.restaurantPhone,
      },
    );

    setSaving( false );
    rProfile.mutate();
  };

  const handleConfirmDelete = async ( ): Promise<void> => {
    const body = { confirmation: 'delete' };
    await request.delete( '/profile', { body } );
    window.location.href = '/';
  };

  const handleDisconnect = async ( pos: string ): Promise<void> => {
    await request.delete( `/${pos}` );
    const posName = pos[0].toUpperCase() + pos.slice( 1 );
    enqueueSnackbar( `Disconnected from ${posName}`, { variant: 'success' } );
    rIntegrations.mutate();
  };

  const addressFieldStyles = useAddressFieldStyles();

  return (
    <>
      <Formik initialValues={ new SettingsData( rProfile.data?.name, rRestaurantDetails.data ) } enableReinitialize={ true } onSubmit={ handleSave }>
        {
          ( { values, touched, submitForm } ) => {
            return (
              <Container maxWidth="lg" disableGutters>
                <Box p={2}>
                  <Box py="1.25rem" display="flex" flexWrap="wrap" alignItems="center">
                    { /* Enough height for loading spinner + vertical padding */ }
                    <Box minHeight={56} flex={1} p={1} display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h3" noWrap>{ t( 'strings.settings' ) }</Typography>
                      { loading && <CircularProgress /> }
                      { ( [ 'firstName', 'lastName', 'email', 'password', 'restaurantName', 'restaurantAddress', 'restaurantPhone' ] as ( keyof SettingsData )[] ).some( x => touched[x] ) &&
                        <Button
                          tabIndex={1}
                          style={{ marginLeft: 'auto' }}
                          startIcon={saving ? <CircularProgress size="1em" style={{ color: '#fff' }} /> : <CheckCircleOutline />}
                          text={ saving ? `${t( 'strings.saving' )} ...` : t( 'strings.save' ) }
                          onClick= { submitForm }
                        />
                      }
                    </Box>
                  </Box>

                  <Box mb={2}>
                    <Paper elevation={0}>
                      <Box px={3} pt={2} pb={2}>
                        <Box minHeight={40} display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="h5">{ t( 'strings.name' ) }</Typography>
                        </Box>
                        <Box display="flex">
                          <Box flex={1} mr={3}>
                            <TextInputF name="firstName" label={t( 'strings.first-name' )} />
                          </Box>
                          <Box flex={1}>
                            <TextInputF name="lastName" label={t( 'strings.last-name' )} />
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                  </Box>

                  <Box mb={2}>
                    <Paper elevation={0}>
                      <Box px={1} pt={2} pb={2}>
                        <Box minHeight={40} display="flex" justifyContent="space-between" alignItems="center" px={2}>
                          <Typography variant="h5">{ t( 'strings.email' ) }</Typography>
                        </Box>
                        <Box display="flex" flexWrap="wrap">
                          <Box flex={'1 0 300px'} mx={1.5}>
                            <TextInput value={rProfile.data?.email} disabled={true} label={t( 'strings.current-email' )} />
                          </Box>
                          { rProfile.data?.hasPassword &&
                            <Box flex={'1 0 300px'} mx={1.5}>
                              <TextInputF name="email" label={t( 'strings.new-email' )} />
                            </Box>
                          }
                        </Box>
                      </Box>
                    </Paper>
                  </Box>

                  <Box mb={2}>
                    <Paper elevation={0}>
                      <Box px={1} pt={2} pb={2}>
                        <Box minHeight={40} display="flex" justifyContent="space-between" alignItems="center" px={2}>
                          <Typography variant="h5">Restaurant Details</Typography>
                        </Box>
                        <Box px={2} display="flex" flexWrap="wrap">
                          <Box flex="1 1 250px" minWidth={200}>
                            <Box mr={2}><TextInputF name="restaurantName" label="Name" /></Box>
                            <Box mr={2}><TextInputF multiline name="restaurantAddress" label="Address" className={addressFieldStyles.root} /></Box>
                          </Box>
                          <Box marginRight="auto">
                            <Box flex={1} minWidth={200}>
                              <TextInputF name="restaurantPhone" label="Phone" />
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                  </Box>

                  { rProfile.data?.hasPassword &&
                    <Box mb={2}>
                      <Paper elevation={0}>
                        <Box minHeight={40} px={3} pt={2} pb={2}>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box display="flex" alignItems="center">
                              <Typography variant="h5">{ t( 'strings.password' ) }</Typography>
                              <Box px={2} display="flex" alignItems="center" style={{ cursor: 'pointer' }} onClick={ () => setShowPasswords( ! showPasswords ) }>
                                { showPasswords ? <Visibility /> : <VisibilityOff /> }
                              </Box>
                            </Box>
                          </Box>
                          <Box display="flex">
                            <Box flex={1} mr={3}>
                              <TextInputF name="currentPassword" type={ showPasswords ? 'text' : 'password' } error={ !!( values.password || values.email ) && ! values.currentPassword } required={ !!( values.password || values.email ) } label={t( 'strings.current-password' )} />
                            </Box>
                            <Box flex={1}>
                              <TextInputF name="password" type={ showPasswords ? 'text' : 'password' } required={false} label={t( 'strings.new-password' )} />
                            </Box>
                          </Box>
                        </Box>
                      </Paper>
                    </Box>
                  }

                  <Box mb={2}>
                    <Paper elevation={0}>
                      <Box p={3} display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box flex={1} display="flex" flexDirection="column" justifyContent="flex-start">
                          <Typography variant="h5">{ t( 'strings.connect-POS' ) }</Typography>
                          <Typography variant="body2">Connect your POS to automatically calculate prep requirements and inventory</Typography>
                        </Box>
                        <Box flex={'0 1'} display="flex" flexDirection="column">
                          {
                            rIntegrations.data
                              ? rIntegrations.data.square
                                ?
                                <>
                                  <Button style={{ flex: 1, background: '#000', cursor: 'default' }}>
                                    <Box display="flex" alignItems="center">
                                      <Box display="inline" fontSize="1.6em" lineHeight={0} my={1} mr={1.5}><SquareIcon /></Box>
                                      <Box display="inline">
                                        {'Connected'}
                                      </Box>
                                    </Box>
                                  </Button>
                                  <MuiButton variant="text" color="primary" onClick={ () => handleDisconnect( 'square' ) } style={{ flex: 1, padding: 0 }}>Disconnect</MuiButton>
                                </>
                                : <SquareConnectionButton />
                              : ''
                          }
                          <Box mt={2}>
                            <ConnectCloverButton />
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                  </Box>

                  {/* <Box mb={2}>
                    <Paper elevation={0}>
                      <Box p={3}>
                        <Typography variant="h5">{ t('strings.newsletter-subscription') }</Typography>
                      </Box>
                    </Paper>
                    </Box>*/}

                  <Box mb={2}>
                    <Paper elevation={0}>
                      <Box p={3} display="flex" justifyContent="space-between" alignItems="center">
                        <Box flex={1} display="flex" flexDirection="column">
                          <Typography variant="h5">{ t( 'strings.current-plan' ) }</Typography>
                          {
                            ! rPlans.data?.currentPlan || rPlans.data?.currentPlan === 'NONE'
                              ? <Typography variant="body2">You do not have an active plan</Typography>
                              : <Typography variant="body2">{ t( 'elements.settings.current-plan-info', { plan: rPlans.data?.currentPlan.toLowerCase().replace( /_.*$/, '' ) } ) } </Typography>
                          }
                        </Box>
                        <Box flex={'0 1'}>
                          <Button text={'Change\u00a0Plan' } onClick={ () => setShowingPlansDialog( true ) } />
                        </Box>
                      </Box>
                    </Paper>
                  </Box>

                  <Box mb={2}>
                    <Paper elevation={0}>
                      <Box p={3} display="flex" justifyContent="space-between" alignItems="center">
                        <Box flex={1} display="flex" flexDirection="column">
                          <Typography variant="h5">{ t( 'strings.billing-info' ) }</Typography>
                          <Typography variant="body2">
                            { t( 'elements.settings.update-billing-info' ) }
                            <a href={ rPlans.data?.portalUrl || '#' }> or view your transaction history</a>
                          </Typography>
                        </Box>
                        <Box flex={'0 1'}>
                          <Button text={'Update\u00a0Billing\u00a0Information' } onClick={ () => setShowingBillingDialog( true ) } />
                        </Box>
                      </Box>
                    </Paper>
                  </Box>

                  <Box mb={2}>
                    <Paper elevation={0}>
                      <Box p={3} display="flex" justifyContent="space-between" alignItems="center">
                        <Box flex={1} display="flex" flexDirection="column">
                          <Typography variant="h5" color="error">{ t( 'strings.delete-account' ) }</Typography>
                          <Typography variant="body2">{ t( 'elements.settings.deleting-account' ) } </Typography>
                        </Box>
                        <Box flex={'0 1'}>
                          <Button className={classes.deleteButton} text={'Delete\u00a0My\u00a0Account' } onClick={ () => setShowingDeleteDialog( true ) } />
                        </Box>
                      </Box>
                    </Paper>
                  </Box>
                </Box>
              </Container>
            );
          }
        }
      </Formik>
      <DeleteDialog
        itemName="Account"
        message={ t( 'elements.settings.deleting-account' ) }
        requireConfirmation={true}
        showing={ showingDeleteDialog }
        onClose={ () => setShowingDeleteDialog( false ) }
        onConfirm={ handleConfirmDelete }
      />
      <BillingDialog showing={ showingBillingDialog } email={rProfile.data?.currentEmail} portalUrl={rPlans.data?.portalUrl} onClose={() => setShowingBillingDialog( false ) } onError={ message => enqueueSnackbar( message || 'Error Updating Billing Details', { variant: 'error' } ) } onConfirm={ () => {
        setShowingBillingDialog( false ); enqueueSnackbar( 'Successfully updated billing details', { variant: 'success' } );
      } } />
      <ChangePlanDialog
        showing={ showingPlansDialog }
        currentPlan={rPlans.data?.currentPlan}
        allPlans={rPlans.data?.plans}
        hasPaymentMethod={rPlans.data?.hasPaymentMethod}
        portalUrl={rPlans.data?.portalUrl}
        onClose={() => setShowingPlansDialog( false ) }
        onError={ message => enqueueSnackbar( message || 'Error Changing Plan', { variant: 'error' } ) }
        onConfirm={ handleSelectNewPlan }
      />
    </>
  );
};
