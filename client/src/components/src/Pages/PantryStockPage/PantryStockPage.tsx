import { Box, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useMediaQuery, useTheme } from "@material-ui/core";
import { CheckCircleOutline } from "@material-ui/icons";
import React, { ReactElement } from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import formatDate from "../../../../util/formatDate";
import { Button } from "../../../UI";
import { BackToLink } from "../../BackToLink";

export interface PantryStockPageProps {

}

export const PantryStockPage = ( _props: PantryStockPageProps ): ReactElement => {

  const theme = useTheme();
  const isLargeScreen = useMediaQuery( theme.breakpoints.up( 'md' ) );
  const { t } = useTranslation();

  const { date } = useParams<{ date: string }>();

  const isValidating = false;
  const isLoading = false;
  const isSaving = false;

  const entries = [{
    ingredient: 'Bananas',
    theoreticalInventory: 3,
    par: 50,
    suggestedOrderAmount: 2,
  }];

  const handleSave = () => {};

  return (
    <>
      <Helmet>
        <title>Pantry Stock: { date }</title>
      </Helmet>
      { isLargeScreen && <BackToLink /> }
      <Box display="flex" flexWrap="wrap" alignItems="flex-end">
        <Box flex={1} display="flex" alignItems="center">
          <Box minHeight={56} flex={'1 10'} p={1} display="flex" flexDirection="column" justifyContent="flex-end" alignItems="flex-start">
            <Typography variant="h3">Suggested Order</Typography>
            <Typography variant="h4">{ `Date: ${formatDate( date )}` }</Typography>
          </Box>
          <Box flex={1}>
            { isValidating && <CircularProgress /> }
          </Box>
        </Box>
        <Box mb={4} px={2} flex="shrink" display="flex" alignItems="center">
          <Box flex={1} px={2}>
            <Button text={'Print\u00a0Sheets'} />
          </Box>
          <Box flex={1}>
            <Button
              tabIndex={1}
              style={{ marginLeft: 'auto' }}
              startIcon={ isSaving ? <CircularProgress size="1em" style={{ color: '#fff' }} /> : <CheckCircleOutline /> }
              text={ isSaving ? `${t( 'strings.saving' )} ...` : t( 'strings.save' ) }
              onClick={ handleSave }
            />
          </Box>
        </Box>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={{ width: '30%' }}>
                <Typography variant="subtitle1">
                  Pantry Item
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
              <TableCell>Variance</TableCell>
              <TableCell>PAR</TableCell>
              <TableCell>Suggested Order Amount</TableCell>
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
                    ingredient,
                    theoreticalInventory,
                    par,
                    suggestedOrderAmount,
                  }
                ) =>
                  <TableRow key={ingredient}>
                    <TableCell>{ ingredient }</TableCell>
                    <TableCell>{ theoreticalInventory }</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell>{ par }</TableCell>
                    <TableCell>{ suggestedOrderAmount }</TableCell>
                  </TableRow>
                )
            }
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
