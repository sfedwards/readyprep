import React, { ReactElement } from 'react';
import useSWR from 'swr';
import { Optional } from 'utility-types';

import { UnitSelector, UnitSelectorProps } from '../UI/UnitSelector';

export default ( props: Optional< Omit< UnitSelectorProps, 'loading' >, 'units' | 'onCreateNewUnit' > ): ReactElement => {
  const { data, mutate } = useSWR( props.units ? null : '/units' );

  const units = props.units ?? data?.items ?? [];

  const handleCreateNewUnit = (): void => {
    mutate();
  };

  return (
    <UnitSelector {...props} units={units} onCreateNewUnit={handleCreateNewUnit} />
  );
};
