import { useMediaQuery, useTheme } from '@material-ui/core';

export const useIsFullWidth = (): boolean => {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery( theme.breakpoints.up( 'md' ) );

  return isLargeScreen;
};
