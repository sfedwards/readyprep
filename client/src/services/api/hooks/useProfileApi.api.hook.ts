import React, { useContext } from 'react';

import { ProfileApi } from '../profile/profile.api';

const ProfileApiContext = React.createContext(new ProfileApi());

export const ProfileApiProvider = ProfileApiContext.Provider;
export const useProfileApi = () => useContext(ProfileApiContext);
