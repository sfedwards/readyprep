import { MuiPickersOverrides } from '@material-ui/pickers/typings/overrides';
import { createTheme } from '@material-ui/core';

type overridesNameToClassKey = {
  [P in keyof MuiPickersOverrides]: keyof MuiPickersOverrides[P];
};

declare module '@material-ui/core/styles/overrides' {
  export interface ComponentNameToClassKey extends overridesNameToClassKey {}

  interface BreakpointOverrides {
    xs: true;
    sm: true;
    md: true;
    lg: true;
    xl: true;
  }
}

declare module '@material-ui/core/styles/createPalette' {
  interface Palette {
    hover: PaletteColor,
    disabled: PaletteColor,
    logo: PaletteColor,
    accent: PaletteColor,
    primaryText: PaletteColor,
    primaryGray: PaletteColor,
    secondaryGray: PaletteColor,
  }

  interface PaletteOptions {
    hover: PaletteColorOptions,
    disabled: PaletteColorOptions,
    logo: PaletteColorOptions,
    accent: PaletteColorOptions,
    primaryText: PaletteColorOptions,
    primaryGray: PaletteColorOptions,
    secondaryGray: PaletteColorOptions,
    lightGray: PaletteColorOptions,
  }
}

const breakpoints = createTheme().breakpoints;

const eggplant = '#5C325C';
const lightEggplant = '#924f92';
const primaryGray = '#736C73';
const secondaryGray = '#A6A1A6';

const heavyText = {
  color: primaryGray,
  fontWeight: 700,
  letterSpacing: '0.04rem',
};

const mediumText = {
  color: primaryGray,
  fontWeight: 600,
};

const palette = {
  hover: { main: '#F0EBF0' },
  disabled: { main: '#F0EBF0' },
  logo: { main: '#B7A5B7' },
  accent: { main: '#5C325C' },
  primaryText: { main: '#403B40' },
  primaryGray: { main: primaryGray },
  secondaryGray: { main: secondaryGray },
  lightGray: { main: '#E7E7E7' },
  primary: {
    light: lightEggplant,
    main: eggplant, // blue,
  },
  secondary: {
    main: '#fff5f7',
  },
  error: {
    main: '#D02E44',
    dark: '#a72536',
  },
  text: {
    primary: secondaryGray,
    secondary: primaryGray,
  },
};

export const theme = createTheme( {
  palette,
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 720,
      lg: 1200,
      xl: 1536,
    },
  },
  typography: {
    fontFamily: 'Rubik, Arial, sans-serif',
    h1: {
      color: palette.text.primary,
      fontWeight: 500,
      fontSize: '1.75rem',
      lineHeight: 'normal',
    },
    h2: {
      fontWeight: 700,
      fontSize: '1.5rem',
      lineHeight: 'normal',
    },
    h3: {
      color: palette.primary.main,
      fontSize: '1.75rem',
      lineHeight: 'normal',
      [breakpoints.up( 'sm' )]: {
        fontSize: '2.5rem',
      },
    },
    h4: {
      color: primaryGray,
    },
    h5: {
      fontWeight: 500,
      color: palette.primary.main,
      [breakpoints.down( 'xs' )]: {
        fontSize: '0.8em',
      },
    },
    h6: {
      color: primaryGray,
    },
    subtitle1: {
      color: primaryGray,
      fontSize: '0.8rem',
      fontWeight: 500,
      lineHeight: 'normal',
      [breakpoints.down( 'xs' )]: {
        fontSize: '0.6rem',
      },
    },
    body1: {
      color: palette.text.primary,
      lineHeight: 'normal',
      /* [breakpoints.down('sm')]: {
        fontSize: '0.95em',
      },*/
    },
    body2: {
      fontSize: '1.1rem',
      lineHeight: 'normal',
      fontWeight: 500,
      color: palette.text.primary,
      [breakpoints.down( 'sm' )]: {
        fontSize: '0.95rem',
      },
    },
  },
  overrides: {
    MuiInputLabel: {
      root: {
        marginTop: '-0.75em',
        fontSize: '0.75em',
        ...mediumText,
      },
    },
    MuiOutlinedInput: {
      root: {
        '&&': {
          borderRadius: 8,
          [breakpoints.down( 'sm' )]: {
            margin: 4,
            paddingTop: 14,
            // paddingLeft: 0,
            paddingBottom: 4,
            fontSize: '0.7rem',
            '&.MuiInputBase-marginDense': {
              paddingTop: 0,
              paddingBottom: 0,
            },
          },
        },
      },
      input: {
        '&&': {
          ...heavyText,
          paddingLeft: 16,
          paddingRight: 0,
          paddingBottom: 8,
          [breakpoints.down( 'sm' )]: {
            paddingLeft: 8,
            paddingTop: 14,
            paddingBottom: 4,
            fontSize: '0.7rem',
            '&.MuiInputBase-inputMarginDense': {
              paddingTop: 9.5,
              paddingBottom: 9.5,
            },
          },
          '.Mui-error &&&': {
            color: palette.error.main,
            fontWeight: 'normal',
          },
          '&.MuiInputBase-inputMultiline': {
            padding: '0 8px',
          },
        },
      },
    },
    MuiSelect: {
      root: {
        /* '&&&': {
          [breakpoints.down('md')]: {
            paddingTop: 7,
            paddingBottom: 5.8,
          },
        },*/
      },
      outlined: {
        borderRadius: 8,
      },
    },
    MuiInputAdornment: {
      root: {
        [breakpoints.down( 'sm' )]: {
          // display: 'none',
        },
      },
    },
    MuiSvgIcon: {
      root: {
        fontSize: '1.75rem',
        lineHeight: '2rem',
        [breakpoints.down( 'xs' )]: {
          '&.MuiSelect-icon': {
            margin: 'auto',
          },
        },
      },
    },
    MuiFormControlLabel: {
      label: {
        userSelect: 'none',
        ...heavyText,
      },
    },
    MuiLink: {
      root: {
        ...mediumText,
      },
    },
    MuiTab: {
      root: {
        textTransform: 'none',
        '&&&': {
          color: '#736C73',
          '&.Mui-selected': {
            color: eggplant,
          },
        },
      },
    },
    MuiAvatar: {
      root: {
        fontWeight: 500,
      },
      colorDefault: {
        backgroundColor: secondaryGray,
      },
    },
    MuiTableRow: {
      root: {
        background: '#ffffff88',
        '&:hover': {
          background: '#F0EBF0',
        },
        '&:first-child:last-child': {
          background: '#fff',
        },
      },
    },
    MuiTableCell: {
      root: {
        lineHeight: '1.3em',
        padding: '16px 24px',
        [breakpoints.down( 'sm' )]: {
          padding: 4,
          borderBottomWidth: 3,
        },
        '&:first-child': {
          fontSize: '1.2rem',
          paddingLeft: 24,
          [breakpoints.down( 'sm' )]: {
            fontSize: '0.9rem',
          },
        },
        '.MuiTableRow-head &': {
          padding: '14px 24px',
        },
        '& a': {
          color: '#4D474D',
          '&:hover': {
            color: eggplant,
          },
        },
      },
      body: {
        color: palette.primaryGray.main,
      },
    },
    MuiButton: {
      root: {
        textTransform: 'none',
      },
    },
    MuiFormControl: {
      root: {
        marginTop: 8,
        marginBottom: 8,
        [breakpoints.down( 'xs' )]: {
          margin: 0,
        },
      },
    },
    MuiMenuItem: {
      root: {
        '&:hover': {
          backgroundColor: palette.hover.main,
        },
      },
    },
    MuiPickersDay: {
      dayDisabled: {
        color: palette.lightGray.main,
      },
    },
    MuiPickersModal: {
      withAdditionalActions: {
        display: 'none',
      },
    },
  },
} );

export default theme;