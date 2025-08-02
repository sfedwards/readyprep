import React, { useContext } from 'react';

import { InvoiceApi } from '../invoice.api';

const InvoiceApiContext = React.createContext(new InvoiceApi());

export const InvoiceApiProvider = InvoiceApiContext.Provider;
export const useInvoiceApi = () => useContext(InvoiceApiContext);
