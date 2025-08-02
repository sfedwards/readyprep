import React, { ReactElement, useEffect, useMemo, useState } from "react";
import useSWR from "swr";

import { GetInventoryResponse } from "../../../../services/api/pantry/interface/get-inventory.api.interface";
import formatDate from "../../../../util/formatDate";
import { Button, PageHeader, TextInput } from "../../../UI";
import { BackToLink } from "../../BackToLink";
import { 
  Box,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@material-ui/core";
import { useParams } from "react-router";
import { GetCountResponse } from "../../../../services/api/counting/interface/get-count.api.interface";
import { Optional } from "utility-types";
import formatNumber from "../../../../util/formatNumber";
import { useDebouncedCallback } from "use-debounce";
import { useSnackbar } from "notistack";
import { useCountingApi } from "../../../../services/api/hooks/useCountingApi.api.hook";
import { DateInput } from "../../..";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import request from "../../../../util/request";
import { CountingListSummary } from "../../../../services/api/models/counting-list-summary.interface";
import { GetCountingListResponse } from "../../../../services/api/counting-lists/interface/get-counting-list.api.interface";

export interface CountingPageProps {

};

export const CountingPage = ( _props: CountingPageProps ): ReactElement => {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';

  const [ countingListId, setCountingListId ] = useState<string|null>( null );
  const { control, getValues } = useForm<{ date: string }>();

  const rCount = useSWR<GetCountResponse>( isNew ? null : `/counts/${id}` );
  const rCountingLists = useSWR<CountingListSummary[]>( '/counting-lists' );
  const rInventory = useSWR<GetInventoryResponse>( `/pantry/inventory`, { refreshInterval: 0, revalidateOnFocus: false } );
  const rSelectedList = useSWR<GetCountingListResponse>(
    ! countingListId ? null : `/counting-lists/${countingListId}`,
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
    }
  )

  const history = useHistory();
  const historyState = history.location.state as { listId?: string }|null;

  useEffect( () => {
    if ( historyState?.listId )
      setCountingListId(historyState?.listId);
  }, [historyState?.listId])

  const countingApi = useCountingApi();

  const handleNewCount = async () => {
    if ( ! isNew || ! countingListId )
      throw Error('Not a new count');

    const { date } = getValues();
    const { id } = await countingApi.createCount( { 
      countingListId: countingListId,
      date: new Date( date ).toISOString().slice(0,10),
    } );
    return id;
  };

  const handleClickPrintSheets = async () => {
    const { res } = await request.post( '/counting-sheets/pantry', {
      parseBody: false,
    } );

    const blob = await res.blob();
    const url = URL.createObjectURL( blob );
    window.open( url );
  }

  useEffect( () => {
    if ( rCount.data?.countingListId )
      setCountingListId( rCount.data?.countingListId );
  }, [rCount.data]);

  const rows = useMemo( () => {
    const rows: Optional<GetCountResponse['items'][number],'actualQuantity'>[] = rCount.data?.items ?? [];

    rows.push(
      ...(
        rSelectedList.data?.items?.filter( 
          row => rows.every( ({ ingredient }) => ingredient.id !== row.ingredient.id )
        ).map( row => ({
          ingredient: row.ingredient,
          theoreticalQuantity: 0,//row.quantity,
          unit: row.unit,
        })) ?? []
      ),
    );

    return rows;
  }, [rCount.data, rSelectedList.data, rInventory.data]);

  const date = rCount.data?.date;

  const isLoading = (! rCount.data && rCount.isValidating) || 
    (! rSelectedList.data && rSelectedList.isValidating);

  return (
    <>
      <BackToLink />
      <PageHeader
        title="Daily Pantry Stock"
        subtitle={date ? `Date: ${formatDate(date)}` : undefined}
      >
        <Box ml="auto">
          <Button onClick={handleClickPrintSheets}>Print Sheets</Button>
        </Box>
      </PageHeader>
      <Box display="flex">
        <Box flex={1} maxWidth={290} mr={2}>
          <TextInput 
            label="CountingList"
            select={!countingListId}
            disabled={!!countingListId}
            onChange={e => { setCountingListId(e.target.value) }}
            value={rCountingLists.data?.find( list => list.id === countingListId )?.name}
          >
            { rCountingLists.data?.map( list => 
              <MenuItem key={list.id} value={list.id}>{list.name}</MenuItem>
            ) }
          </TextInput>
        </Box>
        <Box flex={1} maxWidth={290}>
          <DateInput
            name="date"
            control={control}
            defaultValue={new Date()}
            disabled={!isNew}
          />
        </Box>
      </Box>
      { ! isLoading &&
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="subtitle1">
                    Pantry item
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle1">
                    Theoretical Inventory
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle1">
                    Actual Inventory
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle1">
                    Variance
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                rows.map( data =>
                  <Row
                    key={data.ingredient.id}
                    id={id}
                    onNewCount={handleNewCount}
                    data={data}
                  />
                )
              }
            </TableBody>
          </Table>
        </TableContainer>
      }
    </>
  );
  
}

interface RowProps {
  id: string;
  data: Optional<GetCountResponse['items'][number],'actualQuantity'>;
  onNewCount: () => Promise<string>;
}

const Row = ({ id, data, onNewCount }: RowProps): ReactElement => {
  const isNew = id === 'new';

  const { enqueueSnackbar } = useSnackbar();
  const countingApi = useCountingApi();
  const history = useHistory();

  const updateRemote = useDebouncedCallback(
    async (ingredientId: number, newQuantity: number) => {
      const countId = isNew ? await onNewCount() : id;

      await countingApi.updateCount(
        countId,
        {
          ingredientId,
          actualQuantity: newQuantity,
        },
      );
      enqueueSnackbar(
        'Successfully saved',
        {
          variant: 'success',
          anchorOrigin: {
            horizontal: 'center',
            vertical: 'top',
          }
        }
      );

      if ( isNew ) {
        history.replace( `/count/${countId}` );
      }
    },
    400
  );

  const [ actualQuantity, setActualQuantity ] = useState( data.actualQuantity ?? '' );

  useEffect(() => {
    if (data.actualQuantity)
      setActualQuantity(data.actualQuantity);
  }, [data.actualQuantity]);

  return (
    <TableRow>
      <TableCell>{ data.ingredient.name } </TableCell>
      <TableCell>{ `${data.theoreticalQuantity} ${data.unit ?? '?'}` }</TableCell>
      <TableCell>
        <Box display="flex" alignItems="center">
          <Box width={100} mr={2}>
            <TextInput 
              size="small"
              onChange={e => {
                const value = e.target.value;
                setActualQuantity(value);
                updateRemote(data.ingredient.id, +value);
              }}
              value={actualQuantity}
            />
          </Box>
          { data.unit ?? '?' }
        </Box>
      </TableCell>
      <TableCell>
        {
          actualQuantity !== undefined && actualQuantity !== '' && !isNaN(+actualQuantity) &&
          formatNumber(+actualQuantity - data.theoreticalQuantity)
        }
      </TableCell>
    </TableRow>
  );
}
