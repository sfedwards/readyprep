import { Control, useWatch } from "react-hook-form";
import React, { useEffect, useState } from "react";

import { CatalogItemInput as FormCatalogItemInput } from '../../../Form';
import { Ingredient } from "../../../../models/Ingredient";
import { ReactElement } from "react";
import { Vendor } from "../../../../services/api/models/vendor.api.model";

export interface CatalogItemInputProps {
  index: number;
  control: Control;
  textOnly?: boolean;
}

export const CatalogItemInput = ( props: CatalogItemInputProps ): ReactElement => {
  const { index, control } = props;

  const [ ingredientId, setIngredientId ] = useState<Ingredient['id']|null>(null);

  const ingredient = useWatch<Ingredient>( {
    name: `items[${index}].ingredient`,
    control,
  } );

  const vendorId = useWatch<Vendor['id']>( {
    name: `vendorId`,
    control,
  } );

  useEffect( () => {
    setIngredientId( ingredient?.id ?? null );
  }, [ ingredient?.id ] );
  
  return (
    <FormCatalogItemInput 
      name={`items[${index}].catalogNumber`}
      vendorId={vendorId ?? null}
      ingredientId={ingredientId}
      control={control}
      textOnly={!!props.textOnly}
    />
  );

}