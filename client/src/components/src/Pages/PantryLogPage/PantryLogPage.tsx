import { Box, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@material-ui/core";
import React, { ReactElement } from "react";
import { Helmet } from "react-helmet";
import { useHistory } from "react-router-dom";
import { Button } from "../../../UI";

export interface PantryLogPageProps {

}

export const PantryLogPage = ( _props: PantryLogPageProps ): ReactElement => {

  const isLoading = false;
  const entries = [
    {
      date: '2020-06-26',
      theoreticalValue: 7984.25,
      variance: 1025,
    }
  ];

  const history = useHistory();

  return (
    <>
      <Helmet>
        <title>Pantry Log</title>
      </Helmet>
      <Box py="1.25rem" display="flex" flexWrap="wrap" alignItems="center">
        <Box minHeight={56} flex={'1 10'} p={1} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h3">Pantry Log</Typography>
        </Box>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={{ width: '30%' }}>
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
                  Suggested Order Value 
                </Typography>
              </TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            { isLoading
              ? <TableRow>
                  <TableCell colSpan={20} align="center" style={{ height: 280 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              : entries.map( (
                  {
                    date,
                    theoreticalValue,
                    variance,
                  }
                ) =>
                  <TableRow key={date}>
                    <TableCell>{ date }</TableCell>
                    <TableCell>{ theoreticalValue }</TableCell>
                    <TableCell>{ variance }</TableCell>
                    <TableCell>
                      <Button onClick={ () => history.push( `/pantry/log/${date}`, { previousTitle: document.title } ) }>
                        View / Edit
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button>
                        Print Suggested Orders
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
