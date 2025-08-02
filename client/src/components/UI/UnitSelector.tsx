import { Box, ButtonGroup, Divider, List, ListItem, Button as MuiButton, Popover, Typography, makeStyles, useTheme } from '@material-ui/core';
import { Add } from '@material-ui/icons';
import React, { ReactElement, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Types, Unit } from '../../models/Unit';
import { Button } from './Button';
import { EditUnitDialog } from './EditUnitDialog';
import { SearchInput } from './SearchInput';

export interface UnitSelectorProps {
  units: Unit[];
  allowedTypes?: Types[];
  showing: boolean;
  onSelect: ( unit: Unit ) => void;
  onClose: ( ) => void;
  onCreateNewUnit: ( symbol: Unit['symbol'], type: Unit['type'] ) => void;
  anchorEl: HTMLElement|null;
  initialQuery: string;
}

const useStyles = makeStyles( theme => ( {
  root: {
    '& .MuiPaper-rounded': {
      borderRadius: 8,
    },
  },
  description: {
    fontSize: '0.9rem',
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
      background: theme.palette.hover.main,
      cursor: 'pointer',
    },
  },
} ) );

export const UnitSelector = ( props: UnitSelectorProps ): ReactElement => {
  const classes = useStyles();
  const { t } = useTranslation();

  const allowedTypes = props.allowedTypes || [ Types.WEIGHT, Types.VOLUME, Types.PURE ];
  const { showing, units } = props;
  const [ query, setQuery ] = useState( '' );
  const [ selected, setSelected ] = useState( () =>
    allowedTypes?.find( type =>
      units.some( unit => unit.type === type )
    ) || allowedTypes[0]
  );

  const [ showingCreateUnitDialog, setShowingCreateUnitDialog ] = useState( false );

  const theme = useTheme();

  useEffect( () => {
    if ( ! showing )
      return;
      
    setQuery( props.initialQuery );
    if ( units.some( ( { type } ) => type === selected ) )
      return;
    setSelected(
      allowedTypes?.find( type =>
        units.some( unit => unit.type === type )
      ) || allowedTypes[0]
    );
  }, [ showing, units, props.allowedTypes, setQuery, setSelected ] );

  const handleSelectUnit = ( symbol: Unit['symbol'] ): void => {
    const selectedUnit: Unit|undefined = units.find( unit => symbol === unit.symbol );
    if ( ! selectedUnit )
      return;
    props.onSelect( selectedUnit );
  };

  return (
    <>
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
        onClose={ () => {
          setQuery( '' ); props.onClose();
        } }
        className={classes.root}
      >
        <Box minHeight={350} display="flex" flexDirection="column" alignItems="stretch">
          <Box mx="auto" my={1} maxWidth="80%" textAlign="center">
            <Typography variant="body2" className={classes.description}>Type to create a new UOM<br />or select an existing one</Typography>
          </Box>
          <Box mx={2} my={1}>
            <SearchInput value={query} onChange={ ( query: string ) => setQuery( query ) } onSubmit={() => {}} autoFocus />
          </Box>
          { ! query &&
            <Box mx={2} my={1}>
              <ButtonGroup className={classes.buttons} aria-label="outlined primary button group" fullWidth>
                {
                  allowedTypes.filter( type => units.some( unit => unit.type === type ) ).map( type =>
                    <MuiButton key={type} className={selected === type ? classes.selected : ''} onClick={() => setSelected( type )}>{t( `strings.${type}` )}</MuiButton>
                  )
                }
              </ButtonGroup>
            </Box>
          }
          <Box my={1}>
            <List className={classes.list}>
              {
                units && (
                  query
                    ? units
                      .filter( ( unit: Unit ) =>
                        (
                          ! query ||
                          unit.name.toLowerCase().includes( query.toLowerCase() ) ||
                          unit.symbol.toLowerCase().includes( query.toLowerCase() )
                        )
                      )
                      .sort( ( a: Unit, b: Unit ) => {
                        if ( ! query ) return 0;
                        const aScore = getQueryScore( query, a );
                        const bScore = getQueryScore( query, b );
                        return bScore - aScore;
                      } )
                    : units.filter( ( unit: Unit ) => unit.type === selected )
                ).flatMap( ( unit: Unit ) => [
                  <ListItem
                    key={unit.type + '::::' + unit.symbol}
                    tabIndex={0}
                    onClick={ () => handleSelectUnit( unit.symbol ) }
                    onKeyPress={ ( e:React.KeyboardEvent ) => ( e.key === 'Enter' || e.key === ' ' ) && handleSelectUnit( unit.symbol ) }
                    style={{ color: theme.palette.primaryGray.main }}
                  >
                    {
                      unit.name !== unit.symbol
                        ? `${unit.name} (${unit.symbol})`
                        : unit.name
                    }
                  </ListItem>,
                  <Divider />,
                ] )
                  .slice( 0, -1 )
              }
            </List>
          </Box>
        </Box>
        <Box mt="auto" mb={3} display="flex" justifyContent="center">
          <Button
            startIcon={<Add />}
            text="Create"
            onClick={() => setShowingCreateUnitDialog( true )}
          />
        </Box>
      </Popover>
      <EditUnitDialog showing={ showingCreateUnitDialog } unit={{ name: query, symbol: query, wellDefined: false }} onClose={ () => {
        setShowingCreateUnitDialog( false );
      } } onConfirm={ ( unit: Unit ) => {
        setShowingCreateUnitDialog( false ); props.onCreateNewUnit?.( unit.symbol, unit.type );
      } } />
    </>
  );
};

const getQueryScore = ( query: string, unit: Unit ): number => {
  const lowerQuery = query.toLowerCase();
  let score = 0;
  if ( lowerQuery === unit.name.toLowerCase() || lowerQuery === unit.symbol.toLowerCase() )
    score += 100;
  if ( unit.name.toLowerCase().indexOf( lowerQuery ) === 0 )
    score += 20;
  if ( unit.name.toLowerCase().split( /\b/g ).includes( lowerQuery ) )
    score += 2;
  return score;
};
