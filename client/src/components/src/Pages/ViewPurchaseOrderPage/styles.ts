import { makeStyles } from "@material-ui/core";

export const useViewOrderPageStyles = makeStyles({
  background: {
    background: '#fafafa',
    '@media print': {
      background: 'none',
      height: 'auto',
    },
  }
})