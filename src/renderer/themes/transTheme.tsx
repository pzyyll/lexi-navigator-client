import { createTheme } from "@mui/material/styles";
import { height } from "@mui/system";

const transTheme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {

        body: {
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
        },
      },
    },
  },
});

export default transTheme;