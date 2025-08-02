import React, { useRef, useState } from 'react';
import { Selector, TextInput } from '../../UI';

import { ListVendorsResponse } from '../../../services/api/vendors';
import { MenuItem } from '@material-ui/core';
import { ReactElement } from 'react';
import { Vendor } from '../../../services/api/models/vendor.api.model';
import log from 'loglevel';
import stringScore from 'string-score';
import useSWR from 'swr';

export interface VendorSelectorProps {
  onSelect?: ( vendor: Vendor ) => void;
  onCreate?: ( vendor: Partial<Vendor> ) => void;
  name: string;
  value?: Vendor;
}

export const VendorSelector = ( props: VendorSelectorProps ): ReactElement => {
  const rVendors = useSWR<ListVendorsResponse>( '/vendors' );

  const [ isOpen, setOpen ] = useState( false );
  const [ query, setQuery ] = useState( '' );
  const [ initialQuery, setInitialQuery ] = useState( '' );
  const anchor = useRef<HTMLDivElement>(null);

  const handleQueryChange = ( query: string ) => {
    setQuery( query );
  }

  const handleClickCreate = ( vendor: Partial<Vendor> ) => {
    props.onCreate?.( vendor );
  };

  const handleSelect = ( vendor: Vendor ) => {
    setOpen(false);
    props.onSelect?.( vendor );
  }

  const vendors = rVendors.data?.vendors
    .map( vendor => {
      const score = ! query 
        ? 1 
        : Math.max( stringScore( query, vendor.name, 0.5 ), stringScore( vendor.name, query, 0.5 ) )*
          Math.max( query.length, vendor.name.length )/Math.min( query.length, vendor.name.length )
      ;
      log.debug( vendor.name, score, stringScore( query, vendor.name, 0.5 ), stringScore( vendor.name, query, 0.5 ) );
      return { vendor, score };
    })
    .filter( ({ score }) => score > 0.5 )
    .sort( (a,b) => b.score - a.score )
    .map( ({ vendor }) => vendor )
    ?? []
  ;


  return (
    <>
      <div ref={anchor}>
        <TextInput 
          name={props.name}
          size="small" 
          select 
          SelectProps={{
            open: false,
            onOpen: () => setOpen( true ),
            onKeyPress: ( e: any ) => {
              if ( /^[a-z]/i.test( e.key ) ) {
                setInitialQuery( e.key );
                setOpen( true );
                e.preventDefault();
              }
            },
          }}
        >
          <MenuItem>{props.value?.name ?? 'Default'}</MenuItem>
        </TextInput>
      </div>
      <Selector
        { ...props }
        name="Vendor"
        anchorEl={anchor.current}
        loading={! rVendors.data && ! rVendors.error}
        showing={isOpen}
        onQueryChange={handleQueryChange}
        data={ vendors }
        query={query}
        initialQuery={initialQuery}
        onClose={() => setOpen( false )}
        onClickCreate={handleClickCreate}
        onSelect={handleSelect}
      />
    </>
  );
};