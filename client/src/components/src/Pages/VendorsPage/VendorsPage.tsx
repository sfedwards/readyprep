import { Box, CircularProgress, Link, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@material-ui/core';
import React, { ReactElement, useState } from 'react';

import { Alert } from '@material-ui/lab';
import { Button } from '../../../UI/Button';
import { Helmet } from 'react-helmet';
import { ListVendorsResponse } from '../../../../services/api/vendors/interface/ListVendors.api.interface';
import { SearchInput } from '../../../UI/SearchInput';
import log from 'loglevel';
import stringScore from 'string-score';
import { useHistory } from 'react-router-dom';
import useSWR from 'swr';

export const VendorsPage = ( ): ReactElement => {
  const rVendors = useSWR<ListVendorsResponse>( '/vendors' );
  const [ query, setQuery ] = useState( '' );

  const history = useHistory();

  const handleSearchChange = ( query: string ): void => {
    setQuery( query );
  };

  const handleSearchSubmit = ( ): void => {

  };

  const isLoading = ! rVendors.data && ! rVendors.error;

  return (
    <>
      <Helmet>
        <title>Vendors</title>
      </Helmet>
      <Box p={2} display="flex" flexDirection="column">
        <Box display="flex" flexWrap="wrap" alignItems="flex-end">
          <Box flex={1} minHeight={56} p={1} display="flex" flexDirection="row" justifyContent="space-between" alignItems="center" flexWrap="wrap">
            <Typography variant="h3">Vendors</Typography>
            <Box display="flex" flexDirection="row">
              <SearchInput
                onChange={handleSearchChange}
                onSubmit={handleSearchSubmit}
              />
              <Box display="flex" alignItems="center">
                <Button style={{ marginLeft: 16 }} onClick={() => history.push( '/vendor/new', { previousTitle: document.title } )}>Create</Button>
              </Box>
            </Box>
          </Box>
        </Box>
        <Box>
          { 
            isLoading && 
              <Box width="100%" display="flex" justifyContent="center"><CircularProgress/></Box>
          }
          { 
            rVendors.error &&
              <Alert severity="error">{ rVendors.error }</Alert>
          }
          {
            rVendors.data &&
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ width: '30%' }}>
                      <Typography variant="subtitle1">Vendor</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle1">Contact</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle1">Email</Typography>
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    rVendors.data.vendors.map( vendor => {
                      const score = ! query 
                        ? 1 
                        : Math.max( stringScore( query, vendor.name, 0.5 ), stringScore( vendor.name, query, 0.5 ) )*
                          Math.max( query.length, vendor.name.length )/Math.min( query.length, vendor.name.length )
                      ;
                      log.debug( vendor.name, score, stringScore( query, vendor.name, 0.5 ), stringScore( vendor.name, query, 0.5 ) );
                      return { vendor, score };
                    })
                    .filter( ({ score }) => score > 0.5 )
                    .sort( (a,b) => b.score - a.score )
                    .map( ({ vendor }) => {
                      return (
                        <TableRow key={vendor.id}>
                          <TableCell><Link style={{ cursor: 'pointer' }} onClick={() => history.push( `/vendor/${vendor.id}`, { previousTitle: document.title } )}>{vendor.name}</Link></TableCell>
                          <TableCell>{vendor.primaryContact.name}</TableCell>
                          <TableCell>{vendor.primaryContact.email}</TableCell>
                          <TableCell>
                            <Button onClick={() => { history.push( `/vendor/${vendor.id}/catalog`, { previousTitle: document.title } ) }}>Catalog</Button>
                          </TableCell>
                          <TableCell>
                            <Button onClick={() => { history.push( `/orders/new`, { previousTitle: document.title, vendorId: vendor.id } ) }}>Create&nbsp;Order</Button>
                          </TableCell>
                        </TableRow>
                      )
                    } )
                  }
                </TableBody>
              </Table>
          }
        </Box>
      </Box>
    </>
  );
};
