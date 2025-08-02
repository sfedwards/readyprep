import { Dialog } from '@material-ui/core';
import React, { ReactElement } from 'react';

export interface PrepLogSettingsDialogProp {
  open: boolean;
  onClose?: () => void;
}

export const PrepLogSettingsDialog = (
  { open, onClose }: PrepLogSettingsDialogProp
): ReactElement => {
  return (
    <Dialog open={open} onClose={onClose}>

    </Dialog>
  );
};
