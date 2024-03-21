import { createTheme } from "@mui/material/styles";
import { display } from "@mui/system";

const GlobalTheme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        'html, body, #root': {
          width: "100%",
          height: "100%",
          margin: 0,
          padding: 0,
          fontFamily: "Roboto, sans-serif",
          display: "flex",
        },
      },
    },
  },
});

export default GlobalTheme;