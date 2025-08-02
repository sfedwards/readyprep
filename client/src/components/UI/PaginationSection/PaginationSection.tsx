import { Box, useMediaQuery, useTheme } from "@material-ui/core";

import { PageSizeSelector } from "../PageSizeSelector";
import { Paginator } from "../Paginator";
import React from "react";

export interface PaginationSectionProps {
  numPages: number;
  currentPage: number;
  pageSize: number;
  onChangePage: ( page: number ) => void;
  onChangePageSize: ( pageSize: number ) => void;
}

export const PaginationSection = ( {
  numPages,
  currentPage,
  pageSize,
  onChangePage,
  onChangePageSize,
}: PaginationSectionProps) => {

  const theme = useTheme();
  const isLargeScreen = useMediaQuery( theme.breakpoints.up('md') );

  return (
    <Box pt={3} display="flex" alignItems="flex-end" flexWrap="nowrap">
      <Box flex={1}></Box>
      <Box flex={1} justifyContent="center">
        <Paginator
          numPages={numPages}
          currentPage={currentPage}
          siblingCount={isLargeScreen ? 2 : 1}
          boundaryCount={isLargeScreen ? 3 : 1}
          onNavigate={page => onChangePage( page )}
        />
      </Box>
      <Box flex={1} display="flex" justifyContent="flex-end">
        <PageSizeSelector value={pageSize} onChange={pageSize => onChangePageSize( pageSize )} />
      </Box>
    </Box>
  );
  
}