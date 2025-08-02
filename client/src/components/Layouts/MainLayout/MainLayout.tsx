import { AccountTreeRounded, Assignment, Build, ChevronLeft, Help, Menu, MenuBook, People, RestaurantMenu, Settings, ShoppingBasket, Store } from '@material-ui/icons';
import { Box, ClickAwayListener, Container, Divider, Drawer, List, ListItem, ListItemIcon, ListItemText, SwipeableDrawer, makeStyles, useMediaQuery, useTheme } from '@material-ui/core';
import React, { useState } from 'react';

import { useLocation } from 'react-router';
import { Link } from 'react-router-dom';
import { NavBar } from '../../src/NavBar';
import clsx from 'clsx';
import useResizeObserver from 'use-resize-observer';
import { DeliveryTruckIcon } from '../../UI';

const drawerWidth = 280;

interface StyleProps {
  isDrawerOpen: boolean;
  hideMiniDrawer: boolean;
}

const useStyles = makeStyles( theme => ( {
  drawer: {
    width: drawerWidth,
    maxWidth: '90vw',
    flexShrink: 0,
    whiteSpace: 'nowrap',
    '& .MuiDrawer-paper': {
      background: ( { isDrawerOpen, hideMiniDrawer }: StyleProps ) => ! isDrawerOpen && hideMiniDrawer ? 'none' : '#fff',
      border: 'none',
      height: ( { hideMiniDrawer }: StyleProps ) => hideMiniDrawer ? 'auto' : '100%',
    },
    '& .toggle': {
      background: '#fff',
      borderRight: '1.11px solid #ddd',
    },
    '& .menu': {
      minHeight: 'calc(100% - 78px)',
      borderRight: '1.11px solid #ddd',
    },
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create( 'width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    } ),
  },
  drawerClose: {
    transition: theme.transitions.create( 'width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    } ),
    overflow: 'hidden',
    width: 60,
    '& .menu': {
      display: ( { hideMiniDrawer }: StyleProps ) => hideMiniDrawer ? 'none' : '',
    },
  },
  container: {
    marginLeft: ( { hideMiniDrawer }: StyleProps ) => hideMiniDrawer ? 0 : 60,
  },
} ) );


export const MainLayout: React.FC = ( { children } ) => {
  const [ isDrawerOpen, setDrawerOpen ] = useState( false );

  const { ref: resizeRef } = useResizeObserver<HTMLDivElement>();

  const theme = useTheme();
  const isSmallScreen = useMediaQuery( theme.breakpoints.down( 'sm' ) );
  const isLandscape = isSmallScreen && window.innerWidth > window.innerHeight;

  const location = useLocation();

  const isFullWidthPage = location.pathname === '/orders/new';

  const classes = useStyles( {
    hideMiniDrawer: isSmallScreen,
    isDrawerOpen,
  } );

  const drawerContent = (
    <Box minHeight="100vh">
      { ( ! isSmallScreen || isDrawerOpen ) &&
        <Box
          className="toggle"
          height={78}
          display="flex"
          justifyContent="center"
          alignItems="center"
          style={{
            cursor: 'pointer',
          }}
          onClick={() => setDrawerOpen( ! isDrawerOpen )}
        >
          { isDrawerOpen
            ? <ChevronLeft />
            : <Menu />
          }
        </Box>
      }
      <Box className="menu">
        <Divider />
        <List>
          <Link to="/pantry" onClick={() => setDrawerOpen( false ) }>
            <ListItem button>
              <ListItemIcon><Store /></ListItemIcon>
              <ListItemText primary="Pantry" />
            </ListItem>
          </Link>
{ /*          
          <Link to="/pantry/log" onClick={() => setDrawerOpen( false ) }>
            <ListItem button>
              <ListItemIcon><LibraryBooks /></ListItemIcon>
              <ListItemText primary="Pantry Log" />
            </ListItem>
          </Link>
          <Link to="/counts" onClick={() => setDrawerOpen( false ) }>
            <ListItem button>
              <ListItemIcon><Input /></ListItemIcon>
              <ListItemText primary="Inventory Counts" />
            </ListItem>
          </Link>
          <Link to="/counting-lists" onClick={() => setDrawerOpen( false ) }>
            <ListItem button>
              <ListItemIcon><VisibleListIcon /></ListItemIcon>
              <ListItemText primary="Counting Lists" />
            </ListItem>
          </Link>
*/ }        
        </List>
        <Divider />
        <List>
          <Link to="/vendors" onClick={() => setDrawerOpen( false ) }>
            <ListItem button>
              <ListItemIcon><People /></ListItemIcon>
              <ListItemText primary="Vendors" />
            </ListItem>
          </Link>
          <Link to="/orders" onClick={() => setDrawerOpen( false ) }>
            <ListItem button>
              <ListItemIcon><ShoppingBasket /></ListItemIcon>
              <ListItemText primary="Orders" />
            </ListItem>
          </Link>
          <Link to="/invoices" onClick={() => setDrawerOpen( false ) }>
            <ListItem button>
              <ListItemIcon><DeliveryTruckIcon /></ListItemIcon>
              <ListItemText primary="Receiving" />
            </ListItem>
          </Link>
        </List>
        <Divider />
        <List>
          <Link to="/prep" onClick={() => setDrawerOpen( false ) }>
            <ListItem button>
              <ListItemIcon><Build /></ListItemIcon>
              <ListItemText primary="Prep" />
            </ListItem>
          </Link>
          <Link to="/prep/log" onClick={() => setDrawerOpen( false ) }>
            <ListItem button>
              <ListItemIcon><Assignment /></ListItemIcon>
              <ListItemText primary="Prep Log" />
            </ListItem>
          </Link>
        </List>
        <Divider />
        <List>
          <Link to="/items" onClick={() => setDrawerOpen( false ) }>
            <ListItem button>
              <ListItemIcon><RestaurantMenu /></ListItemIcon>
              <ListItemText primary="Menu Items" />
            </ListItem>
          </Link>
          <Link to="/pos/associations" onClick={() => setDrawerOpen( false ) }>
            <ListItem button>
              <ListItemIcon><AccountTreeRounded /></ListItemIcon>
              <ListItemText primary="POS Mapping" />
            </ListItem>
          </Link>
        </List>
        <Divider />
        <List>
          <Link to="/menus" onClick={() => setDrawerOpen( false ) }>
            <ListItem button>
              <ListItemIcon><MenuBook /></ListItemIcon>
              <ListItemText primary="Menus" />
            </ListItem>
          </Link>
        </List>
        <Divider />
        <List>
          <Link to="/settings" onClick={() => setDrawerOpen( false ) }>
            <ListItem button>
              <ListItemIcon><Settings /></ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItem>
          </Link>
          <a href="https://readyprep.io/faq" target="_blank" onClick={() => setDrawerOpen( false ) } rel="noreferrer">
            <ListItem button>
              <ListItemIcon><Help /></ListItemIcon>
              <ListItemText primary="FAQ" />
            </ListItem>
          </a>
        </List>
        <Divider />
      </Box>
    </Box>
  );
  
  return (
    <div ref={resizeRef}>
      <ClickAwayListener onClickAway={() => setDrawerOpen( false )}>
        <>
          <Drawer
            variant="permanent"
            keepMounted
            open={isDrawerOpen}
            className={clsx( classes.drawer, classes.drawerClose )}
            classes={{
              paper: clsx( classes.drawer, classes.drawerClose ),
            }}
            style={{
              pointerEvents: isSmallScreen && ! isDrawerOpen ? 'none' : 'all',
            }}
          >
            { drawerContent }
          </Drawer>
          <SwipeableDrawer
            keepMounted
            disableDiscovery
            open={isDrawerOpen}
            onOpen={() => setDrawerOpen( true )}
            onClose={() => setDrawerOpen( false )}
            className={clsx( classes.drawer, {
              [classes.drawerOpen]: isDrawerOpen,
              [classes.drawerClose]: ! isDrawerOpen,
            } )}
            classes={{
              paper: clsx( {
                [classes.drawerOpen]: isDrawerOpen,
                [classes.drawerClose]: ! isDrawerOpen,
              } ),
            }}
          >
            { drawerContent }
          </SwipeableDrawer>
        </>
      </ClickAwayListener>
      <Box className={classes.container} display="flex" flexDirection="column" style={{ minHeight: '100vh' }}>
        <Box flex={'0 1 calc(88vh)'} pb={2}>
          <Box display="flex" alignItems="center" lineHeight={0} style={{ background: '#fff'}}>
            { isSmallScreen && 
              <Box
                className="toggle"
                height={78}
                width={78}
                display="flex"
                justifyContent="center"
                alignItems="center"
                style={{
                  cursor: 'pointer',
                }}
                onClick={() => setDrawerOpen( ! isDrawerOpen )}
              >
                { isDrawerOpen
                  ? <ChevronLeft />
                  : <Menu color="primary" />
                }
              </Box>
            }
            <Box flex={1}>
              <NavBar />
            </Box>
          </Box>
          {
            isFullWidthPage || isSmallScreen
            ? children
            :
              <Container maxWidth="lg" disableGutters>
                { children! }
              </Container>
          }
        </Box>
      </Box>
    </div>
  );
};
