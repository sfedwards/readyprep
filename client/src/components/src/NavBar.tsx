import { Avatar, Box, Menu, MenuItem, makeStyles, useTheme, useMediaQuery } from '@material-ui/core';
import { ExitToApp, QuestionAnswer, Settings } from '@material-ui/icons';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import React, { ReactElement, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import useSWR from 'swr';

import request from '../../util/request';
import { ScaleIcon } from '../UI/Icons';
import { Logo } from '../UI/Logo';

interface Props {
  fake?: boolean;
}

interface StyleProps {
  isLargeScreen: boolean;
}

const useStyles = makeStyles( () => ( {
  background: {
    background: '#fff',
  },
  container: {
    width: '100%',
    maxWidth: 1280,
    height: 78,
    margin: 'auto',
  },
  indicator: {
    height: 3,
  },
  logo: {
    height: 44,
  },
} ) );

export const NavBar = ( props: Props ): ReactElement => {
  const { t } = useTranslation();
  const theme = useTheme();
  const history = useHistory();

  const rUser = useSWR<{ name: string, email: string, photoUrl?: string }>(
    props.fake ? null : '/profile',
  );

  const user = rUser.data ?? { name: 'R P', email: '' };

  const isLargeScreen = useMediaQuery( theme.breakpoints.up( 'md' ) );
  const classes = useStyles({ isLargeScreen });
  const [ isMenuOpen, setMenuOpen ] = useState( false );

  let initials = '';
  if ( user ) {
    initials += user.name?.[0].toUpperCase() ?? '';
    const names = user.name?.split( /\s+/g ).filter( Boolean ) ?? [];
    if ( names.length > 1 )
      initials += names[ names.length - 1 ][0].toUpperCase();
  }

  const menuAnchorRef = useRef( null );

  const handleClickAvatar = ( ): void => {
    if ( props.fake ) return;
    setMenuOpen( true );
  };

  const handleMenuClose = ( e: Event ): void => {
    e.stopPropagation( );
    setMenuOpen( false );
  };

  const handleClickUomSettings = ( e: React.MouseEvent ): void => {
    e.stopPropagation( );
    setMenuOpen( false );
    history.push( '/units', { previousTitle: document.title } );
  };

  const handleClickSettings = ( e: React.MouseEvent ): void => {
    e.stopPropagation( );
    setMenuOpen( false );
    history.push( '/settings', { previousTitle: document.title } );
  };

  const handleClickFaq = ( e: React.MouseEvent ): void => {
    e.stopPropagation( );
    setMenuOpen( false );
    window.location.href = 'https://readyprep.io/faq';
  };

  const handleClickLogout = async ( e: React.MouseEvent ): Promise<void> => {
    e.stopPropagation( );
    await request.get( '/auth/logout' );
    window.location.href = '/login?logout';
  };

  return (
    <Box className={ classes.background }>
      <Box className={ classes.container } display="flex" justifyContent="space-between" alignItems="center">
        <Logo className={ classes.logo } />
        <Box>
          { ( rUser.data || ! rUser.isValidating ) &&
            <Box
              flex="flex-shrink" flexBasis="20%" px="1.5rem"
              display="flex" justifyContent="flex-end" alignItems="center"
              color="text.primary" fontSize="1.1rem" lineHeight="1.1rem"
              onClick={handleClickAvatar}
              style={{ cursor: 'pointer' }}
            >
              <Avatar alt={ user?.name } src={ user?.photoUrl }>{initials}</Avatar>
              <ArrowDropDownIcon ref={menuAnchorRef} />
              <Menu
                keepMounted
                open={ isMenuOpen }
                onClose={handleMenuClose}
                anchorEl={menuAnchorRef.current}
                elevation={24}
              >
                <MenuItem onClick={handleClickUomSettings}><ScaleIcon /><span style={{ paddingLeft: 8 }}>{t( 'elements.user-menu.unit-of-measure-settings' )}</span></MenuItem>
                <MenuItem onClick={handleClickSettings}><Settings /><span style={{ paddingLeft: 8 }}>{t( 'elements.user-menu.settings' )}</span></MenuItem>
                <MenuItem onClick={handleClickFaq}><QuestionAnswer /><span style={{ paddingLeft: 8 }}>{t( 'elements.user-menu.faq' )}</span></MenuItem>
                <MenuItem onClick={handleClickLogout}><ExitToApp /><span style={{ paddingLeft: 8 }}>{t( 'elements.user-menu.log-out' )}</span></MenuItem>
              </Menu>
            </Box>
          }
        </Box>
      </Box>
    </Box>
  );
};
