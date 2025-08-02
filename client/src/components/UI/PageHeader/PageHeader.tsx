import { Box, Typography, CircularProgress } from '@material-ui/core';
import React, { ReactElement, ReactNode } from 'react';

export interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  loading?: boolean;
  children?: ReactNode;
};

export const PageHeader = (
  {
    title,
    subtitle,
    loading = false,
    children,
  }: PageHeaderProps,
): ReactElement => {
  return (
    <Box display="flex" flexWrap="wrap" alignItems="center">
      { title && 
        <Box flex="shrink" display="flex" alignItems="center">
          <Box minHeight={56} flex={'1 10'} p={1} display="flex" flexDirection="column" justifyContent="flex-end" alignItems="flex-start" whiteSpace="nowrap">
            <Typography variant="h3">{ title }</Typography>
            { subtitle && 
              <Typography variant="h4">{ subtitle }</Typography>
            }
          </Box>
          <Box flex={1}>
            { loading && <CircularProgress /> }
          </Box>
        </Box>
      }
      <Box py={2} px={2} flex={1} display="flex" alignItems="center">
        { children }
      </Box>
    </Box>
  )
};
