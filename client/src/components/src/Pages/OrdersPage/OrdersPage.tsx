import { Box, Chip, Table, TableBody, TableCell, TableHead, TableRow, Typography, useTheme } from "@material-ui/core";

import { BackToLink } from "../../BackToLink";
import { Button } from "../../../UI";
import { Helmet } from "react-helmet";
import React, { useContext } from "react";
import { ReactElement } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import useSWR from "swr";

import { ListOrdersResponse } from '../../../../services/api/vendors/interface/ListOrders.api.interface';
import { ForwardButton } from "../../ForwardButton";
import formatDate from "../../../../util/formatDate";
import { useProfile } from "../../../../hooks/useProfile";
import { AppContext } from "src/App";

export const OrdersPage = ( ): ReactElement => 
{
  const rOrders = useSWR<ListOrdersResponse>( '/orders' );

  const { handleSubmit } = useForm();

  const history = useHistory();

  const theme = useTheme();

  const { loading, profile } = useProfile();
  const { handlePlanUpgradeRequired } = useContext( AppContext );

  console.log( { loading, profile } );
  if ( profile?.plan.plan === 'BASIC' ) {
    handlePlanUpgradeRequired( 'PREMIUM' );
  }

  const onSubmit = ( ) => {

  };

  return (
    <>
      <Helmet>
        <title>Orders</title>
      </Helmet>
      <Box p={2} display="flex" flexDirection="column">
        <BackToLink />
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box p={2} display="flex" flexDirection="column">

            <Box display="flex" flexWrap="wrap" alignItems="flex-end">
              <Box flex={1} minHeight={56} p={1} display="flex" flexDirection="row" justifyContent="space-between" alignItems="center" flexWrap="wrap">
                <Typography variant="h3">All Orders</Typography>
                <Box display="flex" flexDirection="row">
                  <Box display="flex" alignItems="center">
                    <Button type="submit" style={{ marginLeft: 16 }} onClick={() => history.push( '/orders/new', { previousTitle: document.title } )}>Create</Button>
                  </Box>
                </Box>
              </Box>
            </Box>


            <Box>
              { !!(rOrders.data && rOrders.data.orders.length) &&
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><Typography variant="subtitle1">Order Date</Typography></TableCell>
                      <TableCell><Typography variant="subtitle1">Vendor</Typography></TableCell>
                      <TableCell><Typography variant="subtitle1">Amount</Typography></TableCell>
                      <TableCell></TableCell>
                      <TableCell><Typography variant="subtitle1">Status</Typography></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    { 
                      rOrders.data?.orders.map( order => (
                        <TableRow>
                          <TableCell>
                            { formatDate( order.createdAt ) }
                          </TableCell>
                          <TableCell>{ order.vendor.name }</TableCell>
                          <TableCell>
                            ${ (+order.cost).toFixed(2) }
                          </TableCell>
                          <TableCell>
                            { 
                              order.invoiceId
                                ? <Button onClick={() => history.push( `/invoices/${order.invoiceId}`, { previousTitle: document.title } )}>View Invoice</Button>
                                : <Button disabled={ !! order.invoiceId } onClick={() => history.push( '/invoices/new', { previousTitle: document.title, forOrderId: order.id } )}>Receive Items</Button>
                            }
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={ order.state?.toUpperCase() }
                              style={{
                                backgroundColor: ({
                                  sent: '#a5cfa8',
                                  received: theme.palette.primary.main,
                                } as Record<string, string|undefined>)[order.state],
                                color: ({
                                  received: '#fff',
                                } as Record<string, string|undefined>)[order.state],
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <ForwardButton destination={ `/orders/${order.id}` } />
                          </TableCell>
                        </TableRow>
                      ))
                    }
                  </TableBody>
                </Table>
              }
            </Box>

          </Box>
        </form>
      </Box>
    </>
  );
}