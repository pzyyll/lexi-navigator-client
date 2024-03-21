import { createTheme } from "@mui/material/styles";

const DarkTheme = createTheme({
  palette: {
    mode: "dark",
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        'body': {
          background: 'rgba(0, 0, 0, 1)',
        },
      },
    },
  },
});

export default DarkTheme;