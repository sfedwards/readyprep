import { Box, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import { Add, Sync } from '@material-ui/icons';
import { Alert, Skeleton } from '@material-ui/lab';
import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useHistory } from 'react-router-dom';
import { AppContext } from 'src/App';

import { useQueryState } from '../../../hooks/useQueryState';
import request from '../../../util/request';
import { Button } from '../../UI/Button';
import { PageSizeSelector } from '../../UI/PageSizeSelector';
import { Paginator } from '../../UI/Paginator';
import { ForwardButton } from '../ForwardButton';

const defaultParams = {
  page: '1',
  pageSize: '10',
  search: '',
};

export const MenusListPage = ( ): ReactElement|null => {
  const { t } = useTranslation();
  const history = useHistory();
  
  const [ menus, setMenus ] = useState( [] as any[] );
  const [ numPages, setNumPages ] = useState( 0 );
  const [ initialLoadInProgress, setInitialLoadInProgress ] = useState( true );
  const [ loading, setLoading ] = useState( true );
  const [ error, setError ] = useState( '' );
  const [ { queryString, params }, setQueryState ] = useQueryState( defaultParams );

  const theme = useTheme();
  const isLargeScreen = useMediaQuery( theme.breakpoints.up( 'md' ) );
  
  const { handlePlanUpgradeRequired } = useContext( AppContext );

  useEffect( () => {
    if ( ! loading )
      return;
      
    const defaultErrorMessage = t( 'elements.menu.error-loading' );

    ( async () => {
      try {
        const { body: res } = await request.get( `/menus${queryString}` );

        setError( '' );
        setLoading( false );
        setNumPages( res.numPages || 0 );
        setMenus( res.menus || [] );
      } catch ( err: any ) {
        if ( err.message === 'PLAN_UPGRADE_REQUIRED' )
          handlePlanUpgradeRequired( err.plan );
        setError( err.message || defaultErrorMessage );
        setLoading( false );
        setMenus( [] );
        setNumPages( 0 );
      }
      setInitialLoadInProgress( false );
    } )();

    document.title = 'Menus';
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

  if ( initialLoadInProgress )
    return null;

  return (
    <>
      <Box py="1.25rem" display="flex" flexWrap="wrap" alignItems="center">
        { /* Enough height for loading spinner + vertical padding */ }
        <Box minHeight={56} flex={1} p={1} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h3" noWrap>{ t( 'strings.menu_plural' ) }</Typography>
          { loading && <CircularProgress /> }
        </Box>
        <Box flex={1} maxWidth={200} display="flex" p={1} alignItems="center">
          <Box flex={1} mx={1} display="flex">
            { menus.length > 0 &&
              <Button
                startIcon={<Add />}
                text={t( 'strings.create' )}
                style={{ flex: 1 }}
                onClick={() => history.push( '/menus/new', { previousTitle: document.title } )}
              />
            }
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
                  <Typography variant="subtitle1">{ t( 'strings.number-of-items' ) }</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle1">{ t( 'strings.last-updated' ) }</Typography>
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                menus.length
                  ? menus.map( menu => <MenuRow key={menu.id} menu={menu} /> )
                  :
                  <TableRow>
                    <TableCell colSpan={7}>
                      {
                        loading
                          ? <Skeleton variant="rect" />
                          :
                          <Box py={6} display="flex" justifyContent="center" alignItems="center" flexDirection="column">
                            {
                              error
                                ? <Box display="flex" justifyContent="space-between" alignItems="center">
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
                                :
                                <>
                                  <Button
                                    startIcon={<Add />}
                                    text={t( 'strings.create' ) + ' your first ' + t( 'strings.menu' )}
                                    style={{ flex: 1 }}
                                    onClick={() => history.push( '/menus/new', { previousTitle: document.title } )}
                                  />
                                </>
                            }
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
    </>
  );
};

interface MenuRowProps {
  menu: {
    id: number;
    name: string;
    numItems: number;
    updatedAt: string;
  }
}

const MenuRow = ( props: MenuRowProps ): ReactElement => {
  const { id, name, numItems, updatedAt } = props.menu;
  
  const [ , month, dayOfMonth, year ] = new Date( updatedAt ).toDateString().split( ' ' );
  const updatedAtStr = `${month} ${dayOfMonth}, ${year}`;

  return (
    <TableRow>
      <TableCell><Link to={{ pathname: `/menus/${id}`, state: { previousTitle: document.title } }}>{name}</Link></TableCell>
      <TableCell>{numItems}</TableCell>
      <TableCell><Tooltip title={ new Date( updatedAt ).toLocaleString() }><span>{ updatedAtStr }</span></Tooltip></TableCell>
      <TableCell><ForwardButton destination={ `/menus/${id}` } /></TableCell>
    </TableRow>
  );
};
