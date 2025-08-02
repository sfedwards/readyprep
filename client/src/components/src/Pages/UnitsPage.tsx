import { Box, CircularProgress, Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import { Add, Sync } from '@material-ui/icons';
import { Alert, Skeleton } from '@material-ui/lab';
import React, { ReactElement, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useQueryState } from '../../../hooks/useQueryState';
import { Unit } from '../../../models/Unit';
import request from '../../../util/request';
import { Button } from '../../UI/Button';
import { EditUnitDialog } from '../../UI/EditUnitDialog';
import { PageSizeSelector } from '../../UI/PageSizeSelector';
import { Paginator } from '../../UI/Paginator';
import { UnitRow } from './UomSettings/UnitRow';

const defaultParams = {
  page: '1',
  pageSize: '50',
};

export const UnitsPage = ( ): ReactElement => {
  const { t } = useTranslation();
  
  const [ units, setUnits ] = useState( [] as any[] );
  const [ numPages, setNumPages ] = useState( 0 );
  const [ loading, setLoading ] = useState( true );
  const [ error, setError ] = useState( '' );
  const [ { queryString, params }, setQueryState ] = useQueryState( defaultParams );
  const [ showingEditUnitDialog, setShowingEditUnitDialog ] = useState( false );
  const [ editingUnit, setEditingUnit ] = useState<Unit>();

  const theme = useTheme();
  const isLargeScreen = useMediaQuery( theme.breakpoints.up( 'md' ) );

  useEffect( () => {
    if ( ! loading )
      return;
      
    const defaultErrorMessage = t( 'elements.units.error-loading' );

    ( async () => {
      try {
        const { body: res } = await request.get( `/units${queryString}` );

        setError( '' );
        setLoading( false );
        setNumPages( res.numPages || 0 );
        setUnits( res.items || [] );
      } catch ( err: any ) {
        setError( err.message || defaultErrorMessage );
        setLoading( false );
        setUnits( [] );
        setNumPages( 0 );
      }
    } )();
  }, [ loading, queryString, params.search, t ] );

  const handleChangePage = ( page: string ): void => {
    setQueryState( { page } );
    setLoading( true );
  };

  const handleChangePageSize = ( newPageSize: string ): void => {
    const currentPage = +( params.page || defaultParams.page );
    const pageSize = +( params.pageSize || defaultParams.pageSize );

    // Adjust currentPage so that the first item showing is still visible
    const newPage = '' + ( Math.floor( ( currentPage - 1 )*pageSize/+newPageSize ) + 1 );
    
    setQueryState( {
      page: newPage,
      pageSize: newPageSize,
    } );
    setLoading( true );
  };

  const handleClickEdit = ( unit: Unit ): void => {
    setEditingUnit( unit );
    setShowingEditUnitDialog( true );
  };

  return (
    <>
      <Container maxWidth="lg" disableGutters>
        <Box py="1.25rem" display="flex" flexWrap="wrap" alignItems="center">
          { /* Enough height for loading spinner + vertical padding */ }
          <Box minHeight={56} flex={1} p={1} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h3" noWrap>{ t( 'strings.unit_plural' ) }</Typography>
            { loading && <CircularProgress /> }
          </Box>
          <Box flex="shrink" display="flex" p={1} alignItems="center">
            <Box flex={1} mx={1} display="flex">
              <Button
                startIcon={<Add />}
                text={t( 'strings.create' )}
                style={{ flex: 1 }}
                onClick={ () => {
                  setEditingUnit( undefined ); setShowingEditUnitDialog( true );
                } }
              />
            </Box>
          </Box>
        </Box>
        <Paper elevation={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography variant="subtitle1">{ t( 'strings.name' ) }</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle1">{ t( 'strings.symbol' ) }</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle1">{ t( 'strings.amount' ) }</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle1">{ t( 'strings.unit-of-measure-acronymn' ) }</Typography>
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  units.length
                    ? units.map( ( unit: Unit ) => (
                      <UnitRow
                        key={ unit.id }
                        unit={ unit }
                        onDelete={ () => setLoading( true ) }
                        onClickEdit={ () => handleClickEdit( unit ) }
                      />
                    ) )
                    :
                    <TableRow>
                      <TableCell colSpan={7}>
                        {
                          loading
                            ? <Skeleton variant="rect" />
                            :
                            <Box py={6} display="flex" justifyContent="center" alignItems="center" flexDirection="column">
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Alert severity="error" style={{ paddingTop: 4, paddingBottom: 4 }}>
                                  {error}
                                </Alert>
                                <Box p={4}>
                                  <Button
                                    startIcon={<Sync />}
                                    onClick={() => setLoading( true )}
                                    text={t( 'strings.retry' )}
                                    style={{ paddingLeft: 16, paddingRight: 16 }}
                                  />
                                </Box>
                              </Box>
                            </Box>
                        }
                      </TableCell>
                    </TableRow>
                }
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Box pt={3} display="flex" alignItems="flex-end">
          <Box flex={1}></Box>
          <Box flex={1} justifyContent="center">
            <Paginator
              numPages={numPages}
              currentPage={+params.page}
              siblingCount={isLargeScreen ? 2 : 1}
              boundaryCount={isLargeScreen ? 3 : 1}
              onNavigate={page => handleChangePage( page+'' )}
            />
          </Box>
          <Box flex={1} display="flex" justifyContent="flex-end">
            <PageSizeSelector value={+params.pageSize} onChange={pageSize => handleChangePageSize( pageSize+'' )} />
          </Box>
        </Box>
      </Container>
      <EditUnitDialog unit={ editingUnit } showing={ showingEditUnitDialog } onClose={ () => {
        setShowingEditUnitDialog( false );
      } } onConfirm={ ( ) => {
        setShowingEditUnitDialog( false ); setLoading( true );
      } } />
    </>
  );
};
