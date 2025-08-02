import { Box, Collapse, Dialog, DialogContent, Button as MuiButton, makeStyles, Typography } from '@material-ui/core';
import { Check, CheckCircleOutline } from '@material-ui/icons';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { ReactElement, useState } from 'react';

import { Plan, Plans } from '../../enum/plans.enum';
import { setupIntent } from '../../util/setupIntent';
import { TextInput } from './TextInput';

interface ChangePlanDialogProps {
  onConfirm: ( planName: string, planId: string, promoCode: string ) => void;
  onError?: ( message?: string ) => void;
  onClose: ( ) => void;
  showing: boolean;
  currentPlan?: string;
  allPlans?: any;
  portalUrl?: string;
  hasPaymentMethod?: boolean;
  message?: string | false;
  disableBackdropClick?: boolean;
}

const useStyles = makeStyles( theme => ( {
  root: {
    overflow: 'hidden',
  },
  title: {
    flex: 1,
    display: 'flex',
    alignItems: 'flex-end',
    color: theme.palette.primary.main,
    fontWeight: 400,
    fontSize: '2rem',
    paddingBottom: 16,
    [theme.breakpoints.down( 'sm' )]: {
      fontSize: '1.5rem',
    },
  },
  content: {
    padding: '0 22px',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  buttons: {
    width: '100%',
    padding: 0,
    display: 'flex',
    '& button': {
      flex: 1,
      borderRadius: 0,
      border: 0,
      color: '#fff',
      padding: 16,
      '& .MuiSvgIcon-root': {
        marginRight: 8,
      },
    },
  },
  cancelButton: {
    background: theme.palette.secondaryGray.main,
    '&:hover': {
      backgroundColor: theme.palette.primaryGray.main,
    },
  },
  confirmButton: ( props: { selectedPlan: string } ) => ( {
    background: props.selectedPlan ? theme.palette.primary.main : theme.palette.disabled.main,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  } ),
  cardInput: {
    position: 'relative',
    minHeight: 68,
  },
} ) );

export const ChangePlanDialog = ( props: ChangePlanDialogProps ): ReactElement => {
  const stripe = useStripe()!;
  const elements = useElements()!;

  const [ billingName, setBillingName ] = useState( '' );
  const [ promoCode, setPromoCode ] = useState( '' );
  const [ selectedPlan, setSelectedPlan ] = useState( 'PREMIUM' );
  const [ yearly, setYearly ] = useState( false );
  const classes = useStyles( { selectedPlan } );

  const planNames = [ ...new Set( Object.keys( props.allPlans || [] ).map( key => key.replace( /_[^_]*$/, '' ) ) ) ] as Plan[];
  planNames.sort( ( a: Plan, b:Plan ) => Plans[a] - Plans[b] );
  
  const handleSubmit = async ( event: any ): Promise<void> => {
    event.preventDefault();
    const plan = props.allPlans?.[ selectedPlan + ( yearly ? '_YEARLY' : '_MONTHLY' ) ] || props.allPlans?.[ selectedPlan ];

    // Ignore double submission
    if ( ! plan )
      return;

    if ( selectedPlan !== 'FREE' && props.hasPaymentMethod === false ) {
      await setupIntent( stripe, elements, billingName, {
        onConfirm: () => props.onConfirm( selectedPlan, plan.id, promoCode ),
        onError: props.onError,
      } );
    }
      
    props.onConfirm( selectedPlan, plan.id, promoCode );
  };

  if ( ! props.allPlans )
    return <></>;
    
  return (
    <Dialog
      open={props.showing}
      onClose={props.onClose}
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
      className={classes.root}
      fullWidth
      maxWidth="md"
      scroll="body"
      disableBackdropClick={props.disableBackdropClick}
    >
      <Box display="flex" flexDirection="column" alignItems="center" pt={2} pb={1}>
        <div className={classes.title} id="dialog-title">
          Please Subscribe
        </div>
        <DialogContent className={classes.content}>
          <Box mx="auto">
            <Box mb="4px" display="flex" alignItems="stretch" pt={1}>
              <Typography
                variant="h2"
                style={{
                  marginRight: 48,
                  alignSelf: 'center',
                  color: '#4D474D',
                }}
              >
                ReadyPrep Premium
              </Typography>
              <Typography color="primary" style={{ alignSelf: 'flex-start' }}>$</Typography>
              <Typography variant="h4" color="primary">{ ( props.allPlans[ 'PREMIUM_MONTHLY' ].amount/100 ).toFixed( 2 ).replace( /\.00$/, '' ) }</Typography>
              <Typography color="primary" style={{ alignSelf: 'flex-end' }}>
                /mo
              </Typography>
            </Box>
            <Box>
              <Box mb="8px" display="flex" alignItems="center">
                <Check color="primary" style={{ fontSize: '22px', lineHeight: 0 }} />
                <Typography style={{ marginLeft: 6, fontSize: '1em' }}>
                  Full access to our sophisticated Recipe Management and Food Costing module
                </Typography>
              </Box>
              <Box mb="8px" display="flex" alignItems="center">
                <Check color="primary" style={{ fontSize: '22px', lineHeight: 0 }} />
                <Typography style={{ marginLeft: 6, fontSize: '1em' }}>
                  Maintain accurate pricing records for each item
                </Typography>
              </Box>
              <Box mb="8px" display="flex" alignItems="center">
                <Check color="primary" style={{ fontSize: '22px', lineHeight: 0 }} />
                <Typography style={{ marginLeft: 6, fontSize: '1em' }}>
                  Develop accurate PAR estimates for all ingredients
                </Typography>
              </Box>
              <Box mb="8px" display="flex" alignItems="center">
                <Check color="primary" style={{ fontSize: '22px', lineHeight: 0 }} />
                <Typography style={{ marginLeft: 6, fontSize: '1em' }}>
                  Connect to Square POS for accurate unit sales
                </Typography>
              </Box>
              <Box mb="8px" display="flex" alignItems="center">
                <Check color="primary" style={{ fontSize: '22px', lineHeight: 0 }} />
                <Typography style={{ marginLeft: 6, fontSize: '1em' }}>
                  Daily Prep List based on actual usage
                </Typography>
              </Box>
              <Box mb="8px" display="flex" alignItems="center">
                <Check color="primary" style={{ fontSize: '22px', lineHeight: 0 }} />
                <Typography style={{ marginLeft: 6, fontSize: '1em' }}>
                  Scaled recipes based on prep requirements
                </Typography>
              </Box>
              <Box mb="8px" display="flex" alignItems="center">
                <Check color="primary" style={{ fontSize: '22px', lineHeight: 0 }} />
                <Typography style={{ marginLeft: 6, fontSize: '1em' }}>
                  Create and send orders directly to vendors
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box pt={1}>
            <TextInput required label="Name on Card" value={billingName} onChange={ ( e: any ) => setBillingName( e.target.value ) } />
            <div className={ classes.cardInput }>
              <TextInput required label="Card Details" value={'\u00a0'} InputProps={{ inputProps: { disabled: true } }} tabIndex={-1} style={{ position: 'absolute', top: 0, left: 0, outline: 'none' }} />
              <div style={{ position: 'absolute', top: 36, left: 16, right: 16, bottom: 0, background: 'none', border: 'none' }}>
                <CardElement />
              </div>
            </div>
          </Box>
          <Collapse in={ !! selectedPlan && selectedPlan !== 'FREE' }>
            <TextInput label="Promo Code" value={promoCode} onChange={ ( e: any ) => setPromoCode( e.target.value ) } />
          </Collapse>
        </DialogContent>
      </Box>
      <div className={classes.buttons}>
        <MuiButton onClick={ handleSubmit } disabled={ ! selectedPlan } className={classes.confirmButton}>
          <CheckCircleOutline />Submit
        </MuiButton>
      </div>
    </Dialog>
  );
};
