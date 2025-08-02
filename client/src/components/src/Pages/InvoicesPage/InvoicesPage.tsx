import { Box, CircularProgress, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@material-ui/core";

import { Alert } from "@material-ui/lab";
import { Button } from "../../../UI";
import { ForwardButton } from "../../ForwardButton";
import { Helmet } from "react-helmet";
import { ListInvoicesResponse } from "../../../../services/api/invoices";
import React, { useEffect, useState } from "react";
import { ReactElement } from "react";
import { useHistory } from "react-router-dom";
import useSWR from "swr";

import { ListOrdersResponse } from '../../../../services/api/vendors/interface/ListOrders.api.interface';
import { Order } from "../../../../services/api/models/order.api.model";
import formatDate from "../../../../util/formatDate";

export const InvoicesPage = ( ): ReactElement|null => {
  const rInvoices = useSWR<ListInvoicesResponse>( '/invoices' );
  const rOrders = useSWR<ListOrdersResponse>( '/orders' );

  const [ pendingOrders, setPendingOrders ] = useState<Order[]>([]);

  useEffect(() => {
    if ( ! rOrders.data )
      return;

    setPendingOrders( rOrders.data?.orders.filter( order => ! order.invoiceId ) );
  }, [ rOrders.data ])

  const history = useHistory();

  const isLoading = ! rInvoices.data && ! rInvoices.error && ! rOrders.data && ! rOrders.error;

  return (
    <>
      <Helmet>
        <title>Invoices Received</title>
      </Helmet>

      <Box p={2} display="flex" flexDirection="column">

        { !!(pendingOrders && pendingOrders.length) &&
          <>
            <Box display="flex" flexWrap="wrap" alignItems="flex-end">
              <Box flex={1} minHeight={56} p={1} display="flex" flexDirection="row" justifyContent="space-between" alignItems="center" flexWrap="wrap">
                <Typography variant="h3">Pending Orders</Typography>
                <Box display="flex" alignItems="center">
                  <Button style={{ marginLeft: 16 }} onClick={() => history.push( '/orders/new', { previousTitle: document.title } )}>Create</Button>
                </Box>
              </Box>
            </Box>

            <Box mb={6}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><Typography variant="subtitle1">Order Date</Typography></TableCell>
                    <TableCell><Typography variant="subtitle1">Vendor</Typography></TableCell>
                    <TableCell><Typography variant="subtitle1">Cost</Typography></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  { 
                    pendingOrders.map( order => (
                      <TableRow>
                        <TableCell>
                          { formatDate( order.createdAt ) }
                        </TableCell>
                        <TableCell>{ order.vendor.name }</TableCell>
                        <TableCell>
                          ${ (+order.cost).toFixed(2) }
                        </TableCell>
                        <TableCell>
                          <Button disabled={ !! order.invoiceId } onClick={() => history.push( '/invoices/new', { previousTitle: document.title, forOrderId: order.id } )}>Receive Items</Button>
                        </TableCell>
                        <TableCell>
                          <ForwardButton destination={ `/orders/${order.id}` } />
                        </TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            </Box>
          </>
        }

        <Box display="flex" flexWrap="wrap" alignItems="flex-end">
          <Box flex={1} minHeight={56} p={1} display="flex" flexDirection="row" justifyContent="space-between" alignItems="center" flexWrap="wrap">
            <Typography variant="h3">Invoices Received</Typography>
            <Box display="flex" alignItems="center">
              <Button style={{ marginLeft: 16 }} onClick={() => history.push( '/invoices/new', { previousTitle: document.title } )}>Create</Button>
            </Box>
          </Box>
        </Box>
        <Box>
          { 
            isLoading && 
              <Box width="100%" display="flex" justifyContent="center"><CircularProgress/></Box>
          }
          { 
            rInvoices.error &&
              <Alert severity="error">{ rInvoices.error.message }</Alert>
          }      
          {
            rInvoices.data &&
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ width: '30%' }}>
                      <Typography variant="subtitle1">Date</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle1">Vendor</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle1">Number</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle1">Amount</Typography>
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    rInvoices.data?.invoices.map( invoice => {
                      return (
                        <TableRow key={invoice.id}>
                          <TableCell>{invoice.date}</TableCell>
                          <TableCell>{invoice.vendor.name}</TableCell>
                          <TableCell>{invoice.number}</TableCell>
                          <TableCell>${invoice.totalPaid.toFixed(2)}</TableCell>
                          <TableCell>
                            <ForwardButton destination={`/invoices/${invoice.id}`} />
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
}