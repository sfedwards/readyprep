import { Box, Checkbox, Chip, CircularProgress, IconButton, makeStyles, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography, useTheme } from "@material-ui/core";
import React, { ReactElement, useEffect, useState } from "react";
import useSWR from "swr";

import { Button, DeleteButton, DragReorderIcon, NameInput, NewRowWave, PageHeader, TextInput, UnitInput } from "../../../UI";
import { useHistory } from "react-router";
import { Helmet } from "react-helmet";
import { Link, useParams } from "react-router-dom";
import { GetCountingListResponse } from "../../../../services/api/counting-lists/interface/get-counting-list.api.interface";
import { Add, AddCircleOutline, CheckCircleOutline, EditOutlined } from "@material-ui/icons";
import Draggable, { DraggableEventHandler } from 'react-draggable';
import { throttle } from "lodash";
import { IngredientInput } from "../../../UI/IngredientInput";
import { useTranslation } from "react-i18next";
import produce from "immer";
import { Ingredient } from "../../../../models/Ingredient";
import { Unit } from "../../../../models/Unit";
import { useCountingListsApi } from "../../../../services/api/hooks/useCountingListsApi.api.hook";
import { useSnackbar } from "notistack";
import { CountingListSummary } from "../../../../services/api/models/counting-list-summary.interface";
import { useIngredientsApi } from "../../../../services/api/hooks/useIngredientsApi.api.hook";
import { BackToLink } from "../../BackToLink";
import { UomConversionDialog } from "../../../app";

export interface CountingListPageProps {

};

const NEW_ROW_CLASSNAME = 'new-row';

const useStyles = makeStyles( theme => ({
  editButton: {
    margin: '0 0 0 16px',
    color: theme.palette.text.primary,
    cursor: 'pointer',
  },
}))

export const CountingListPage = ( _props: CountingListPageProps ): ReactElement => {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';

  const rCountingList = useSWR<GetCountingListResponse>(
    isNew ? null : `/counting-lists/${id}`,
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
    },
  );
  const rCountingLists = useSWR<CountingListSummary[]>( isNew ? null : '/counting-lists' );

  const classes = useStyles();

  const [ isEditingName, setEditingName ] = useState<boolean>( isNew );

  const [ name, setName ] = useState( '' );
  const [ items, setItems ] = useState<{
    ingredient: {
      id: number | null,
      name?: string,
      type: 'pantry' | 'prep',
    },
    unit?: string,
    movingFrom?: string;
    warning?: boolean;
  }[]>([]);

  const [
    showingConversionsForIngredientId,
    setShowingConversionsForIngredientId,
  ] = useState< number | null >( null );

  const [ isSaving, setSaving ] = useState( false );

  useEffect( () => {
    if ( rCountingList.data?.name )
      setName( rCountingList.data.name );

    if ( ! rCountingList.data?.items ) {
      setItems( [ { ingredient: { id: null, type: 'pantry' } } ] );
      return;
    }
    setItems( rCountingList.data.items );
  }, [ rCountingList.data ] );
  
  const isLoading = ! rCountingList.data && rCountingList.isValidating;

  const history = useHistory();
  const [ index, setIndex ] = useState<number|null>( null );
  const [ bulkMoveListId, setBulkMoveListId ] = useState<string|null>( null );

  const handleClickBulkMove = async () => {
    if ( ! bulkMoveListId )
      return;

    const ingredientIds = ([...document.getElementsByName( 'bulkMove[]' )] as HTMLInputElement[]).filter( x => x.checked ).map( x => +x.value );

    await countingListsApi.append(
      bulkMoveListId,
      { 
        ingredients: 
          ingredientIds.map( id => ({
            id,
            unit: items.find( item => item.ingredient.id === id )?.unit,
          }) )
      },
    );

    setBulkMoveListId( null );

    await rCountingList.mutate();

  }

  const title = `Counting List${ name ? `: ${name}` : '' }`;

  const theme = useTheme();

  const { enqueueSnackbar } = useSnackbar();

  const ingredientsApi = useIngredientsApi();
  const countingListsApi = useCountingListsApi();

  const handleClickSave = async () => {
    const hasWarning = items.find( item => !! item.warning );

    if ( hasWarning ) {
      enqueueSnackbar(
        'Could not save. Please add Required UOM conversion', 
        {
          variant: 'error',
        }
      );
      return;
    }

    const isIncomplete = items.find( item =>
      (item.ingredient.id && ! item.unit) ||
      (item.unit && ! item.ingredient.id)
    );

    if ( isIncomplete ) {
      enqueueSnackbar(
        'Could not save. Please ensure that all rows are complete', 
        {
          variant: 'error',
        }
      );
      return; 
    }


    setSaving(true);

    const data = {
      name,
      ingredients: (items
        .filter( ({ ingredient: { id }, unit }) => id && unit ) as { ingredient: { id: number }, unit: string }[])
        .map( ({ ingredient: { id }, unit }) => ({ id, unit }) ),
    };

    if ( isNew ) {
      const { body: { id } } = await countingListsApi.create( data );

      setSaving( false );
      history.replace( `/counting-list/${id}` );
      return;
    }

    await countingListsApi.save( id, data );

    setItems(
      produce( items, items => {
        items.forEach( item => delete item.movingFrom );
      } ),
    );

    setSaving( false );
    enqueueSnackbar( 'Successfully saved', { variant: 'success' } );
  };

  useEffect(() => {
    const listener = throttle( 
      (e: MouseEvent) => {
        const x = e.clientX, y = e.clientY;
        let el = document.elementFromPoint(x, y);

        if (
          el?.tagName !== 'TD' &&
          el?.tagName !== 'TH' &&
          el?.parentElement?.tagName !== 'TH'
        ) {
          let node: Element|null = el;
          while ((node = node?.parentElement ?? null)) {
            if ( node?.className === NEW_ROW_CLASSNAME )
              return;
          }
          setIndex( null );
          return;
        }

        if ( el?.tagName !== 'TD' && el?.tagName !== 'TH' )
          el = el?.parentElement!;

        const { top, bottom } = el.getBoundingClientRect();
        const { rowIndex } = el.parentElement as HTMLTableRowElement;
        const closerToLower = rowIndex === 0 || bottom - y <= y - top;

        setIndex( 
          rowIndex + 
          (closerToLower ? 1 : 0)
        );
      },
      100,
    );

    window.addEventListener('mousemove', listener);
    return () => window.removeEventListener('mousemove', listener);
  }, []);

  const [ draggingIngredient, setDraggingIngredient ] = useState<number|null>(null);

  const handleDragStart: DraggableEventHandler = (_e, { node }) => {
    const index = (node as HTMLTableRowElement).rowIndex - 1;
    const id = items[index].ingredient.id;
    setDraggingIngredient(id);
  };

  const handleDragStop: DraggableEventHandler = (_e, { node }) => {
    const previousIndex = (node as HTMLTableRowElement).rowIndex - 1;

    setDraggingIngredient(null);

    if ( index === null )
      return;

    const newIndex = Math.max(0, index - (index <= previousIndex ? 1 : 2));

    const newItems = items.slice();
    newItems.splice(previousIndex, 1);
    newItems.splice(newIndex, 0, items[previousIndex]);
    
    setItems( newItems );
  }

  const handleInsertNewRow = () => {
    const newItems = items.slice();
    newItems.splice( (index ?? 1) - 1, 0, { ingredient: { id: null, type: 'pantry' } });

    setItems( newItems );
  };

  const checkConversion = async ( ingredientId: number, unit: string ): Promise<boolean> => {
    try {
      await ingredientsApi.convert(
        ingredientId,
        {
          amount: 1,
          unit,
        },
      );

      return true;
    } catch {
      return false;
    }
  };

  const handleSelectIngredient = async (ingredient: Ingredient, row: number) => {
    if ( ! ingredient?.id )
      return;

    const { body: { list: movingFromList, unit } } = await countingListsApi.getListSummaryForIngredient( 
      ingredient.id !
    );

    const conversionTestUnit = items[row].unit ?? (unit as string);
    const warning = ! await checkConversion( ingredient.id, conversionTestUnit );

    setItems( produce( items, items => {
      items[row].ingredient.id = ingredient.id !;
      items[row].ingredient.name = ingredient.name !;
      items[row].warning = warning;
      if ( movingFromList && ! movingFromList.isDefault ) {
        items[row].movingFrom = movingFromList.name;
        items[row].unit = items[row].unit ?? unit;
      }
    }));
  };

  const handleSelectUnit = async ({ symbol }: Unit, row: number) => {
    const warning = items[row].ingredient.id
      ? ! await checkConversion( items[row].ingredient.id !, symbol )
      : false;

    setItems( produce( items, items => {
      items[row].unit = symbol;
      items[row].warning = warning;
    }))
  };

  const renderInsertRow = () => 
    <div
      className={NEW_ROW_CLASSNAME}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: -2,
        border: 'none',
        height: 4,
        width: '100%',
        background: theme.palette.primary.main,
        color: '#fff',
        zIndex: 800,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Box
        color={theme.palette.primary.main}
        position="relative"
        lineHeight={0}
        style={{
          cursor: 'pointer',
        }}
      >
        { ! draggingIngredient &&
          <>
            <NewRowWave style={{ width: 110, height: 32 }} />
            <Box
              position="absolute"
              color="#fff"
              top={0}
              left={0}
              bottom={0}
              right={0}
              width="100%"
              display="flex"
              justifyContent="center"
              alignItems="center"
              onClick={handleInsertNewRow}
            >
              <Add style={{ zIndex: 5000 }} />
            </Box>
          </>
        }
      </Box>
    </div>;

  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{ title }</title>
      </Helmet>
      <BackToLink />
      <PageHeader>
        <Box flex="shrink" display="flex" alignItems="center">
          <Box mr={8} display="flex">
            <NameInput
              value={name}
              editing={isEditingName} 
              onChange={name => {
                setName(name);
                setEditingName(false)
              }}
            />
            <IconButton onClick={() => setEditingName( true )} className={classes.editButton} aria-label="Edit Name"><EditOutlined /></IconButton>
          </Box>
          { rCountingList.data?.isDefault === false &&
            <DeleteButton onClick={() => {}} />
          }
        </Box>
        <Box ml="auto" display="flex">
          <Box mr={4}>
            <Button
              style={{ marginLeft: 'auto' }}
              startIcon={isSaving ? <CircularProgress size="1em" style={{ color: '#fff' }} /> : <CheckCircleOutline />}
              text={ isSaving ? `${t( 'strings.saving' )} ...` : t( 'strings.save' ) }
              onClick={handleClickSave}
            />
          </Box>
          <Button
            style={{ marginBottom: 0, visibility: isNew ? 'hidden': 'visible' }}
            onClick={() => history.push('/count/new', { previousTitle: document.title, listId: id })}
          >Begin New Count</Button>
        </Box>
      </PageHeader>
      { ! isNew && 
        <Box display="flex" alignItems="center">
          <Box flex={1} maxWidth={290} mr={2}>
            <TextInput 
              label="Bulk Move to"
              select
              onChange={e => { setBulkMoveListId(e.target.value) }}
              value={rCountingLists.data?.find( list => list.id === bulkMoveListId )?.name}
            >
              <MenuItem>&nbsp;</MenuItem>
              { rCountingLists.data
                  ?.filter( list => list.id !== id )
                  .map( list => 
                    <MenuItem key={list.id} value={list.id}>{list.name}</MenuItem>
                  )
              }
            </TextInput>
          </Box>
          { bulkMoveListId &&
            <Box>
              <Button
                onClick={handleClickBulkMove}
              >
                Move Selected Ingredients
              </Button>
            </Box>
          }
        </Box>
      }
      <TableContainer style={{ overflow: 'visible' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={{ width: '0.1%' }}></TableCell>
              <TableCell>
                <Typography variant="subtitle1">
                  Item
                </Typography>
              </TableCell>
              <TableCell style={{ width: '0.1%' }}></TableCell>
              <TableCell style={{ width: '300px' }}>
                <Typography variant="subtitle1">
                  Counting Unit
                </Typography>
              </TableCell>
              <TableCell style={{ width: '0.1%' }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody style={{ overflow: 'visible' }}>
            { 
              isLoading &&
                <TableRow>
                  <TableCell>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
            }
            {
              items.map( ({ ingredient, unit, movingFrom, warning }, i) => 
                <Draggable
                  key={ingredient.id ?? Math.random()}
                  axis="y"
                  handle=".handle"
                  enableUserSelectHack
                  onStart={handleDragStart}
                  onStop={handleDragStop}
                  position={
                    draggingIngredient === ingredient.id
                      ? undefined
                      : { x: 0, y: 0 }
                  }
                >
                  <TableRow style={{
                    transform: 'scale(1)',
                    position: 'relative',
                  }}>
                    {
                      bulkMoveListId 
                      ?
                        <TableCell style={{ width: '0.1%' }}>
                          { 
                            ingredient.id &&
                            <Checkbox
                              color="primary"
                              name="bulkMove[]"
                              value={ingredient.id}
                              style={{ padding: 0, width: 20, height: 20 }}
                            />
                          }
                        </TableCell>
                      :
                        <TableCell>
                          <Box 
                            style={{
                              cursor: 'pointer',
                              WebkitTapHighlightColor: 'rgba(0,0,0,0)',
                            }}
                            display="flex"
                            alignItems="center"
                            className="handle"
                            lineHeight={0}
                          >
                            <DragReorderIcon style={{ fontSize: '1em' }} />
                          </Box>
                          { index !== null && 
                            i === index - 1 &&
                            (
                              draggingIngredient === null ||
                              ingredient.id !== draggingIngredient
                            ) &&
                            renderInsertRow()
                          }
                        </TableCell>
                    }
                    <TableCell>
                      { ingredient.id
                          ? <Link to={{ pathname: `/${ingredient?.type}/${ingredient?.id}`, state: { previousTitle: document.title } }}>
                              { ingredient.name }
                            </Link>
                          : <Box minWidth={200} maxWidth={400}>
                              <IngredientInput
                                onCreate={() => {}}
                                onSelect={
                                  ingredient => handleSelectIngredient(ingredient, i)
                                }
                              />
                            </Box>
                      }
                      { movingFrom && movingFrom !== 'Other Items' &&
                        <Box display="inline" pl={2}>
                          <Tooltip title={`Moving From: ${movingFrom}`}>
                            <Chip color="primary" size="small" label="Moving" />
                          </Tooltip>
                        </Box>
                      }
                    </TableCell>
                    <TableCell>
                      { warning && 
                        <Button
                          style={{ whiteSpace: 'nowrap' }}
                          onClick={() => setShowingConversionsForIngredientId( ingredient.id )}
                        >Add Required UOM Conversion</Button>
                      }
                    </TableCell>
                    <TableCell style={{ padding: 0 }}>
                      <Box display="flex" alignItems="flex-end">
                        <IconButton><AddCircleOutline /></IconButton>
                        <Box flex={1}>
                          <UnitInput onSelect={unit => handleSelectUnit(unit, i)} size="small" value={unit} />
                          <UnitInput onSelect={unit => handleSelectUnit(unit, i)} size="small" value={unit} />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell style={{ padding: '0 16px' }}>
                      <DeleteButton onClick={() => setItems( produce( items, items => { items.splice( i, 1 ) } ) )} />
                    </TableCell>
                  </TableRow>
                </Draggable>
              )
            }
            {
              items.length + 1 === index &&
              <TableRow
                style={{
                  transform: 'scale(1)',
                  height: 60,
                  overflow: 'visible',
                  background: 'none'
                }}
              >
                <TableCell style={{ border: 'none' }}>
                  { renderInsertRow() }
                </TableCell>
              </TableRow>
            }
          </TableBody>
        </Table>
      </TableContainer>
      { 
        showingConversionsForIngredientId &&
          <UomConversionDialog
            ingredientId={showingConversionsForIngredientId}
            open={!! showingConversionsForIngredientId}
            onClose={() => setShowingConversionsForIngredientId( null )}
            onConfirm={() => setShowingConversionsForIngredientId( null )}
          />
      }
    </>
  );
  
}