import { Box, Divider, List, ListItem, Popover, Typography, makeStyles } from '@material-ui/core';
import React, { ReactElement } from 'react';

import { Button } from './Button';
import { SearchInput } from './SearchInput';

export interface MenuItemSelectorProps {
  loading: boolean;
  showing: boolean;
  onSelect: ( item: any ) => void;
  onClose: ( ) => void;
  onQueryChange: ( query: string ) => void;
  anchorEl: HTMLElement|null;
  query: string;
  items: any[];
  allowCreation?: boolean;
}

const useStyles = makeStyles( theme => ( {
  root: {
    '& .MuiPaper-rounded': {
      borderRadius: 8,
    },
  },
  description: {
    fontSize: '0.72rem',
    marginTop: 8,
    marginBottom: 8,
  },
  buttons: {
    borderRadius: 8,
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
  list: {
    height: 200,
    overflow: 'auto',
    lineHeight: '20px',
    '& li:hover': {
      background: '#e5e5e5',
      cursor: 'pointer',
    },
  },
} ) );

export const MenuItemSelector = ( props: MenuItemSelectorProps ): ReactElement => {
  const classes = useStyles();

  return (
    <Popover
      anchorEl={ props.anchorEl }
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      open={ props.showing }
      onClose={ props.onClose }
      className={classes.root}
    >
      <Box minHeight={300} display="flex" flexDirection="column" alignItems="stretch">
        <Box mx="auto" maxWidth="80%" textAlign="center">
          <Typography variant="body2" className={classes.description}>Type to select a Menu Item</Typography>
        </Box>
        <Box mx={2}>
          <SearchInput fullWidth placeholder="Menu Item's name" value={props.query} onChange={props.onQueryChange} autoFocus />
        </Box>
        {
          props.items.length > 0 &&
            <Box mt={1}>
              <List className={classes.list}>
                {
                  props.items.flatMap( ( item: any ) => [
                    <ListItem
                      key={item.id + '::::' + Math.random() /* This list is always short enough to re-render all rows */ }
                      tabIndex={0}
                      onClick={ () => props.onSelect( item ) }
                      onKeyPress={ ( e:React.KeyboardEvent ) => ( e.key === 'Enter' || e.key === ' ' ) && props.onSelect( item ) }
                    >
                      {item.name}
                    </ListItem>,
                    <Divider />,
                  ] )
                    .slice( 0, -1 )
                }
              </List>
            </Box>
        }
      </Box>
      { props.allowCreation &&
        <Box py={2} display="flex" justifyContent="center">
          <Button text={ `Create "${props.query}"` } onClick={ () => props.onSelect( { name: props.query } ) } />
        </Box>
      }
    </Popover>
  );
};
