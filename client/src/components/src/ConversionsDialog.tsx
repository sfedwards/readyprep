import React, { ReactElement } from 'react';
import useSWR from 'swr';
import { Optional } from 'utility-types';

import { ConversionsDialog, ConversionsDialogProps } from '../UI/ConversionsDialog';

export default ( props: Optional< Omit< ConversionsDialogProps, 'loading' >, 'units' > ): ReactElement => {
  const { data, isValidating } = useSWR( '/units' );
  const units = data?.items;

  return <ConversionsDialog loading={ ! units && isValidating } units={units} {...props} />;
};
