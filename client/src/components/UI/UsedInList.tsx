import { Box, Button, ButtonGroup, ListItem, Typography, makeStyles } from '@material-ui/core';
import React, { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface Props {
  usedIn: {
    id: number;
    type: string;
    name: string;
  }[];
}

const useStyles = makeStyles( theme => ( {
  root: {
    background: '#fff',
    maxWidth: 400,
    whiteSpace: 'nowrap',
    marginLeft: 12,
  },
  selected: {
    background: theme.palette.hover.main,
    '&.MuiButtonBase-root.MuiButton-root': {
      marginTop: -2,
      marginBottom: -2,
      borderRadius: 8,
      borderColor: 'rgba(0,0,0,0.23)',
      zIndex: 1,
    },
    '&.MuiButtonGroup-groupedOutlinedHorizontal:not(:first-child)': {
      marginLeft: -5,
    },
    '&.MuiButtonGroup-groupedOutlinedHorizontal:first-child': {
      transform: 'transformX(-5px)',
    },
    '&.MuiButtonGroup-groupedOutlinedHorizontal:not(:last-child)': {
      marginRight: -4,
    },
    '&.MuiButtonGroup-groupedOutlinedHorizontal:last-child': {
      transform: 'transformX(4px)',
    },
    '&:hover': {
      background: theme.palette.hover.main,
    },
  },
} ) );

export const UsedInList = ( props: Props ): ReactElement => {
  const { t } = useTranslation();
  const [ selectedType, setSelectedType ] = useState( 'all' );
  const classes = useStyles( );
  const { usedIn } = props;

  return (
    <>
      <Box display="flex" alignItems="flex-end">
        <Typography variant="h6">Used In:</Typography>
        <ButtonGroup className={ classes.root } aria-label="outlined primary button group" fullWidth>
          <Button className={selectedType === 'prep' ? classes.selected : '' } onClick={() => setSelectedType( 'prep' )}>{ t( 'strings.prep' )}</Button>
          <Button className={selectedType === 'item' ? classes.selected : '' } onClick={() => setSelectedType( 'item' )}>{ t( 'strings.menu-item_plural' )}</Button>
          <Button className={selectedType === 'all' ? classes.selected : '' } onClick={() => setSelectedType( 'all' )}>{ t( 'strings.all' )}</Button>
        </ButtonGroup>
      </Box>
      <Box pt={2}>
        { (usedIn ?? []).length === 0
          ? 'None'
          : usedIn
            .filter( ( { type } ) => selectedType === 'all' || selectedType === type )
            .map( ( { id, type, name } ) => {
              const path = type === 'prep' ? 'prep' : 'items';
              return (
                <ListItem key={`${type}:${id}`}>
                  <Link to={{ pathname: `/${path}/${id}`, state: { previousTitle: document.title } }}>{ name }</Link>
                </ListItem>
              );
            } )
        }
      </Box>
    </>
  );

};
