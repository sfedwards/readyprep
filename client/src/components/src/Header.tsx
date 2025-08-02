import { Box, Container, Tab, TabProps, Tabs, Theme, makeStyles, useMediaQuery, useTheme } from '@material-ui/core';
import React, { ReactElement, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

import { User } from '../../models/User';
import { Button } from '../UI/Button';
import { Logo } from '../UI/Logo';
import { NavBar } from './NavBar';

const useStyles = makeStyles( theme => ( {
  root: {
    background: theme.palette.secondary.main,
    minHeight: 88,
    display: 'flex',
    alignItems: 'center',
  },
  indicator: {
    display: 'none',
  },
} ) );

const useTabStyles = makeStyles( ( theme: Theme ) => ( {
  root: {
    minWidth: 0,
    fontSize: '1.1em',
    padding: '0 1rem',
    margin: '0',
    [theme.breakpoints.down( 'sm' )]: {
      margin: 0,
    },
  },
} ) );

const StyledTab = ( props: TabProps ): ReactElement => {
  const classes = useTabStyles();
  return <Tab classes={classes} {...props} disableRipple />;
};

export const Header = ( { user }: { user?: User } ): ReactElement => {
  const theme = useTheme();
  const largeScreen = useMediaQuery( theme.breakpoints.up( 'md' ) );
  const [ selectedTab, setSelectedTab ] = useState<'product'|'pricing'|'contact'>( 'product' );
  const history = useHistory();

  const classes = useStyles();

  if ( user )
    return <NavBar />;
  
  const handleTabChange = ( e: any, value: 'product'|'pricing'|'contact' ): void => {
    setSelectedTab( value );
    if ( history.location.pathname !== '/' )
      history.push( '/', { previousTitle: document.title } );
    history.push( `#${value}`, { previousTitle: document.title } );

    const scrollTarget = document.getElementById( value );
    if ( scrollTarget )
      window.scrollTo( { top: scrollTarget.offsetTop, behavior: 'smooth' } );

    if ( value === 'contact' )
      window.open( 'mailto:support@readyprep.io' );
  };

  return (
    <Box className={ classes.root }>
      <Container maxWidth="lg" disableGutters>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          px={3}
        >
          <Box flex="flex-shrink">
            <Link to="/"><Logo style={{ height: '4.5rem', maxWidth: '90%' }} /></Link>
          </Box>
          <Box flex="flex-grow">
            <Tabs
              classes={{ indicator: classes.indicator }}
              value={selectedTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              centered
              style={{ ...( largeScreen ? {} : { fontSize: '0.7em', lineHeight: '0.7em' } ) }}
            >
              <StyledTab value="product" label="Product" />
              <StyledTab value="pricing" label="Pricing" />
              <StyledTab value="contact" label="Contact" />
            </Tabs>
          </Box>
          <Box flex="flex-shrink" textAlign="center">
            <Link to="/login" style={{ fontWeight: 700, paddingRight: 24, whiteSpace: 'nowrap' }}>Sign In</Link>
            { largeScreen && <Link to="/signup"><Button text="Get Started" style={{ borderRadius: 20 }} /></Link> }
          </Box>
        </Box>
      </Container>
    </Box>
  );

};
