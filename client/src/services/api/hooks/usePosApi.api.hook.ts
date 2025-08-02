import React, { useContext } from 'react';

import { PosApi } from '../pos/pos.api';

const PosApiContext = React.createContext(new PosApi());

export const PosApiProvider = PosApiContext.Provider;
export const usePosApi = () => useContext(PosApiContext);
