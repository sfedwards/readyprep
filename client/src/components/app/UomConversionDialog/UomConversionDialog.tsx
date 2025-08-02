import React, { ReactElement } from 'react';
import useSWR from 'swr';
import { ConversionsDialog } from '../../UI/ConversionsDialog';

export interface UomConversionDialogProps {
  ingredientId: number;
  open: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
}

export const UomConversionDialog = ( 
  {
    ingredientId,
    open,
    onClose,
    onConfirm,
  }: UomConversionDialogProps,
): ReactElement => {
  const rIngredient = useSWR( `/ingredients/${ingredientId}` );
  const rUnits = useSWR( '/units' );

  const handleConfirm = () => {};

  return (
    <ConversionsDialog
      units={rUnits.data?.items ?? []}
      onConfirm={handleConfirm}
      onClose={() => onClose?.()}
      conversions={[]}
      onCreateNewUnit={() => {}}
      showing={open}
      loading={! rUnits.data && rUnits.isValidating}
    />
  );
};
