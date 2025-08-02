import { Box, CircularProgress, Dialog, DialogContent, Typography, makeStyles, useTheme } from '@material-ui/core';
import { Clear } from '@material-ui/icons';
import React, { ReactElement } from 'react';

import { Button } from '../Button';
import { useTranslation } from 'react-i18next';

interface SandboxDialogProps {
  onConfirm: ( reset: boolean ) => void;
  onClose: ( ) => void;
  loading: boolean;
  showing: boolean;
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
  confirmDeleteButton: {
    background: theme.palette.error.main,
    '&:hover': {
      backgroundColor: theme.palette.error.dark,
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

export const SandboxDialog = ( props: SandboxDialogProps ): ReactElement => {
  const theme = useTheme();
  const classes = useStyles( theme );
  const { t } = useTranslation();

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
          Leave Sandbox
        </div>
        <DialogContent className={classes.content}>
          <Typography>Are you ready to leave the sandbox and continue to a full account?</Typography>
          <Box display="flex" maxHeight="70vh">
            { props.loading
              ? <Box flex={1} display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress />
              </Box>
              : <Box flex={1} px={2} display="flex" flexWrap="wrap" justifyContent="space-between">
                <Box flex={'0 0 40%'} py={2}>
                  <Button onClick={() => props.onConfirm( true )} className={classes.confirmDeleteButton}>Leave and DELETE</Button>
                </Box>
                <Box flex={'0 0 40%'} py={2}>
                  <Button onClick={() => props.onConfirm( false )}>Leave and keep</Button>
                </Box>
                <Box flex={'0 0 40%'}>
                  <Typography>Delete all ingredients and recipes, and leave the sandbox</Typography>
                </Box>
                <Box flex={'0 0 40%'}>
                  <Typography>Leave the sandbox without deleting any ingredients or recipes</Typography>
                </Box>
              </Box>
            }
          </Box>
        </DialogContent>
      </Box>
      <div className={classes.buttons}>
        <Button onClick={props.onClose} className={classes.cancelButton} autoFocus>
          <Clear />{t( 'strings.cancel' )}
        </Button>
      </div>
    </Dialog>
  );
};
