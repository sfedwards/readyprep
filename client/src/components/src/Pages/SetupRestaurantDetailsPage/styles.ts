import { makeStyles } from "@material-ui/core";

export const useAddressFieldStyles = makeStyles( {
  root: {
    width: '100%',
    '&&& .MuiInputBase-inputMultiline': {
      paddingTop: 24,
      minHeight: 57,
    },
  },
} );
