import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import Themes from "./themes";
import { CssBaseline } from "@mui/material";

import Home from "./components/Home";
import TranslateSimple from "./components/TranslateSimple";

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/translate_simple", element: <TranslateSimple /> },
]);

export default function App() {
  const [theme, setTheme] = React.useState(Themes.light);

  return (
    <ThemeProvider theme={Themes.global}>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <RouterProvider router={router} />
      </ThemeProvider>
    </ThemeProvider>
  );
}
