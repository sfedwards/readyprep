import { Box, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@material-ui/core";
import React, { ReactElement } from "react";
import useSWR from "swr";

import { Button, DeleteButton, PageHeader } from "../../../UI";
import { useHistory } from "react-router";
import { Helmet } from "react-helmet";
import { CountingListSummary } from "../../../../services/api/models/counting-list-summary.interface";
import { useCountingListsApi } from "../../../../services/api/hooks/useCountingListsApi.api.hook";

export interface CountingListsPageProps {

};

export const CountingListsPage = ( _props: CountingListsPageProps ): ReactElement => {

  const rCountingLists = useSWR<CountingListSummary[]>( '/counting-lists' );
  
  const isLoading = ! rCountingLists.data && rCountingLists.isValidating;

  const history = useHistory();

  const countingListsApi = useCountingListsApi();


  const handleClickDelete = async ( id: string ) => {
    await countingListsApi.delete( id );
    await rCountingLists.mutate();
  };

  return (
    <>
      <Helmet>
        <title>Counting Lists</title>
      </Helmet>
      <PageHeader title="Counting Lists">
        <Box ml="auto">
          <Button
            style={{ marginBottom: 0 }}
            onClick={() => history.push('/counting-list/new', { previousTitle: document.title })}
          >Create New list</Button>
        </Box>
      </PageHeader>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="subtitle1">
                  Name
                </Typography>
              </TableCell>
              <TableCell style={{ width: '0.1%' }}></TableCell>
              <TableCell style={{ width: '0.1%' }}></TableCell>
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
              rCountingLists.data?.map( list => 
                <TableRow>
                  <TableCell>{ list.name }</TableCell>
                  <TableCell>
                    <Button
                      onClick={
                        () => {
                          history.push(
                            `/counting-list/${list.id}`,
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
                  <TableCell>
                    { ! list.isDefault &&
                      <DeleteButton onClick={() => handleClickDelete( list.id )} />
                    }
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