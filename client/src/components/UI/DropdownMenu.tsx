import { Box, ClickAwayListener, Collapse, Grow, MenuList, Paper, Popover, Popper, PopperProps, makeStyles } from '@material-ui/core';
import React, { useEffect, useState } from 'react';

export interface DropdownMenuProps {
  anchorEl?: Element|null;
  onClose: () => void;
  PopperProps?: Partial<PopperProps>;
}

const useStyles = makeStyles( {
  popover: {
    pointerEvents: 'none',
  },
} );

export const DropdownMenu: React.FC<DropdownMenuProps> = props => {
  const { anchorEl, children, onClose: handleClose } = props;
  const open = !! anchorEl;

  const [ closing, setClosing ] = useState( false );

  useEffect( () => {
    if ( ! open || ! closing )
      return;
    const timer = setTimeout( handleClose, 200 );
    return () => clearTimeout( timer );
  }, [ open, closing ] );

  const classes = useStyles();

  return (
    <Popover
      open={ open }
      anchorEl={ anchorEl }
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      classes={{ root: classes.popover }}
      PaperProps={{ elevation: 0, style: { background: 'none' } }}
    >
      <Collapse appear={true} in={open} timeout={300} collapsedHeight={30}>
        <Box
          p={1}
          style={{ pointerEvents: 'all' }}
          onMouseOver={ () => setClosing( false ) }
          onMouseOut={ () => setClosing( true ) }
        >
          <Box style={{ height: 45, opacity: 0, background: '#ffffff00' }}>{'\u00a0'}</Box>
          <Paper elevation={2} style={{ pointerEvents: 'all' }}>
            <MenuList autoFocusItem={open}>
              { children }
            </MenuList>
          </Paper>
        </Box>
      </Collapse>
    </Popover>
  );
};

export default DropdownMenu;
