import React, { useContext } from 'react';

import { CountingListsApi } from '../counting-lists/counting-lists.api';

const CountingListsApiContext = React.createContext(new CountingListsApi());

export const CountingListsApiProvider = CountingListsApiContext.Provider;
export const useCountingListsApi = () => useContext(CountingListsApiContext);
