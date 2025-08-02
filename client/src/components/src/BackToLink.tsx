import { Box, Typography } from '@material-ui/core';
import { ArrowLeft } from '@material-ui/icons';
import React, { ReactElement, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

export const BackToLink = ( ): ReactElement => {
  const history = useHistory( );
  const [ state, setState ] = useState<any>( );

  useEffect( () => {
    setState( history.location.state ?? {} );
    return history.listen( location => {
      setState( location.state ?? {} );
    } );
  }, [ history ] );

  return (
    <Box pt={1} pl={3} display="flex" alignItems="center">
      <Typography style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => history.go( -1 )}><ArrowLeft /> Back to { state?.previousTitle ?? 'previous page' }</Typography>
    </Box>
  );
};
