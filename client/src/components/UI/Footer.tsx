import { Avatar, Box, Container, makeStyles } from '@material-ui/core';
import { Mail, Twitter } from '@material-ui/icons';
import React, { ReactElement } from 'react';

import { Title } from '../src/Title';
import { FacebookIcon, LinkedInIcon } from './Icons';

const useStyles = makeStyles( () => ( {
  root: {
    flex: 1,
    display: 'flex',
    background: '#fff',
  },
  container: {
    flex: 1,
    display: 'flex',
    padding: 0,
  },
} ) );

export const Footer = ( ): ReactElement => {
  const classes = useStyles();

  return (
    <Box className={ `footer ${classes.root}` }>
      <Container maxWidth="lg" className={ classes.container }>
        <Box flex={1} display="flex" justifyContent="space-between" alignItems="center" px={4}>
          <Box flex={1} display="flex" alignItems="center">
            <a href="https://readyprep.io/"><Title variant="h5" /></a>
          </Box>
          <Box flex={1} flexDirection="column" alignItems="center" justifyContent="center">
            <Box flex={1} textAlign="center"><a href="https://readyprep.io/terms-of-service">Terms of Service</a></Box>
            <Box flex={1} textAlign="center"><a href="https://readyprep.io/privacy">Privacy Policy</a></Box>
          </Box>
          <Box flex={1} display="flex" justifyContent="flex-end" alignItems="center" textAlign="right" fontSize={40}>
            <Box flex="shrink"><a href="mailto:support@readyprep.io"><Box display="flex"><Avatar><Mail /></Avatar></Box></a></Box>
            <Box flex="shrink" ml={2}><a href="https://twitter.com/readyprep_io"><Box display="flex"><Avatar><Twitter /></Avatar></Box></a></Box>
            <Box flex="shrink" ml={2}><a href="https://www.facebook.com/readyprep.io"><Box display="flex"><FacebookIcon /></Box></a></Box>
            <Box flex="shrink" ml={2}><a href="https://www.linkedin.com/company/readyprep/"><Box display="flex"><LinkedInIcon /></Box></a></Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
