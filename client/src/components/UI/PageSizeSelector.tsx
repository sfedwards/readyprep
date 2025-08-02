import { Box, MenuItem, Select, Typography, makeStyles } from '@material-ui/core';
import React, { ReactElement } from 'react';

import { useTranslation } from 'react-i18next';

interface Props {
  value: number;
  onChange: ( pageSize: number ) => void;
}

const useStyles = makeStyles( theme => ( {
  input: {
    backgroundColor: '#fff',
    padding: 8,
  },
} ) );

export const PageSizeSelector = ( props: Props ): ReactElement => {
  const classes = useStyles();
  const { t } = useTranslation();

  const handleChange = ( e: any ): void => {
    props.onChange( +e.target.value );
  };

  return (
    <Box mt="auto" flex="shrink" display="flex" alignItems="center" flexWrap="nowrap">
      <Typography>{t( 'elements.pagination.page-size' )}</Typography>
      <Box p={2}>
        <Select
          value={props.value}
          onChange={handleChange}
          inputProps={{ className: classes.input }}
          variant="outlined"
          margin="dense"
        >
          <MenuItem value={5}>5</MenuItem>
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={20}>20</MenuItem>
          <MenuItem value={50}>50</MenuItem>
        </Select>
      </Box>
    </Box>
  );
};
