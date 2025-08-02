import React, { useContext } from 'react';

import { CountingApi } from '../counting/counting.api';

const CountingApiContext = React.createContext(new CountingApi());

export const CountingApiProvider = CountingApiContext.Provider;
export const useCountingApi = () => useContext(CountingApiContext);
