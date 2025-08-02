import { CardElement } from '@stripe/react-stripe-js';
import { Stripe, StripeElements } from '@stripe/stripe-js';
import log from 'loglevel';

import request from './request';

export const setupIntent = async (
  stripe: Stripe,
  elements: StripeElements,
  billingName: string,
  props: {
    onError?: ( msg?: string ) => void,
    onConfirm: () => void,
  }
): Promise<void> => {
  if ( ! stripe || ! elements )
    return;

  const result = await stripe.createPaymentMethod( {
    type: 'card',
    billing_details: {
      name: billingName,
    },
    card: elements.getElement( CardElement ) !,
  } );

  if ( ! result )
    return props.onError?.( 'Error processing payment details' );

  const body = {
    paymentMethod: result.paymentMethod?.id,
  };

  try {
    const { body: setupIntent } = await request.post( '/billing/info', { body } );

    if ( setupIntent.status === 'succeeded' ) {
      props.onConfirm();
      return;
    }

    if ( setupIntent.next_action.type === 'redirect_to_url' )
      window.location.href = setupIntent.next_action.redirect_to_url;

    const result = await stripe.confirmCardSetup( setupIntent.client_secret );
    if ( result.error ) {
      props.onError?.( result.error?.message );
      return;
    }

    props.onConfirm();
  } catch ( e ) {
    log.error( e );
  }
};
