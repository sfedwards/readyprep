import { Box, Typography } from '@material-ui/core';
import React, { ReactElement, useContext, useMemo } from 'react';
import { useLocation, useParams } from 'react-router';
import useSWR from 'swr';
import { AppContext } from '../../../../App';
import { Button } from '../../../UI';
import { Logo } from '../../../UI/Logo';
import { useViewOrderPageStyles } from './styles';

interface PurchaseOrder {
  number: string;
  contact: string;
  includePrices: boolean;
  location: {
    name: string;
    address: string;
    phoneNumber: string;
  };
  items: {
    catalogNumber: string;
    name: string;
    quantity: number;
    pricePer: number;
  }[];
}

export const ViewPurchaseOrderPage = (): ReactElement => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const key = useMemo( () => new URLSearchParams( location.search ).get( 'key' ), [ location.search ] );

  const rOrder = useSWR<PurchaseOrder>( `/po/${id}?key=${key}` );
  const classes = useViewOrderPageStyles();

  const { handlePlanUpgradeRequired } = useContext( AppContext );

  return (
    <Box overflow="hidden" width="100vw" height="100vh" className={classes.background}>
      <Box
        width={670}
        mx="auto"
        mt={5}
        style={{
          background: '#fff',
        }}
      >
        <Box p={3}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Box>
              <Typography variant="h6">{ rOrder.data?.location.name } ({ rOrder.data?.contact })</Typography>
              <Typography variant="h6">{ rOrder.data?.location.address }</Typography>
              <Typography variant="h6">{ rOrder.data?.location.phoneNumber }</Typography>
            </Box>
	    <Typography variant="h6">Order # { rOrder.data?.number }</Typography>
	    <Box displayPrint="none" display>
              <Button onClick={() => window.print()}>Print</Button>
            </Box>
          </Box>
          <Box>
            <Box
              mt="20px"
              pb="40px"
              display="grid"
              gridTemplateColumns={
		rOrder.data?.includePrices
		  ? 'auto 1fr auto auto'
		  : 'auto 1fr auto'
	      }
              style={{
                columnGap: 40,
                rowGap: 20,
              }}
            >
              <Typography variant="h6" style={{ fontSize: '1em' }}>Catalog #</Typography>
              <Typography></Typography>
              <Typography variant="h6" style={{ fontSize: '1em' }}>Quantity</Typography>
	      { rOrder.data?.includePrices &&
	        <Typography variant="h6" style={{ fontSize: '1em', textAlign: 'right' }}>Total</Typography>
              }
              {
                rOrder.data?.items.map( item => {
                  return (
                    <>
                      <Typography style={{ fontWeight: 500 }}>{ item.catalogNumber }</Typography>
                      <Typography>{ item.name }</Typography>
                      <Typography align="right">{ item.quantity }</Typography>
		      { rOrder.data?.includePrices &&
		        <Typography>${ (item.pricePer*item.quantity).toFixed(2) }</Typography>
		      }
                    </>
                  );
                })
              }
	      {
		rOrder.data?.includePrices &&
		  <Box mt={2} gridColumn="1/5" display="flex" justifyContent="flex-end">
	            <Typography color="textPrimary" style={{ fontWeight: 500 }}>Total: ${
		      rOrder.data?.items.reduce( (sum, item) => 
		        sum + item.pricePer*item.quantity, 0
	              ).toFixed(2)}
		    </Typography>
		  </Box>
	      }
            </Box>
          </Box>
        </Box>
        <Box
	  display="flex"
	  justifyContent="center"
	  lineHeight={0}
	  p={2}
	>
	  <Logo style={{ height: 38 }} />
        </Box>
      </Box>
    </Box>
  );
};
