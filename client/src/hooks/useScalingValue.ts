import { useScalingFactor } from './useScalingFactor';

export const useScalingValue = (
  min = 0,
  max = 1,
  useHeight?: boolean,
  minWidth?: number,
  maxWidth?: number,
): number => {
  const factor = useScalingFactor( minWidth, maxWidth, useHeight );
  const value = ( max - min ) * factor + min;
  return value;
};
