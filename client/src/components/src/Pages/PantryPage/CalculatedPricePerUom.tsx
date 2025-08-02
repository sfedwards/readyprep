import { Control, useWatch } from "react-hook-form";

import { InputAdornment } from "@material-ui/core";
import { Pack } from "./PacksTable/PackRow";
import React, { useEffect, useState } from "react";
import { TextInput } from "../../../UI";
import { Unit } from "../../../../models/Unit";
import { useIngredientsApi } from "../../../../services/api/hooks/useIngredientsApi.api.hook";

export interface CalculatedPricePerUomProps {
  ingredientId: number;
  control: Control,
  packs: Pack[],
  conversions: {
    unitA: string;
    amountA: string;
    unitB: string;
    amountB: string;
  }[];
}

export const CalculatedPricePerUom = ( props: CalculatedPricePerUomProps ) => {

  const { ingredientId, control, packs, conversions } = props;

  const ingredientsApi = useIngredientsApi();

  const unit = useWatch<Unit>({
    name: 'unit',
    control,
  });

  const waste = useWatch({
    name: 'waste',
    control,
    defaultValue: 0,
  });

  const {
    price: pricePerPack,
    numItems: numItemsPerPack,
    amountPerItem,
    unit: packUnit,
  } = packs.find( ({ isDefault }) => isDefault ) ?? { unit: { symbol: '' } };

  const uom = packUnit?.symbol ?? '';

  const [ conversionRatio, setConversionRatio ] = useState<number|null>( 0 );
  
  useEffect( () => {
    let isCancelled = false;

    ( async () => {
      setConversionRatio( null );

      if ( ! unit?.symbol )
        return;

      try {
        const result = await ingredientsApi.convert( 
          ingredientId, 
          { unit: unit.symbol, amount: 1 },
          { unit: uom },
          conversions,
        );

        if ( isCancelled )
          return;

        if ( result?.body )
          setConversionRatio( result.body );
      } catch {
        if ( isCancelled )
          return;

        setConversionRatio( null );
      }
    })();

    return () => { isCancelled = true };
  }, [ ingredientsApi, ingredientId, unit?.symbol, conversions, waste, uom ])

  let pricePerUOM = +( pricePerPack ?? 0 )/( ( numItemsPerPack ? +numItemsPerPack : 1 )*( amountPerItem ? +amountPerItem : 1 ) );
  if ( +waste )
    pricePerUOM = pricePerUOM/( 100 - +waste )*100;

  if ( conversionRatio )
    pricePerUOM *= conversionRatio;

  const hasValidPricePerUOM = conversionRatio && ! Number.isNaN( pricePerUOM ) && Number.isFinite( pricePerUOM );

  return (
    <TextInput
      label={`Price per ${unit?.symbol ?? 'UOM'}`}
      disabled
      InputProps={{
        startAdornment: <InputAdornment position="start" style={{ pointerEvents: 'none' }}>$</InputAdornment>,
      }}
      value={
        hasValidPricePerUOM
          ? `${pricePerUOM.toFixed( 2 ).replace( /\.?0*$/, '' )}`
          : '\u00a0--\u00a0'
      }
    />
  );
}