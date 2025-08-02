import { Box, Button, Checkbox, Dialog, Typography, makeStyles, useTheme } from '@material-ui/core';
import { CheckCircleOutline, Clear } from '@material-ui/icons';
import React, { ChangeEvent, ReactElement, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilCallback, useRecoilState, useRecoilValue } from 'recoil';

import { TextInput } from '../../../UI/TextInput';
import { Seen, prepOverride, printRecipeBatches, printRecipeCount, printRecipeInclude, selectAll } from './state';

interface PrintRecipesDialogProps {
  onConfirm: ( recipes: { recipeId: string, batches: number }[] ) => void;
  onClose: ( ) => void;
  open: boolean;
  recipes: { id: string, name: string, batchSize: number, batchUnit: string, batches: number|string }[];
}

const useStyles = makeStyles( theme => ( {
  root: {
  },
  title: {
    flex: 1,
    display: 'flex',
    alignItems: 'flex-end',
    color: theme.palette.primary.main,
    fontWeight: 400,
    fontSize: '2rem',
    paddingBottom: 16,
    [theme.breakpoints.down( 'sm' )]: {
      fontSize: '1.5rem',
    },
  },
  content: {
    textAlign: 'center',
    padding: 0,
  },
  buttons: {
    width: '100%',
    padding: 0,
    display: 'flex',
    '& button': {
      flex: 1,
      borderRadius: 0,
      border: 0,
      color: '#fff',
      padding: 16,
      '& .MuiSvgIcon-root': {
        marginRight: 8,
      },
    },
  },
  cancelButton: {
    background: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  confirmButton: {
    background: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
} ) );

export const PrintRecipesDialog = ( props: PrintRecipesDialogProps ): ReactElement => {
  const { t } = useTranslation();

  const theme = useTheme();
  const classes = useStyles( theme );

  const recipes = useMemo( () => {
    return props.recipes
      .map( ( { id, name, batchSize, batchUnit, batches }, index ) => ( {
        id,
        name,
        batchSize,
        batchUnit,
        include: true,
        batches: batches + '',
        index,
      } ) )
      .sort( ( a, b ) => {
        if ( a.batches && ! b.batches )
          return -1;
        if ( b.batches && ! a.batches )
          return 1;
        return a.name.localeCompare( b.name );
      } )
    ;
  }, [ props.recipes ] );

  const initState = useRecoilCallback( ( { snapshot, set } ) => async () => {
    const count = recipes.length;
    set( printRecipeCount, count );
    for ( let i = 0; i < count; i++ ) {
      const recipe = recipes[i];
      const { prep } = await snapshot.getPromise( prepOverride( recipe.id ) );
      const batches = prep ? +prep/recipe.batchSize : +recipe.batches;
      set( printRecipeInclude( i ), batches > 0 );
      set( printRecipeBatches( i ), batches + '' );
    }
  }, [ recipes, props.open ] );

  useEffect( () => {
    initState();
  }, [ initState ] );

  const handleSubmit = ( e: React.FormEvent<HTMLFormElement> ): void => {
    e.preventDefault();

    const data = new FormData( e.currentTarget );
    const recipesToInclude: { recipeId: string, batches: number }[] = [];
    
    for ( let i = 0; i < recipes.length; i++ ) {
      const [ include, batches ] = [ data.get( `recipes[${i}].include` ), +( data.get( `recipes[${i}].batches` ) ?? 0 ) ];
      if ( ! ( include && +batches > 0 ) )
        continue;
        
      recipesToInclude.push( ( {
        recipeId: recipes[i].id,
        batches: +batches,
      } ) );
    }
    
    props.onConfirm?.( recipesToInclude );
  };

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
      className={classes.root}
      fullWidth
      maxWidth="sm"
      keepMounted
    >
      <form onSubmit={handleSubmit}>
        <Box display="flex" flexDirection="column" alignItems="stretch">
          <Box p={3} pb={2} className={classes.title} id="dialog-title">
            Print Recipes
          </Box>
          <Box px={3} flex={1} display="flex" justifyContent="space-between" alignItems="center">
            <Box flex={0} pr={1}>
              <SelectAllCheckbox />
            </Box>
            <Box flex={1}><Typography variant="subtitle1">Recipe</Typography></Box>
            <Box flex={1}><Typography variant="subtitle1">Batches</Typography></Box>
          </Box>
          <Box overflow="auto" height={360}>
            { recipes.map( ( recipe, index ) => <Row key={index} recipe={recipe} index={index} /> ) }
          </Box>
        </Box>
        <div className={classes.buttons}>
          <Button onClick={props.onClose} className={classes.cancelButton}>
            <Clear />{t( 'strings.cancel' )}
          </Button>
          <Button type="submit" className={classes.confirmButton} autoFocus>
            <CheckCircleOutline />{'Print\u00a0Recipes'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

const SelectAllCheckbox = (): ReactElement => {
  const selectAllState = useRecoilValue( selectAll );
  
  const handleCheckSelectAll = useRecoilCallback( ( { snapshot, set } ) => async ( checked: boolean ) => {
    const count = await snapshot.getPromise( printRecipeCount );
    for ( let i = 0; i < count; i++ )
      set( printRecipeInclude( i ), checked );
    
  } );
  
  return (
    <Checkbox
      color="primary"
      indeterminate={( selectAllState & Seen.Both ) === Seen.Both}
      checked={( selectAllState & Seen.True ) === Seen.True}
      onChange={( _, checked ) => handleCheckSelectAll( checked )}
    />
  );
};

const Row = (
  { recipe,
    index,
  }:
  {
    recipe:
    {
      name: string,
      batchSize: number,
      batchUnit: string
    },
    index: number
  } ): ReactElement|null => {
  const [ include, setInclude ] = useRecoilState( printRecipeInclude( index ) );
  const [ batches, setBatches ] = useRecoilState( printRecipeBatches( index ) );

  const handleChangeInclude = useCallback( ( _, checked ) => setInclude( checked ), [] );
  const handleChangeBatches = useCallback(
    ( e: ChangeEvent<HTMLInputElement> ) => setBatches( e.currentTarget.value ),
    []
  );
  
  if ( ! recipe )
    return null;

  return (
    <Box px={3} flex={1} display="flex" alignItems="center">
      <Box flex={0} pr={1}>
        <Checkbox
          name={`recipes[${index}].include`}
          value="1" color="primary"
          id={`recipes[${index}].include`}
          checked={include}
          onChange={ handleChangeInclude}
        />
      </Box>
      <Box flex={2}><label style={{ cursor: 'pointer' }} htmlFor={`recipes[${index}].include`}><Typography>{recipe.name}</Typography></label></Box>
      <Box flex={1} px={1}>
        <TextInput
          name={`recipes[${index}].batches`}
          label="Batches"
          size="small"
          value={batches}
          onChange={ handleChangeBatches }
        /></Box>
      <Box flex={1} pl={1}><Typography>{`(${recipe.batchSize*+batches} ${recipe.batchUnit})`}</Typography></Box>
    </Box>
  );
};
