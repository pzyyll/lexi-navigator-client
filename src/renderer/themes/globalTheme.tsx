import { createTheme } from "@mui/material/styles";

const globalTheme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          height: '100%',
          width: '100%',
        },
        body: {
          height: '100%',
          width: '100%',
          
        },
      },
    },
  },
});

export default globalTheme;