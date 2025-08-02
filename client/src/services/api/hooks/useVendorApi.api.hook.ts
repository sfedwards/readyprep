import React, { useContext } from 'react';

import { VendorApi } from '../vendor.api';

const VendorApiContext = React.createContext(new VendorApi());

export const VendorApiProvider = VendorApiContext.Provider;
export const useVendorApi = () => useContext(VendorApiContext);
