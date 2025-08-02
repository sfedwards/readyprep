import { Box, ButtonGroup, Divider, List, ListItem, Button as MuiButton, Popover, Typography, makeStyles, useTheme } from '@material-ui/core';
import React, { ReactElement, useState } from 'react';

import { Add } from '@material-ui/icons';
import { Button } from './Button';
import { SearchInput } from './SearchInput';
import { startCase } from 'lodash';

interface Item {
  id?: string|number;
  name: string;
  type?: string;
}

export interface SelectorProps<T extends Item> {
  name: string;
  loading: boolean;
  showing: boolean;
  onSelect: ( t: T ) => void;
  onClickCreate: ( t: Omit<T, 'id'> ) => void;
  onClose: ( ) => void;
  onQueryChange: ( query: string ) => void;
  anchorEl?: Element | null;
  query: string;
  data: T[];
  types?: string[];
  initialQuery?: string;
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

export const Selector = <T extends Item>( props: SelectorProps<T> ): ReactElement => {
  const classes = useStyles();

  const { query = '', types } = props;
  const [ selected, setSelected ] = useState( types?.[0] );
  const theme = useTheme();

  const handleClickCreate = ( ): void => {
    const type = selected;
    const item: Item = { name: query, type: type };
    props.onClickCreate( item as any );
  };

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
      <Box minHeight={350} display="flex" flexDirection="column" alignItems="stretch">
        <Box mx="auto" maxWidth="80%" textAlign="center">
          <Typography variant="body2" className={classes.description}>Type to select or create {'aeiou'.split('').includes( props.name[0] ) ? 'an' : 'a'} {props.name}</Typography>
        </Box>
        <Box mx={2}>
          <SearchInput fullWidth placeholder={`${props.name}'s name`} value={query} onChange={props.onQueryChange} autoFocus />
        </Box>
        {
          props.data.length > 0 &&
            <Box mt={1}>
              <List className={classes.list}>
                {
                  props.data.flatMap( ( item: T ) => [
                    <ListItem
                      key={item.id + '::::' + Math.random() /* This list is always short enough to re-render all rows */ }
                      tabIndex={0}
                      onClick={ () => props.onSelect( item ) }
                      onKeyPress={ ( e:React.KeyboardEvent ) => ( e.key === 'Enter' || e.key === ' ' ) && props.onSelect( item ) }
                    >
                      <Typography style={{ color: theme.palette.primaryGray.main }}>{item.name}</Typography>
                    </ListItem>,
                    <Divider />,
                  ] )
                    .slice( 0, -1 )
                }
              </List>
            </Box>
        }
        {
          query.trim() && props.data.every( ( { name } ) => name.toLowerCase() !== query.trim().toLowerCase() ) &&
            <Box mt="auto" mb={3} display="flex" flexDirection="column" alignItems="center">
              <Box p={2} width="100%" textAlign="center">
                <Typography variant="body2" className={classes.description}>or create a new {props.name} "{query.trim()}"</Typography>
                { 
                  types && types.length > 1 &&
                    <ButtonGroup className={classes.buttons} aria-label="outlined primary button group" fullWidth>
                      {
                        types.map( type =>
                          <MuiButton className={selected === type ? classes.selected : ''} onClick={() => setSelected( type )}>{startCase( type )}</MuiButton>
                        )
                      }
                    </ButtonGroup>
                }
              </Box>
              <Button
                startIcon={<Add />}
                text="Create"
                onClick={ handleClickCreate }
              />
            </Box>
        }
      </Box>
    </Popover>
  );
};
