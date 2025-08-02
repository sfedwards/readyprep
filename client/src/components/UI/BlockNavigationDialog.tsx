import { Box, Dialog, Typography, makeStyles, useTheme } from '@material-ui/core';
import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';


interface BlockNavigationDialogProps {
  message: string;
  onClickCancel: ( ) => void;
  onClickDiscardChanges: ( ) => void;
  onClickSave: ( ) => void;
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
    fontSize: '1.75rem',
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
  confirmButton: {
    background: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  cancelButton: {
    background: '#D02E44',
    '&:hover': {
      backgroundColor: '#a72536',
    },
  },
} ) );

export const BlockNavigationDialog = ( props: BlockNavigationDialogProps ): ReactElement => {
  const theme = useTheme();
  const classes = useStyles( theme );

  const { t } = useTranslation();

  return (
    <Dialog
      open={true}
      onClose={props.onClickCancel}
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
      className={classes.root}
      fullWidth
      maxWidth="md"
    >
      <Box display="flex" flexDirection="column" alignItems="center" pt={3}>
        <div className={classes.title} id="dialog-title">{ t( 'elements.save-changes-dialog.title' ) }</div>
      </Box>
      <Box px={4} pb={4}>
        <Typography align="center">
          Please save your changes or discard them to continue
        </Typography>
      </Box>
      <Box mx="20px" mb="20px" display="flex">
        <Button onClick={props.onClickCancel}>
          Go back
        </Button>
        <Button
          onClick={props.onClickDiscardChanges}
          style={{
            marginLeft: "auto",
            marginRight: 20,
            background: '#f7f7f7',
            color: '#800',
          }}
        >
          Discard Changes
        </Button>
        <Button onClick={props.onClickSave}>
          Save &amp; Continue
        </Button>
      </Box>
    </Dialog>
  );
};
