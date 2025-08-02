import { Box, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@material-ui/core";
import React, { ReactElement, useContext } from "react";
import useSWR from "swr";
import log from 'loglevel';

import { AppContext } from "../../../../App";
import { Button, PageHeader } from "../../../UI";
import { CountSummary } from "../../../../services/api/models/count-summary.interface";
import { useHistory } from "react-router";
import formatDate from "../../../../util/formatDate";
import { Helmet } from "react-helmet";

export interface CountingLogPageProps {

};

export const CountingLogPage = ( _props: CountingLogPageProps ): ReactElement => {

  const { locationId } = useContext( AppContext );
  log.info( { locationId } );

  const rCounts = useSWR<CountSummary[]>( '/counts' );
  log.info( rCounts );
  
  const isLoading = ! rCounts.data && rCounts.isValidating;

  const history = useHistory();

  return (
    <>
      <Helmet>
        <title>Inventory Counts</title>
      </Helmet>
      <PageHeader title="Inventory Counts">
        <Box ml="auto">
          <Button
            style={{ marginBottom: 0 }}
            onClick={() => history.push('/count/new', { previousTitle: document.title })}
          >Begin New Count</Button>
        </Box>
      </PageHeader>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="subtitle1">
                  Date
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle1">
                  Theoretical Inventory Value
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle1">
                  Recorded Variance
                </Typography>
              </TableCell>
              <TableCell colSpan={2}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            { 
              isLoading &&
                <TableRow>
                  <TableCell colSpan={4}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
            }
            {
              rCounts.data?.map( count => 
                <TableRow>
                  <TableCell>{ formatDate( count.date ) }</TableCell>
                  <TableCell>{ count.theoreticalValue }</TableCell>
                  <TableCell>{ count.variance }</TableCell>
                  <TableCell>
                    <Button
                      onClick={
                        () => {
                          history.push(
                            `/count/${count.id}`,
                            {
                              previousTitle: document.title,
                            },
                          )
                        }
                      }
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ) 
            }
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
  
}