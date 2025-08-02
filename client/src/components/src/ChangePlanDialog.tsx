import { Elements, useStripe } from '@stripe/react-stripe-js';
import { pickBy } from 'lodash';
import { useSnackbar } from 'notistack';
import React, { ReactElement, useMemo } from 'react';
import useSWR from 'swr';

import { Plan, Plans } from '../../enum/plans.enum';
import request from '../../util/request';
import { ChangePlanDialog } from '../UI/ChangePlanDialog';

interface Props {
  showing: boolean;
  onConfirm: ( message: string ) => void;
  onError?: ( message?: string ) => void;
  onClose: ( ) => void;
  message?: string | false;
  plan?: Plan;
  allowClose?: boolean;
}

export default ( props: Props ): ReactElement => {
  const stripe = useMemo( async () => {
    const { loadStripe } = await import( '@stripe/stripe-js' );
    return loadStripe( process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '' );
  }, [ ] );

  return (
    <Elements { ...{ stripe } }>
      <AppChangePlanDialog {...props} />
    </Elements>
  );
};


function AppChangePlanDialog ( props: Props ): ReactElement|null {
  const { data } = useSWR( '/billing/plans' );

  const stripe = useStripe();
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async ( planName: string, planId: string, promoCode = '' ): Promise<void> => {
    if ( ! planId || ! stripe )
      return;

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
          return props.onError?.( confirmResult.error?.message || 'Error processing payment method' );
        }
      }
    } catch ( err: any ) {
      enqueueSnackbar( err.message, { variant: 'error' } );
      props.onError?.( err.message );
    }

    enqueueSnackbar( 'Successfully changed plan to ' + planName, { variant: 'success' } );
    props.onConfirm?.( 'Successfully changed plan to ' + planName );
  };

  if ( ! data )
    return null;

  return ( <>
    <ChangePlanDialog
      message={ props.message ?? 'A plan upgrade is required' }
      currentPlan={data.currentPlan}
      allPlans={
        pickBy( data.plans, ( _data: any, plan: string ) =>
          Plans[plan.replace( /_.*/, '' ) as Plan] >= Plans[props.plan ?? 'BASIC']
        )}
      hasPaymentMethod={data.hasPaymentMethod}
      portalUrl={data.portalUrl}
      { ...props }
      disableBackdropClick={ !props.allowClose }
      onConfirm={ handleSubmit }
    />
  </> );
}
