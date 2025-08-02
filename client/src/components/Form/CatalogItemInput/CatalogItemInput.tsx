import { Control, useController } from 'react-hook-form';
import React, { useState } from 'react';

import { GetVendorPacksResponse } from '../../../services/api/vendors/interface/GetVendorPacks.api.interface';
import { Ingredient } from '../../../models/Ingredient';
import { MenuItem } from '@material-ui/core';
import { ReactElement } from 'react';
import { TextInput } from '../../UI';
import { Vendor } from '../../../services/api/models/vendor.api.model';
import useSWR from 'swr';
import { CreateCatalogItemDialog } from '../../src';

export interface CatalogItemInputProps {
  name: string;
  control: Control;
  vendorId: Vendor['id'] | null;
  ingredientId: Ingredient['id'] | null;
  textOnly: boolean;
}

export const CatalogItemInput = ( props: CatalogItemInputProps ): ReactElement => 
{
  const { name, control, vendorId, ingredientId } = props;

  const [ isCreatingNew, setCreatingNew ] = useState( false );
  
  const rVendorItems = useSWR<GetVendorPacksResponse>( 
    (vendorId && ingredientId) ? `/vendors/${vendorId}/catalog/${ingredientId}` : null
  );

  const {
    field: { onChange, value }
  } = useController({
    name,
    control,
    defaultValue: null,
  });

  if ( props.textOnly )
    return value;

  return (
    <>
      <TextInput 
        select={!!vendorId}
        size="small"
        disabled={!vendorId}
        onChange={onChange}
        value={value ?? ''}
      >
        { vendorId && ingredientId
          ?
            [
              ...rVendorItems.data?.map( pack => 
                <MenuItem key={pack.catalogNumber} value={pack.catalogNumber}>{pack.catalogNumber}</MenuItem>
              ) ?? [],
              <MenuItem onClick={() => setCreatingNew(true)}>Create New</MenuItem>
            ]
          : []
        }
      </TextInput>
      { vendorId && ingredientId &&
          <CreateCatalogItemDialog
            vendorId={vendorId!}
            ingredientId={ingredientId!}
            open={isCreatingNew}
            onClose={() => setCreatingNew(false)}
            onConfirm={onChange}
          />
      }      
    </>
  );
};