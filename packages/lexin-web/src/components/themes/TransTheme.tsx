import { createTheme } from "@mui/material/styles";
import { outlinedInputClasses } from '@mui/material/OutlinedInput';

const TransTheme = createTheme({
  customSizes: {
    body1: '1rem',
    body2: '0.8rem',
    icon1: '40px',
    icon2: '32px',
    icon3: '24px',
  },
  palette: {
    primary: {
      main: '#000',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: 'transparent',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          "--Common-BackgroundColor": "rgba(255, 255, 255, 0.9)",
          backgroundColor: 'var(--Common-BackgroundColor)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          backgroundColor: 'transparent',
          paddingRight: '0px',
          paddingLeft: '0px',
          borderBottom: '1px solid rgba(217, 217, 217)',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'filled',
        size: 'small',
      },
      styleOverrides: {
        root: {
          // 'border': 'none',
          // 'boxShadow': 'none',
          '--TextField-brandBorderColor': 'rgba(217, 217, 217)',
          '--TextField-brandBorderHoverColor': 'rgba(217, 217, 217)',
          '--TextField-brandBorderFocusedColor': 'grey',
          '& label.Mui-focused': {
            color: 'var(--TextField-brandBorderFocusedColor)',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          borderColor: 'var(--TextField-brandBorderFocusedColor)',
        },
        root: {
          paddingLeft: '0px',
          paddingRight: '0px',
          [`&:hover .${outlinedInputClasses.notchedOutline}`]: {
            borderColor: 'var(--TextField-brandBorderHoverColor)',
          },
          [`&.Mui-focused .${outlinedInputClasses.notchedOutline}`]: {
            borderColor: 'var(--TextField-brandBorderFocusedColor)',
          },
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          '&::before, &::after': {
            borderBottom: '0px solid var(--TextField-brandBorderColor)',
          },

          '&:hover, &:hover:not(.Mui-disabled, .Mui-error):before': {
            backgroundColor: 'transparent',
            borderBottom: '1px solid var(--TextField-brandBorderHoverColor)',
          },
          '&.Mui-focused, &.Mui-focused:after': {
            backgroundColor: 'transparent',
            borderBottom: '1px solid var(--TextField-brandBorderFocusedColor)',
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          whiteSpace: 'normal',
        },
      },
    },
    MuiSpeedDial: {
      styleOverrides: {
        fab: {
          // 缩小SpeedDial按钮
          width: "40px",
          height: "40px",
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          color: '#000000',
          ':hover': {
            backgroundColor: 'grey',
          },
        },
      },
    },
    MuiSpeedDialAction: {
      styleOverrides: {
        fab: {
          width: "32px",
          height: "32px",
          minHeight: "0",
        },
      },
    },
  },

});

export default TransTheme;