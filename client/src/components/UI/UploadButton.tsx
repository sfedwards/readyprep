import { Menu, MenuItem } from '@material-ui/core';
import { Assignment, Publish } from '@material-ui/icons';
import React, { ReactElement, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import request from '../../util/request';
import { Button, ButtonProps } from './Button';

type Props = ButtonProps & {
  name?: string;
  onUploadStarted?: ( ) => void;
  onUploadFinished?: ( ) => void;
  onClickDownload?: ( ) => void;
};

export const UploadButton = ( props: Props ): ReactElement => {
  const { t } = useTranslation();
  const [ isMenuOpen, setMenuOpen ] = useState( false );

  const { onUploadStarted, ...buttonProps } = props;
  const inputElRef = useRef( null as HTMLInputElement|null );
  const menuAnchorRef = useRef( null );

  const handleFileSelect = async ( e: React.ChangeEvent ): Promise<void> => {
    const files = ( e.currentTarget as HTMLInputElement ).files;
    if ( ! files?.length )
      return;

    const formData = ( new FormData() );
    formData.append( 'file', files[0] );

    if ( inputElRef.current )
      inputElRef.current.value = '';
    setMenuOpen( false );

    props.onUploadStarted?.( );
    await fetch(
      '/api/import',
      {
        method: 'POST',
        body: formData,
      }
    );
    props.onUploadFinished?.( );
  };
  
  const handleMenuClose = ( e: Event ): void => {
    e.stopPropagation( );
    setMenuOpen( false );
  };

  const handleClickDownload = async ( ): Promise<void> => {
    setMenuOpen( false );

    const { res } = await request.get( '/export', { parseBody: false } );
    const blob = await res.blob();
    const url = URL.createObjectURL( blob );

    const anchor = document.createElement( 'a' );
    anchor.style.display = 'none';
    anchor.href = url;
    anchor.download = 'ReadyPrep.xlsx';
    document.body.appendChild( anchor );
    anchor.click();
    anchor.remove();

    props.onClickDownload?.();
  };

  return (
    <div style={{ flex: 1, display: 'flex' }} ref={ menuAnchorRef }>
      <Button
        startIcon={<Publish />}
        text={t( 'strings.import' ) + ' ' + ( props.name ?? '' ) }
        style={{ flex: 1 }}
        {...buttonProps}
        onClick={() => setMenuOpen( true )}
      />
      <input
        accept="text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        id="contained-button-file"
        multiple
        type="file"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
        ref={inputElRef}
      />
      <Menu
        id="simple-menu"
        keepMounted
        open={ isMenuOpen }
        onClose={ handleMenuClose }
        anchorEl={ menuAnchorRef.current }
      >
        <label
          htmlFor="contained-button-file"
          style={{ flex: 1, display: 'flex' }}
        >
          <MenuItem style={{ flex: 1 }}><Publish /><span style={{ paddingLeft: 8 }}>{t( 'elements.upload-menu.upload' )}</span></MenuItem>
        </label>
        <MenuItem onClick={ handleClickDownload }><Assignment /><span style={{ paddingLeft: 8 }}>{t( 'elements.upload-menu.download-template' )}</span></MenuItem>
      </Menu>
    </div>
  );

};
