import { Box, CircularProgress, IconButton, Menu, MenuItem as MuiMenuItem, Paper, Slide, Snackbar, Table, TableBody, TableCell, TableHead, TableRow, Typography, makeStyles, useMediaQuery, useTheme } from '@material-ui/core';
import { Add, CheckCircleOutline, DeleteOutline, Edit, EditOutlined, MoreHoriz } from '@material-ui/icons';
import { Alert } from '@material-ui/lab';
import React, { ReactElement, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Prompt, useHistory, useParams } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';

import { AppContext, saveAndContinueCallbackState } from '../../../App';
import { useTemporarilyTrueState } from '../../../hooks/useTemporarilyTrueState';
import { MenuItem } from '../../../models/MenuItem';
import request from '../../../util/request';
import { trackChanges } from '../../../util/trackChanges';
import { Button } from '../../UI/Button';
import { DeleteButton } from '../../UI/DeleteButton';
import { DeleteDialog } from '../../UI/DeleteDialog';
import { NameInput } from '../../UI/NameInput';
import { SectionNameDialog } from '../../UI/SectionNameDialog';
import { BackToLink } from '../BackToLink';
import MenuItemSelector from '../MenuItemSelector';

const useStyles = makeStyles( theme => ( {
  editableName: {
    paddingLeft: 16,
    paddingRight: 16,
    cursor: 'default',
    '& br': {
      display: 'none',
    },
  },
  editButton: {
    margin: '0 0 0 16px',
    color: theme.palette.text.primary,
    cursor: 'pointer',
  },
  addItem: {
    color: theme.palette.primary.main,
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  addSection: {
    color: theme.palette.primary.main,
    cursor: 'pointer',
    padding: '8px 16px',
    display: 'flex',
    alignItems: 'center',
    fontWeight: 'bold',
  },
} ) );

export const MenuPage = ( ): ReactElement => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const history = useHistory();
  
  const [ hasChanges, setHasChanges ] = useState( false );
  
  useEffect( () => {
    if ( ! hasChanges )
      return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      return e.returnValue = 'You have unsaved changes';
    };
    window.addEventListener( 'beforeunload', handler );
    return () => window.removeEventListener( 'beforeunload', handler );
  }, [ hasChanges ] );

  const [ loading, setLoading ] = useTemporarilyTrueState( true );
  const [ saving, setSaving ] = useTemporarilyTrueState( false );
  const [ success, setSuccess ] = useState( '' );
  const [ error, setError ] = useState( '' );
  const [ showingAlert, setShowingAlert ] = useState( false );

  const [ name, setName ] = trackChanges( useState<string>( '' ), setHasChanges );
  const [ sections, setSections ] = trackChanges( useState<any[]>( [] ), setHasChanges );

  const [ showingMenuItemSelectorForSection, setShowingMenuItemSelectorForSection ] = useState<number|null>( null );
  const [ showingSectionOptionsForSection, setShowingSectionOptionsForSection ] = useState<number|null>( null );
  const [ showingSectionNameDialogForSection, setShowingSectionNameDialogForSection ] = useState<number|null>( null );
  const [ showingDeleteDialog, setShowingDeleteDialog ] = useState( false );
  const [ excludedItems, setExcludedItems ] = useState<number[]>( [] );

  const [ editingName, setEditingName ] = useState( false );

  const theme = useTheme();
  const classes = useStyles( theme );
  const isLargeScreen = useMediaQuery( theme.breakpoints.up( 'md' ) );

  const sectionOptionsMenuAnchorRef = useRef<HTMLElement>();
  const menuItemSelectorAnchorRef = useRef<HTMLElement>();

  const defaultErrorMessage = t( 'elements.menus.error-loading' );

  const { handlePlanUpgradeRequired } = useContext( AppContext );

  useEffect( () => {
    if ( !( error || success ) )
      return;
    setShowingAlert( true );
    const timer = setTimeout( () => {
      setShowingAlert( false );
    }, 4000 );
    return () => clearTimeout( timer );
  }, [ !!( error || success ) ] );

  useEffect( () => {
    ( async () => {
      try {
        if ( id === 'new' ) {
          setEditingName( true );
          setName( '' );
          handleClickEditName();
          setSections( [ { name: '', items: [] } ] );
          setLoading( false );
          setHasChanges( false );
          document.title = 'New Menu';
          return;
        }
        
        const { body: menu } = await request.get( `/menus/${id}` );

        if ( ! menu )
          return;

        const {
          name,
          sections,
        } = menu;

        setError( '' );
        setName( name );
        setSections( sections );
        document.title = name;
      } catch ( err: any ) {
        setError( err.message || defaultErrorMessage );
      }
      setLoading( false );
      setHasChanges( false );
    } )();
    
  }, [ id, defaultErrorMessage, loading ] );

  const handleClickEditName = (): void => {
    setEditingName( true );
  };

  const handleClickDelete = (): void => {
    setShowingDeleteDialog( true );
  };

  const handleSave = async (): Promise<void> => {
    setSaving( true );
    
    const body = {
      name,
      sections: sections.map( section => {
        return {
          name: section.name,
          items: section.items.map( ( item: MenuItem ) => item.id ),
        };
      } ),
    };
    
    try {
      if ( id === 'new' ) {
        const { body: res } = await request.post( '/menus', { body } );
        setSuccess( t( 'strings.successfully-created' ) );
        setHasChanges( false );
        history.replace( `/menus/${res.id}`, { previousTitle: document.title } );
      } else {
        await request.patch( `/menus/${id}`, { body } );
        setError( '' );
        setSuccess( t( 'strings.successfully-saved-changes' ) );
        setLoading( true );
      }
    } catch ( err: any ) {
      if ( err.message === 'PLAN_UPGRADE_REQUIRED' )
        handlePlanUpgradeRequired( err.plan );
      else
        setError( `Problem saving: ${err.message || defaultErrorMessage}` );
      
    }
    setSaving( false );
  };

  const setSaveAndContinueCallback  = useSetRecoilState( saveAndContinueCallbackState );
  setSaveAndContinueCallback( () => handleSave );

  const handleNameChange = ( newName: string ): void => {
    setEditingName( false );
    setName( newName );
  };

  const handleConfirmDelete = async ( ): Promise<void> => {
    await request.delete( `/menus/${id}` );
    history.push( '/menus', { previousTitle: document.title } );
  };

  const handleSelectMenuItem = async ( { id, name }: MenuItem ): Promise<void> => {
    const { body: item } = await request.get( `/items/${id}` );
    const cost = item.ingredients.reduce( ( sum: number, ingredient: ( { cost: number } ) ) => sum + ingredient.cost, 0 );
    
    const newRow = { id, name, price: item.price, cost };

    setSections( [
      ...sections.map( ( section, i: number ) => {
        const items = [ ...section.items ];

        if ( i === showingMenuItemSelectorForSection )
          items.push( newRow );

        return {
          name: section.name,
          items,
        };
      } ),
    ] );

    setShowingMenuItemSelectorForSection( null );
  };

  const handleDeleteItem = ( sectionIndex: number, itemIndex: number ): void => {
    setSections( [
      ...sections.map( ( section, i: number ) => {
        const items = [ ...section.items ];

        if ( i === sectionIndex )
          items.splice( itemIndex, 1 );

        return {
          name: section.name,
          items,
        };
      } ),
    ] );
  };

  const handleSectionNameChange = ( name: string ): void => {
    const newSections = [
      ...sections.map( ( section, i: number ) => {
        const items = [ ...section.items ];

        return {
          name: i === showingSectionNameDialogForSection ? name : section.name,
          items,
        };
      } ),
    ];

    if ( showingSectionNameDialogForSection === sections.length )
      newSections.push( { name, items: [] } );

    setSections( newSections );
    setShowingSectionNameDialogForSection( null );
  };

  const handleCloseSectionOptions = (): void => {
    setShowingSectionOptionsForSection( null );
  };

  const handleDeleteSection = ( ): void => {
    const newSections = [ ...sections ];
    if ( showingSectionOptionsForSection != null )
      newSections.splice( showingSectionOptionsForSection, 1 );
    setSections( newSections );
    setShowingSectionOptionsForSection( null );
  };

  return (
    <>
      <Prompt message={t( 'strings.unsaved-changes-warning' )} when={hasChanges} />

      { isLargeScreen && <BackToLink /> }

      <Box pb={2} display="flex" alignItems="center">
        { /* Enough height for loading spinner + vertical padding */ }
        <Box minHeight={56} maxWidth="100%" flex={1} px={2} pb={1} display="flex" flexWrap="wrap" alignItems="center">
          <Box maxWidth={ isLargeScreen ? '80%' : '100%' } mr={4} display="flex" alignItems="center">
            <NameInput value={name} editing={editingName} onChange={handleNameChange} />
            <IconButton onClick={handleClickEditName} className={classes.editButton} aria-label="Edit Name"><EditOutlined /></IconButton>
          </Box>
          { id !== 'new' && <DeleteButton onClick={handleClickDelete} /> }
          { loading && ! saving && <CircularProgress /> }
          <Button
            tabIndex={1}
            style={{ marginLeft: 'auto' }}
            startIcon={saving ? <CircularProgress size="1em" style={{ color: '#fff' }} /> : <CheckCircleOutline />}
            text={ saving ? `${t( 'strings.saving' )} ...` : t( 'strings.save' ) }
            onClick={handleSave}
          />
        </Box>
      </Box>

      <Box px={1}>
        { sections.map( ( section, i ) => {
          return (
            <Box mb={2}>
              <Paper elevation={0}>
                { section.name !== '' &&
                  <Box p={2}>
                    <Box display="flex" justifyContent="space-between" p={1}>
                      <Typography variant="h2" color="primary">{section.name}</Typography>
                      <Box textAlign="right" onClick={ ( e: any ) => {
                        sectionOptionsMenuAnchorRef.current = e.target; setShowingSectionOptionsForSection( i );
                      } }>
                        <MoreHoriz />
                      </Box>
                    </Box>
                  </Box>
                }
                { section.items && section.items.length > 0 &&
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <Typography variant="subtitle1">{ t( 'strings.name' ) }</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle1">{ t( 'strings.price' ) }</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle1">{ t( 'strings.food-cost' ) }</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle1">{ t( 'strings.profit' ) }</Typography>
                        </TableCell>
                        <TableCell>
                          { section.name === '' &&
                              <Box textAlign="right" onClick={ ( e: any ) => {
                                sectionOptionsMenuAnchorRef.current = e.target; setShowingSectionOptionsForSection( i );
                              } }>
                                <MoreHoriz />
                              </Box>
                          }
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      { section.items.map( ( item: MenuItem, j: number ) =>
                        <TableRow>
                          <TableCell><Link to={`/items/${item.id}`}>{item.name}</Link></TableCell>
                          <TableCell>{item.price != null ? `$${item.price}` : '\u00a0--\u00a0' }</TableCell>
                          <TableCell>{item.cost != null ? `$${item.cost.toFixed( 2 ).replace( /\.0*$/, '' )}` : '\u00a0--\u00a0' }</TableCell>
                          <TableCell>{ item.price != null && item.cost != null ? `$${( item.price - item.cost ).toFixed( 2 ).replace( /\.0*$/, '' )}` : '\u00a0--\u00a0' }</TableCell>
                          <TableCell>
                            <Box textAlign="right">
                              <DeleteButton mild={true} onClick={ () => handleDeleteItem( i, j ) } />
                            </Box>
                          </TableCell>
                        </TableRow>
                      ) }
                    </TableBody>
                  </Table>
                }
                <Box p={2} display="flex">
                  <Box flex={1} display="flex" justifyContent="center" alignItems="center">
                    <div className={classes.addSection} onClick={
                      ( e: any ) => {
                        menuItemSelectorAnchorRef.current = e.target;
                        setShowingMenuItemSelectorForSection( i );
                        setExcludedItems( section.items.map( ( item: MenuItem ) => item.id ) );
                      }
                    }>
                      <Add />{t( 'strings.add-menu-item' )}
                    </div>
                  </Box>
                  { section.name === '' && ( ! section.items || section.items.length === 0 ) &&
                      <Box alignSelf="flex-end" textAlign="right" onClick={ ( e: any ) => {
                        sectionOptionsMenuAnchorRef.current = e.target; setShowingSectionOptionsForSection( i );
                      } }>
                        <Typography><MoreHoriz /></Typography>
                      </Box>
                  }
                </Box>
              </Paper>
            </Box>
          );
        } ) }
      </Box>
          
      <Box p={2} display="flex" justifyContent="flex-start" alignItems="center">
        <Paper className={classes.addSection} onClick={ () => setShowingSectionNameDialogForSection( sections.length ) }>
          <Add />{t( 'strings.add-menu-section' )}
        </Paper>
      </Box>
      <MenuItemSelector
        excludedItems={ excludedItems }
        onSelect={ handleSelectMenuItem }
        onClose={ () => setShowingMenuItemSelectorForSection( null ) }
        anchorEl={ menuItemSelectorAnchorRef.current as HTMLElement }
        showing={ showingMenuItemSelectorForSection != null }
      />
      <DeleteDialog itemName={t( 'strings.menu_plural' )} showing={showingDeleteDialog} onClose={() => setShowingDeleteDialog( false )} onConfirm={ handleConfirmDelete } />
      <SectionNameDialog name={ sections[ showingSectionNameDialogForSection ?? -1 ]?.name } showing={ showingSectionNameDialogForSection != null } onConfirm={ handleSectionNameChange } onClose={ () => setShowingSectionNameDialogForSection( null ) } />
      <Menu
        id="simple-menu"
        keepMounted
        open={ showingSectionOptionsForSection != null }
        onClose={ handleCloseSectionOptions }
        anchorEl={ sectionOptionsMenuAnchorRef.current }
      >
        <MuiMenuItem onClick={ () => {
          setShowingSectionNameDialogForSection( showingSectionOptionsForSection ); setShowingSectionOptionsForSection( null );
        } }><Edit /><span style={{ paddingLeft: 8 }}>{t( 'strings.rename-section' )}</span></MuiMenuItem>
        <MuiMenuItem onClick={ handleDeleteSection }><DeleteOutline /><span style={{ paddingLeft: 8 }}>{t( 'strings.delete' )}</span></MuiMenuItem>
      </Menu>
      <Snackbar
        open={ showingAlert }
        onExited={ () => {
          setError( '' ); setSuccess( '' );
        } }
        TransitionComponent={useCallback( props => <Slide direction="down" {...props} />, [] )}
      >
        <Alert variant="filled" severity={ error ? 'error' : 'success' }>{ error || success }</Alert>
      </Snackbar>
    </>
  );
};

