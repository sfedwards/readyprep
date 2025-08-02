import { Box, Button, Dialog, makeStyles, useTheme } from '@material-ui/core';
import { CheckCircleOutline, Clear } from '@material-ui/icons';
import React, { ReactElement, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TextInput } from './TextInput';

interface SectionNameDialogProps {
  onConfirm: ( name: string ) => void;
  onClose: ( ) => void;
  showing: boolean;
  name: string;
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
  confirmButton: {
    background: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
} ) );

export const SectionNameDialog = ( props: SectionNameDialogProps ): ReactElement => {
  const theme = useTheme();
  const classes = useStyles( theme );
  const { t } = useTranslation();
  const [ name, setName ] = useState( '' );
  const [ existing, setExisting ] = useState( true );

  useEffect( () => {
    if ( ! props.showing )
      return;
    setName( props.name || '' );
    setExisting( props.name != null );
  }, [ props.showing ] );

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
      <Box display="flex" flexDirection="column" alignItems="center" p={3}>
        <div className={classes.title} id="dialog-title">
          {`${existing ? t( 'strings.rename' ) : t( 'strings.create' )} ${t( 'strings.section' )}`}
        </div>
        <Box flex={1} display="flex" alignSelf="stretch">
          <TextInput label={t( 'strings.name' )} value={ name } onChange={ ( e: any ) => setName( e.target.value ) }></TextInput>
        </Box>
      </Box>
      <div className={classes.buttons}>
        <Button onClick={props.onClose} className={classes.cancelButton} autoFocus>
          <Clear />{t( 'strings.cancel' )}
        </Button>
        <Button onClick={ () => props.onConfirm( name ) } className={classes.confirmButton}>
          <CheckCircleOutline />{t( 'strings.confirm' )}
        </Button>
      </div>
    </Dialog>
  );
};
