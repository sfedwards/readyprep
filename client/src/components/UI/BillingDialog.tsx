import { Box, Button, Dialog, DialogContent, Typography, makeStyles, useTheme } from '@material-ui/core';
import { CheckCircleOutline, Clear } from '@material-ui/icons';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import React, { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { setupIntent } from '../../util/setupIntent';
import { TextInput } from './TextInput';

interface BillingDialogProps {
  onConfirm: ( ) => void;
  onError: ( message?: string ) => void;
  onClose: ( ) => void;
  showing: boolean;
  email: string;
  portalUrl?: string;
}

const useStyles = makeStyles( theme => ( {
  root: {
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
    textAlign: 'center',
    padding: '0 24px',
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
  confirmButton: {
    background: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  cardInput: {
    position: 'relative',
    minHeight: 80,
  },
} ) );

export const BillingDialog = ( props: BillingDialogProps ): ReactElement => {
  const theme = useTheme();
  const classes = useStyles( theme );
  const { t } = useTranslation();

  const stripe = useStripe()!;
  const elements = useElements()!;

  const [ billingName, setBillingName ] = useState( '' );

  const handleSubmit = ( event: any ): void => {
    event.preventDefault();
    setupIntent( stripe, elements, billingName, props );
  };

  return (
    <Dialog
      open={props.showing}
      onClose={props.onClose}
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
      className={classes.root}
      fullWidth
      maxWidth="sm"
    >
      <Box display="flex" flexDirection="column" alignItems="center" py={3}>
        <div className={classes.title} id="dialog-title">
          Update Billing Information
        </div>
        <DialogContent className={classes.content}>
          <Typography>Add a new payment method</Typography>
          <form onSubmit={ handleSubmit }>
            <TextInput label="Name on Card" value={billingName} onChange={ ( e: any ) => setBillingName( e.target.value ) } />
            <div className={ classes.cardInput }>
              <TextInput label="Card Details" value={'\u00a0'} InputProps={{ inputProps: { disabled: true } }} tabIndex={-1} style={{ position: 'absolute', top: 0, left: 0, outline: 'none' }} />
              <div style={{ position: 'absolute', top: 36, left: 16, right: 16, bottom: 0, background: 'none', border: 'none' }}>
                <CardElement />
              </div>
            </div>
            { props.portalUrl &&
              <Typography><a href={ props.portalUrl }>or manage existing payment methods</a></Typography>
            }
          </form>
        </DialogContent>
      </Box>
      <div className={classes.buttons}>
        <Button onClick={props.onClose} className={classes.cancelButton} autoFocus>
          <Clear />{t( 'strings.cancel' )}
        </Button>
        <Button onClick={ handleSubmit } className={classes.confirmButton}>
          <CheckCircleOutline />Submit
        </Button>
      </div>
    </Dialog>
  );
};
