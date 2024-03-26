import { createTheme } from "@mui/material/styles";

import BaseTheme from "./BaseTheme";

const DarkTheme = createTheme(BaseTheme, {
  palette: {
    mode: "dark",
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: "rgba(0, 0, 0, 1)",
        },
      },
    },
  },
});

export default DarkTheme;
