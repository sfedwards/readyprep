import { Box, CircularProgress, Paper, Typography, makeStyles } from '@material-ui/core';
import { Add, CloudUpload, HelpOutline } from '@material-ui/icons';
import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Button } from './Button';
import { BulkUploadIcon, CutleryIcon } from './Icons';
import { UploadButton } from './UploadButton';

const TYPE_NAME = {
  pantry: 'pantry-ingredient',
  prep: 'prep-ingredient',
  items: 'menu-item',
  menus: 'menu',
};

interface Props {
  type: keyof typeof TYPE_NAME;
  onUploadStarted: () => void;
  onUploadFinished: () => void;
  uploading: boolean;
}

const useStyles = makeStyles( {
  card: {
    minWidth: 360,
    maxWidth: 520,
  },
} );

export const GettingStarted = ( props: Props ): ReactElement => {
  const { type } = props;

  const itemName = TYPE_NAME[ type ];

  const { t } = useTranslation( );
  const classes = useStyles( );

  return (
    <Box width="100%" display="flex" flexDirection="column" alignItems="center" pt={4}>
      <Box mx={4} textAlign="center">
        <Typography variant="h3">Getting Started</Typography>
        <Box pt="30px" pb="42px">
          <Link to="/faq"><Button text="Read our FAQ" startIcon={ <HelpOutline /> }/></Link>
        </Box>
        <Typography variant="body2">Create your { t( `strings.${itemName}_plural` ) } manually or import from a spreadsheet</Typography>
      </Box>
      <Box mt={2} maxWidth="100%" display="flex" justifyContent="space-between" flexWrap="wrap">
        <Box flex={1} mx={4} className={ `MuiPaper-root MuiPaper-elevation1 MuiPaper-rounded ${classes.card}` } display="flex" flexDirection="column" alignItems="center" textAlign="center" p={4}>
          <Typography variant="body2" style={{ display: 'flex', fontSize: 140 }}><CutleryIcon /></Typography>
          <Box my={2}>Manually add your { t( `strings.${itemName}_plural` ) }.</Box>
          <Box mt="auto">
            <Link to={`/${type}/new`}><Button startIcon={<Add />} text={ `Create ${t( `strings.${itemName}` )}` } /></Link>
          </Box>
        </Box>
        <Box flex={1} mx={4} className={ `MuiPaper-root MuiPaper-elevation1 MuiPaper-rounded ${classes.card}` } display="flex" flexDirection="column" alignItems="center" textAlign="center" p={4}>
          <Typography variant="body2" style={{ display: 'flex', fontSize: 140 }}><CloudUpload fontSize="inherit" /></Typography>
          <Box my={2}>Automatically import menu items, pantry and prep ingredients from a file.</Box>
          <Box mt="auto">
            {
              props.uploading
                ? <CircularProgress />
                : <UploadButton onUploadStarted={ props.onUploadStarted } onUploadFinished={ props.onUploadFinished } name={ t( `strings.${itemName}_plural` ) } />
            }
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
