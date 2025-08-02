import { Box, Button, makeStyles } from '@material-ui/core';
import React, { ReactElement, useContext, useEffect, useState } from 'react';
import useSWR from 'swr';

import { AppContext } from '../../../../App';
import { CONNECT_SQUARE_URL } from '../../../src/Pages/SettingsPage';
import { SquareIcon } from '../../Icons';

const useStyles = makeStyles( {
  button: {
    width: 240,
    borderRadius: 8,
    background: '#000',
    color: '#fff',
    fontSize: '1.1rem',
    transition: 'background 0.7s',
    '&:hover': {
      background: '#000000b5',
    },
  },
} );

export const ConnectSquareButton = ( ): ReactElement => {
  const rLocations = useSWR( '/square/locations' );

  const [ isPlanUpgradeRequired, setPlanUpgradeRequired ] = useState( false );

  const { handlePlanUpgradeRequired } = useContext( AppContext );

  useEffect( () => {
    const planUpgradeRequired = rLocations.error?.message === 'PLAN_UPGRADE_REQUIRED';
    setPlanUpgradeRequired( planUpgradeRequired );
  }, [ rLocations.error ] );
  
  const classes = useStyles();

  const handleClick = ( e: any ): void => {
    if ( isPlanUpgradeRequired ) {
      handlePlanUpgradeRequired( rLocations.error.plan );
      e.preventDefault();
    }
  };
  
  return (
    <a onClick={handleClick} href={ CONNECT_SQUARE_URL }>
      <Button className={classes.button}>
        <Box display="flex" alignItems="center">
          <Box display="inline" fontSize="1.6em" lineHeight={0} my={0.5} mr={1.5}><SquareIcon /></Box>
          <Box display="inline">
            {'Connect\u00a0Square'}
          </Box>
        </Box>
      </Button>
    </a>
  );
};
