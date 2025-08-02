import { Box, Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import useSWR from 'swr';

import { AppContext } from '../../../App';
import { useQueryState } from '../../../hooks/useQueryState';
import { formatDate } from '../../../util/formatDate';
import { PrepLogSettingsDialogContainer } from '../../PrepLogSettingsDialog';
import { Button } from '../../UI/Button';
import { ConnectSquareButton } from '../../UI/PosButtons/SquareButton';

interface PrepLogPageProps {

}

export const PrepLogPage: React.FC<PrepLogPageProps> = ( ) => {
  const rLocations = useSWR<{ id: string, name: string, pos?: string}[]>( '/square/locations' );
  const [ { params: { page } } ] = useQueryState( { page: '1', pageSize: '10' } );
  const { data, error } = useSWR( `/prep-log?page=${page}` );

  const { handlePlanUpgradeRequired } = useContext( AppContext );

  useEffect( () => {
    if ( error?.message === 'PLAN_UPGRADE_REQUIRED' )
      handlePlanUpgradeRequired( error.plan );
       
  }, [ error, handlePlanUpgradeRequired ] );

  const [ isPrepSettingsDialogOpen, setPrepSettingsDialogOpen ] = useState( false );

  if ( rLocations.error ) {
    return (
      <Container maxWidth="sm">
        <Box flex={1} pt={8} display="flex" flexDirection="column" alignItems="center">
          <ConnectSquareButton />
        </Box>
      </Container>
    );
  }

  const res = [];

  res.push(
    <>
      <Box py="1.25rem" display="flex" flexWrap="wrap" alignItems="center">
        <Box minHeight={56} flex={'1 10'} p={1} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h3">Prep Log</Typography>
          { /* <Button onClick={() => setPrepSettingsDialogOpen(true)} text="Settings" /> */ }
        </Box>
      </Box>
      <PrepLogSettingsDialogContainer open={isPrepSettingsDialogOpen} onClose={() => setPrepSettingsDialogOpen( false )}/>
    </>
  );

  if ( ! data || error )
    return <>{ res }</>;

  const entries: PrepLogEntry[] = data;

  res.push( <>
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell style={{ width: '30%' }}>
              <Typography variant="subtitle1">Date</Typography>
            </TableCell>
            <TableCell></TableCell>
            <TableCell>
              <Typography variant="subtitle1">Inventory Value</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          { entries.map( entry => <PrepLogEntryRow { ...entry } /> ) }
        </TableBody>
      </Table>
    </TableContainer>
  </> );

  return <>{ res }</>;
};

export default PrepLogPage;

interface PrepLogEntry {
  date: string;
  value: number;
}

const PrepLogEntryRow: React.FC<PrepLogEntry> = props => {
  const { date, value } = props;
  const history = useHistory();
  
  return (
    <TableRow>
      <TableCell>
        <Typography variant="subtitle1">{ formatDate( date ) }</Typography>
      </TableCell>
      <TableCell>
        <Button text="View / Edit" onClick={ () => history.push( `/prep/log/${date}` ) } />
      </TableCell>
      <TableCell>
        <Typography variant="body2">{ `$${value.toFixed( 2 )}` }</Typography>
      </TableCell>
    </TableRow>
  );
};
