import { Box, ButtonGroup, Divider, List, ListItem, Button as MuiButton, Popover, Typography, makeStyles, useTheme } from '@material-ui/core';
import React, { ReactElement, useState } from 'react';

import { Add } from '@material-ui/icons';
import { Button } from './Button';
import { Ingredient } from '../../models/Ingredient';
import { SearchInput } from './SearchInput';
import { useTranslation } from 'react-i18next';

export interface IngredientSelectorProps {
  loading: boolean;
  showing: boolean;
  onSelect: ( ingredient: Ingredient ) => void;
  onCreate: ( ingredient: Partial<Ingredient> ) => void;
  onClose: ( ) => void;
  onQueryChange: ( query: string ) => void;
  anchorEl: HTMLElement|null;
  query: string;
  ingredients: Ingredient[];
  initialQuery: string;
  type?: 'pantry' | 'prep';
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

export const IngredientSelector = ( props: IngredientSelectorProps ): ReactElement => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { query = '', type } = props;
  const [ selected, setSelected ] = useState( type === 'prep' ? 'Prep' : 'Pantry' );
  const theme = useTheme();

  const handleClickCreate = ( ): void => {
    const type = selected.toLowerCase() === 'pantry' ? 'pantry' : 'prep';
    const ingredient = { name: query, type: type } as const;
    props.onCreate( ingredient );
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
          <Typography variant="body2" className={classes.description}>Type to select or create the ingredient</Typography>
        </Box>
        <Box mx={2}>
          <SearchInput fullWidth placeholder="Ingredient's name" value={query} onChange={props.onQueryChange} autoFocus />
        </Box>
        {
          props.ingredients.length > 0 &&
            <Box mt={1}>
              <List className={classes.list}>
                {
                  props.ingredients.flatMap( ( ingredient: Ingredient ) => [
                    <ListItem
                      key={ingredient.id + '::::' + Math.random() /* This list is always short enough to re-render all rows */ }
                      tabIndex={0}
                      onClick={ () => props.onSelect( ingredient ) }
                      onKeyPress={ ( e:React.KeyboardEvent ) => ( e.key === 'Enter' || e.key === ' ' ) && props.onSelect( ingredient ) }
                    >
                      <Typography style={{ color: theme.palette.primaryGray.main }}>{ingredient.name}</Typography>
                    </ListItem>,
                    <Divider />,
                  ] )
                    .slice( 0, -1 )
                }
              </List>
            </Box>
        }
        {
          query.trim() && props.ingredients.every( ( { name } ) => name.toLowerCase() !== query.trim().toLowerCase() ) &&
            <Box mt="auto" mb={3} display="flex" flexDirection="column" alignItems="center">
              <Box p={2} width="100%" textAlign="center">
                <Typography variant="body2" className={classes.description}>or create a new ingredient "{query.trim()}"</Typography>
                { 
                  ! type &&
                    <ButtonGroup className={classes.buttons} aria-label="outlined primary button group" fullWidth>
                      <MuiButton className={selected === 'Pantry' ? classes.selected : ''} onClick={() => setSelected( 'Pantry' )}>{t( 'strings.pantry' )}</MuiButton>
                      <MuiButton className={selected === 'Prep' ? classes.selected : ''} onClick={() => setSelected( 'Prep' )}>{t( 'strings.prep' )}</MuiButton>
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
