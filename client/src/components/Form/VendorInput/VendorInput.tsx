import { Control, useController } from 'react-hook-form';
import React, { useRef, useState } from 'react';
import { Selector, TextInput } from '../../UI';

import { ListVendorsResponse } from '../../../services/api/vendors';
import { MenuItem } from '@material-ui/core';
import { ReactElement } from 'react';
import { Vendor } from '../../../services/api/models/vendor.api.model';
import log from 'loglevel';
import stringScore from 'string-score';
import useSWR from 'swr';
import { useVendorApi } from '../../../services/api/hooks/useVendorApi.api.hook';

export interface VendorInputProps {
    name?: string;
    control?: Control;
    value?: Partial<Vendor>;
    onChange?: (vendor: Vendor) => void;
};

export const VendorInput = ( props: VendorInputProps ): ReactElement => {
  const rVendors = useSWR<ListVendorsResponse>( '/vendors' );

  const [ isOpen, setOpen ] = useState( false );
  const [ query, setQuery ] = useState( '' );
  const [ initialQuery, setInitialQuery ] = useState( '' );
  const anchor = useRef<HTMLDivElement>(null);

  const { name, control } = props;
  let vendor: Vendor|null = null;
  let onChange: any;
  
  const [ isControlled ] = useState( ! control );
  if ( isControlled ) {
    // This is okay because the condition cannot change
    // eslint-disable-next-line react-hooks/rules-of-hooks
    ({ field: { value: vendor, onChange } } = useController( { name: name ?? '', control } ));
  }

  const vendorApi = useVendorApi();

  const handleQueryChange = ( query: string ) => {
    setQuery( query );
  }

  const handleClickCreate = async ( { name }: { name: string } ) => {
    const { body: { id } } = await vendorApi.create( { name } );
    const data = await rVendors.mutate();
    const vendor = data?.vendors.find( vendor => vendor.id === id );
    if ( vendor )
      handleSelect( vendor );
  };

  const handleSelect = ( vendor: Vendor ) => {
    setOpen( false );
    if ( isControlled )
      props.onChange?.( vendor );
    else
      onChange?.( vendor );
  };

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
          value={isControlled ? props.value?.id ?? "" : (vendor?.id ?? "")}
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
          <MenuItem
	    value={isControlled ? props.value?.id : (vendor?.id ?? "")}
	  >
            {
	      isControlled 
	      ? props.value?.name
	      : vendor?.name
	    }
          </MenuItem>
        </TextInput>
      </div>
      <Selector
        { ...props }
        name="Vendor"
        anchorEl={anchor.current}
        loading={! rVendors.data && ! rVendors.error}
        showing={isOpen}
        onQueryChange={handleQueryChange}
        data={vendors}
        query={query}
        initialQuery={initialQuery}
        onClose={() => setOpen( false )}
        onClickCreate={handleClickCreate}
        onSelect={handleSelect}
      />
    </>
  );
};