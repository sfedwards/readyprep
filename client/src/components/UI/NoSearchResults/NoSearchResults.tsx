import React, { ReactElement } from 'react';
import { makeStyles, Typography } from "@material-ui/core";
import { Search } from '@material-ui/icons';

export interface NoSearchResultsProps {
  message: string;
}

const useStyles = makeStyles( {
  root: {
    color: '#333',
    fontSize: '9rem',
  },
} );

export const NoSearchResults = (
  {
    message,
  }: NoSearchResultsProps,
): ReactElement => {
  const classes = {
    icon: useStyles(),
  };

  return (
    <>
      <Search className={classes.icon.root} />
      <Typography>
        { message }
      </Typography> 
    </>
  )
}