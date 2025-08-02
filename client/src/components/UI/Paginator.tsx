import { Box, Button, ButtonGroup, makeStyles } from '@material-ui/core';
import React, { ReactElement } from 'react';

interface Props {
  currentPage: number;
  numPages: number;
  siblingCount?: number;
  boundaryCount?: number;
  onNavigate?: ( page: number ) => void;
}

const useStyles = makeStyles( theme => ( {
  siblingButton: {
    color: theme.palette.primary.main,
    padding: 0,
    minWidth: 0,
    textTransform: 'none',
  },
  buttonGroup: {
    backgroundColor: '#fff',
  },
  button: {
    color: theme.palette.text.primary,
  },
  selected: {
    color: theme.palette.primary.main,
  },
} ) );

export const Paginator = ( props: Props ): ReactElement|null => {
  const { currentPage, numPages, siblingCount = 1, boundaryCount = 1 } = props;
  const classes = useStyles();

  if ( numPages <= 1 )
    return null;

  const navigateTo = function ( page: number ) {
    return ( ) => props.onNavigate && props.onNavigate( page );
  };

  const firstPage = 1;
  const prevPage = currentPage - 1;
  const nextPage = currentPage + 1;
  const lastPage = numPages;
  
  const showPrev = currentPage !== firstPage;
  const showNext = currentPage !== lastPage;
  const prevNextAlignment = showPrev && showNext ? 'space-between'
    : showPrev ? 'flex-start'
      : 'flex-end'
  ;

  const startRange = Array.from( Array( boundaryCount ), ( _, i ) => i + 1 );
  const siblingRange = Array.from( Array( 2*siblingCount + 1 ), ( _, i ) => currentPage - siblingCount + i );
  const endRange = Array.from( Array( boundaryCount ), ( _, i ) => lastPage - i );

  const pages = Array.from( new Set(
    [ ...startRange, ...siblingRange, ...endRange ].filter( page => firstPage <= page && page <= lastPage )
  ) ).sort( ( a, b ) => a - b );

  const pageButtons = pages.flatMap( ( pageNumber, i ) => {
    const buttonClasses = [ classes.button ];
    if ( pageNumber === currentPage )
      buttonClasses.push( classes.selected );

    const page = <Button onClick={navigateTo( pageNumber )} className={buttonClasses.join( ' ' )}>{pageNumber}</Button>;

    const nextPage = pageNumber + 1;
    const nextRequiredPage = pages[ i + 1 ];

    if ( nextPage === nextRequiredPage || nextPage > lastPage )
      return page;

    if ( nextRequiredPage === nextPage + 1 )
      return [ page, <Button onClick={navigateTo( nextPage )} className={classes.button}>{nextPage}</Button> ];

    return [ page, <Button className={classes.button}>...</Button> ];
  } );

  return (
    <Box flex={1} display="flex" justifyContent="center">
      <Box flex="shrink" display="flex" flexDirection="column">
        <Box display="flex" justifyContent={prevNextAlignment}>
          { showPrev && <Button className={classes.siblingButton} onClick={navigateTo( prevPage )}>Prev</Button> }
          { showNext && <Button className={classes.siblingButton} onClick={navigateTo( nextPage )}>Next</Button> }
        </Box>
        <Box display="flex">
          <ButtonGroup className={classes.buttonGroup} aria-label="">
            { pageButtons }
          </ButtonGroup>
        </Box>
      </Box>
    </Box>
  );
};
