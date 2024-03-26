import { createTheme } from "@mui/material/styles";
import BaseTheme from "./BaseTheme";

const LightTheme = createTheme(BaseTheme, {
  palette: {
    mode: "light",
  },
});

export default LightTheme;
