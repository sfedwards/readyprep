import { GetProfileResponse, useProfileApi } from '../services/api';
import useSWR, { mutate } from 'swr';

interface ProfileResult {
  loading: boolean;
  profile?: GetProfileResponse;
}

const REFRESH_INTERVAL = 5 * 60 * 1000;
const SWR_KEY = 'USE_PROFILE';

let hasLoaded = false;

export const useProfile = (
  {
    revalidateOnMount = false,
  } = {},
): ProfileResult => {
  const profileApi = useProfileApi();

  const rProfile = useSWR<GetProfileResponse | undefined>( SWR_KEY, {
    fetcher: async () => {
      return await profileApi.getProfile();
    },
    revalidateOnMount: ! hasLoaded || revalidateOnMount,
    refreshWhenOffline: false,
    refreshInterval: REFRESH_INTERVAL,
    revalidateOnReconnect: true,
    refreshWhenHidden: true,
  } );

  const loading = ! rProfile.data && rProfile.isValidating;
  const profile = rProfile.data;

  return {
    loading,
    profile,
  };
};

export const mutateProfile = async (): Promise<void> => {
  hasLoaded = false;
  await mutate( SWR_KEY );
};
