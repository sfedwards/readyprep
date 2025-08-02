import { theme } from '../theme';
import useResizeObserver from 'use-resize-observer';

// Returns a number from 0 to 1, 0 for screens minWidth or smaller, 1 for screens maxWidth or larger
export const useScalingFactor = (
  min = theme.breakpoints.values.md,
  max = theme.breakpoints.values.lg,
  useHeight = false,
): number => {
  const { width, height } = useResizeObserver( {
    ref: document.body,
  } );

  const val = useHeight ? height : width;

  if ( ! val ) return 0;

  const factor = ( val - min ) / ( max - min );

  return Math.max( 0, Math.min( 1, factor ) );
};
