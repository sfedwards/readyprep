import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { Typography, makeStyles } from '@material-ui/core';

import ContentEditable from 'react-contenteditable';
import { placeCursorAtEnd } from '../../util/placeCursorAtEnd';

interface NameInputProps {
  value: string|null|undefined,
  error?: boolean,
  editing: boolean,
  onChange: ( newValue: string ) => void
}

interface StyleProps {
  isNew: boolean;
  error: boolean;
}

const useStyles = makeStyles( theme => ( {
  root: ( { error }: StyleProps ) => ({
    minWidth: 100,
    maxWidth: '100%',
    overflow: 'visible',
    padding: 0,
    color: error ? theme.palette.error.main : theme.palette.primaryText.main,
    '& sup': {
      fontSize: '0.36em',
    }
  }),
  editable: ( { isNew }: StyleProps ) => ( {
    display: 'inline',
    outlineColor: theme.palette.primary.main,
    paddingRight: 16,
    paddingLeft: 16,
    marginLeft: isNew ? 16 : 0,
    minWidth: 0,
    maxWidth: '100%',
    overflow: 'hidden',
    cursor: 'default',
    '& br': {
      display: 'none',
    },
  } ),
} ) );

export const NameInput = ( props: NameInputProps ): ReactElement => {
  const contentRef = useRef( null as any );
  const elRef = useRef( null as HTMLElement|null );

  const [ , setState ] = useState( {} );
  const forceRender = (): void => setState( {} );
  const [ isNew, setIsNew ] = useState( false );
  const { editing, value, error = false } = props;
  
  const classes = useStyles( { isNew, error } );
  
  useEffect( () => {
    setTimeout( () => {
      const el = elRef.current;
      if ( ! el )
        return;
      setIsNew( el.textContent?.trim() === '' );
      if ( ! editing )
        return;
      el.focus();
      placeCursorAtEnd( el );
    }, 0 );
  }, [ editing, value ] );

  useEffect( () => {
    contentRef.current = value;
    forceRender();
  }, [ elRef, value ] );

  const handleChange = ( e: any ): void => {
    const tmp = document.createElement( 'span' );
    tmp.innerHTML = e.target.value;
    contentRef.current = tmp.textContent?.trim().replace( /\u00a0+/g, ' ' );
  };

  const handleBlur = ( ): void => {
    props.onChange( contentRef.current );
  };

  const handleKeyUp = ( e: React.KeyboardEvent ): void => {
    if ( e.key === 'Enter' )
      elRef.current?.blur?.();
  };

  return (
    <Typography variant="h3" noWrap className={classes.root}>
      <span>{ isNew && 'Name:' }</span>
      { error && <sup>*required</sup> }
      { contentRef.current !== null && contentRef.current !== undefined
        ? <ContentEditable
          innerRef={ elRef }
          disabled={ ! props.editing }
          html={ contentRef.current }
          onChange={ handleChange }
          onBlur={ handleBlur }
          onKeyUp={ handleKeyUp }
          className={ classes.editable }
        />
        : '\u00a0'
      }
    </Typography>
  );
};
