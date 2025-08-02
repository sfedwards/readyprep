import React, { ReactElement } from 'react';

import { PrepLogSettingsDialog } from '.';

export interface PrepLogSettingsDialogContainerProps {
  open: boolean;
  onClose?: () => void;
}

export const PrepLogSettingsDialogContainer = ( props: PrepLogSettingsDialogContainerProps ): ReactElement => {
  const { open, onClose } = props;
  return <PrepLogSettingsDialog open={open} onClose={onClose} />;
};
