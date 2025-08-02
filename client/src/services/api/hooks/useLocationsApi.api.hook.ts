import React, { useContext } from 'react';

import { LocationsApi } from '../locations/locations.api';

const LocationsApiContext = React.createContext(new LocationsApi());

export const LocationsApiProvider = LocationsApiContext.Provider;
export const useLocationsApi = () => useContext(LocationsApiContext);
