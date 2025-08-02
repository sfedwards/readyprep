import React, { useContext } from 'react';

import { VendorItemApi } from '../vendor-item.api';

const VendorItemApiContext = React.createContext(new VendorItemApi());

export const VendorItemApiProvider = VendorItemApiContext.Provider;
export const useVendorItemApi = () => useContext(VendorItemApiContext);
