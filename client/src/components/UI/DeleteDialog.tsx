import { Box, Button, Dialog, DialogContent, DialogContentText, Typography, makeStyles } from '@material-ui/core';
import { CheckCircleOutline, Clear } from '@material-ui/icons';
import { Alert, AlertTitle } from '@material-ui/lab';
import React, { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TextInput } from './TextInput';

interface DeleteDialogProps {
  onConfirm: ( ) => void;
  onClose: ( ) => void;
  showing: boolean;
  itemName: string;
  message?: string;
  requireConfirmation?: boolean;
  usage?: {
    recipes: { id: number, type: string, name: string }[],
    ingredients: { id: number, type: string, name: string }[],
  } | null;
}

const useStyles = makeStyles( theme => ( {
  root: {
  },
  title: {
    flex: 1,
    display: 'flex',
    alignItems: 'flex-end',
    color: '#D02E44',
    fontWeight: 400,
    fontSize: '2rem',
    paddingBottom: 16,
    [theme.breakpoints.down( 'sm' )]: {
      fontSize: '1.5rem',
    },
  },
  content: {
    textAlign: 'center',
    padding: 0,
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
    background: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  confirmButton: ( props: { disabled: boolean } ) => ( {
    background: props.disabled ? theme.palette.disabled.main : theme.palette.error.main,
    '&:hover': {
      backgroundColor: theme.palette.error.dark,
    },
  } ),
} ) );

export const DeleteDialog = ( props: DeleteDialogProps ): ReactElement => {
  const { t } = useTranslation();
  const [ confirmation, setConfirmation ] = useState( '' );
  const { usage } = props;

  const disabled = !!( props.usage === null || ( props.requireConfirmation && confirmation.toLowerCase() !== 'delete' ) );
  const classes = useStyles( { disabled } );

  return (
    <Dialog
      open={props.showing}
      onClose={props.onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      className={classes.root}
      fullWidth
      maxWidth="sm"
    >
      <Box display="flex" flexDirection="column" alignItems="center" p={3}>
        <div className={classes.title} id="alert-dialog-title">
          {`${t( 'strings.delete' )} ${props.itemName}`}
        </div>
        <DialogContent className={classes.content}>
          <DialogContentText id="alert-dialog-description">
            <Typography variant="body2">{props.message ?? t( 'strings.prompt-delete', { name: props.itemName } )}</Typography>
            { ( usage?.recipes?.length || usage?.ingredients?.length ) &&
              <Alert severity="error" style={{ display: 'block' }}>
                <AlertTitle style={{ color: '#D02E44', textAlign: 'left', marginTop: '-2.2em', paddingLeft: 32 }}>{ props.itemName } is in use</AlertTitle>
                { usage?.ingredients?.length &&
                  <Box textAlign="left">
                    <span style={{ paddingRight: 8 }}>Used by ingredients:</span>
                    <a href={`/${usage.ingredients[0].type}/${usage.ingredients[0].id}`} target="_blank" rel="noreferrer">{ usage.ingredients[0].name }</a>
                    { usage.ingredients.slice( 1 ).flatMap( ( { type, id, name } ) => <>, <a href={`/${type}/${id}`} target="_blank" rel="noreferrer">{ name }</a></> ) }
                  </Box>
                }
                { usage?.recipes?.length &&
                  <Box textAlign="left">
                    <span style={{ paddingRight: 8 }}>Used by recipes:</span>
                    <a href={`/${usage.recipes[0].type}/${usage.recipes[0].id}`} target="_blank" rel="noreferrer">{ usage.recipes[0].name }</a>
                    { usage.recipes.slice( 1 ).flatMap( ( { type, id, name } ) => <>, <a href={`/${type}/${id}`} target="_blank" rel="noreferrer">{ name }</a></> ) }
                  </Box>
                }
              </Alert>
            }
          </DialogContentText>
          { props.requireConfirmation &&
            <>
              <p>Type "delete" in the input box to proceed with { props.itemName } deletion</p>
              <TextInput size="small" value={confirmation} onChange={ ( e: any ) => setConfirmation( e.target.value ) } />
            </>
          }
        </DialogContent>
      </Box>
      <div className={classes.buttons}>
        <Button onClick={props.onClose} className={classes.cancelButton} autoFocus>
          <Clear />{t( 'strings.cancel-delete' )}
        </Button>
        <Button disabled={ disabled } onClick={props.onConfirm} className={classes.confirmButton}>
          <CheckCircleOutline />{t( 'strings.confirm-delete' )}
        </Button>
      </div>
    </Dialog>
  );
};
