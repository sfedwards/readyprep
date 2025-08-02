import { Box, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import { Add, Sync } from '@material-ui/icons';
import { Alert, Skeleton } from '@material-ui/lab';
import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useHistory } from 'react-router-dom';
import { NoSearchResults } from 'src/components/UI/NoSearchResults';

import { AppContext } from '../../../App';
import { useQueryState } from '../../../hooks/useQueryState';
import request from '../../../util/request';
import { Button } from '../../UI/Button';
import { PageSizeSelector } from '../../UI/PageSizeSelector';
import { Paginator } from '../../UI/Paginator';
import { SearchInput } from '../../UI/SearchInput';
import { UploadButton } from '../../UI/UploadButton';
import { ForwardButton } from '../ForwardButton';

const defaultParams = {
  page: '1',
  pageSize: '10',
  search: '',
};

export const PrepListPage = ( ): ReactElement|null => {
  const { t } = useTranslation();
  const history = useHistory();
  
  const [ ingredients, setIngredients ] = useState( [] as any[] );
  const [ numPages, setNumPages ] = useState( 0 );
  const [ initialLoadInProgress, setInitialLoadInProgress ] = useState( true );
  const [ loading, setLoading ] = useState( false );
  const [ error, setError ] = useState( '' );
  const [ { queryString, params }, setQueryState ] = useQueryState( defaultParams );

  const { handlePlanUpgradeRequired } = useContext( AppContext );

  const theme = useTheme();
  const isLargeScreen = useMediaQuery( theme.breakpoints.up( 'md' ) );


  useEffect( () => {
    if ( ! loading )
      return;
    setLoading( false );
      
    const defaultErrorMessage = t( 'elements.prep.error-loading' );

    ( async () => {
      try {
        const { body: res } = await request.get( `/prep${queryString}` );

        setError( '' );
        setLoading( false );
        setNumPages( res.numPages || 0 );
        setIngredients( res.prepIngredients || [] );
      } catch ( err: any ) {
        if ( err.message === 'PLAN_UPGRADE_REQUIRED' )
          handlePlanUpgradeRequired( err.plan );
        else
          setError( err.message || defaultErrorMessage );
        
        setLoading( false );
        setIngredients( [] );
        setNumPages( 0 );
      }
      setInitialLoadInProgress( false );
    } )();

    document.title = 'Prep Ingredients';
  }, [ loading, queryString, params.search, t ] );

  useEffect( () => {
    if ( ! params.search )
      return setLoading( true );
    const timer = setTimeout( () => setLoading( true ), 600 );
    return () => clearTimeout( timer );
  }, [ params.search ] );

  const handleQueryChange = ( query: string ): void => {
    setQueryState( {
      page: undefined,
      search: query,
    } );
  };


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
        <Box minHeight={56} flex={'1 10'} p={1} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h3" noWrap>{ t( 'strings.prep-ingredient_plural' ) }</Typography>
          { loading && <CircularProgress /> }
        </Box>
        <Box flex={1} display="flex" p={1} alignItems="center">
          <Box flex={2} minWidth={180} mx={1} display="flex" alignItems="stretch">
            <SearchInput onSubmit={ () => setLoading( true ) } value={ params.search } onChange={handleQueryChange} />
          </Box>
          <Box flex={1} mx={1} display="flex">
            <Button
              startIcon={<Add />}
              text={t( 'strings.create' )}
              style={{ flex: 1 }}
              onClick={() => history.push( '/prep/new', { previousTitle: document.title } )}
            />
          </Box>
          <Box flex={1} mx={1} display="flex">
            <UploadButton />
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
                  <Typography variant="subtitle1">{ t( 'strings.batch-cost' ) }</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle1">{ t( 'strings.batch-amount' ) }</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle1">{ t( 'strings.par-level' ) }</Typography>
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                ingredients.length
                  ? ingredients.map( ingredient => <PrepIngredientRow key={ingredient.id} ingredient={ingredient} /> )
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
                                  params.search
                                  ?
                                    <NoSearchResults
                                      message={`${t('elements.prep.no-search-results')}${params.search}`}
                                    />
                                  :
                                    <>
                                      <Button
                                        startIcon={<Add />}
                                        text={t( 'strings.create' ) + ' your first ' + t( 'strings.prep-ingredient' )}
                                        style={{ flex: 1 }}
                                        onClick={() => history.push( '/prep/new', { previousTitle: document.title } )}
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


interface PrepIngredientRowProps {
  ingredient: {
    id: number;
    name: string;
    cost: number;
    batchSize: number;
    batchUnit: string;
    parLevel: number;
  }
}

const PrepIngredientRow = ( props: PrepIngredientRowProps ): ReactElement => {
  const { id, name, cost, batchSize, batchUnit, parLevel } = props.ingredient;

  return (
    <TableRow>
      <TableCell><Link to={{ pathname: `/prep/${id}`, state: { previousTitle: document.title } }}>{name}</Link></TableCell>
      <TableCell>{cost > 0 || cost === 0 ? `$${cost.toFixed( 2 ).replace( /\.0*$/, '' )}` : '\u00a0--\u00a0' }</TableCell>
      <TableCell>{batchSize != null && batchUnit != null ? `${batchSize} ${batchUnit}` : '\u00a0--\u00a0' }</TableCell>
      <TableCell>{parLevel != null ? `${( parLevel*batchSize ).toFixed( 2 ).replace( /\.0*$/, '' )} ${batchUnit}` : '\u00a0--\u00a0' }</TableCell>
      <TableCell>
        <ForwardButton destination={`/prep/${id}`} />
      </TableCell>
    </TableRow>
  );
};
