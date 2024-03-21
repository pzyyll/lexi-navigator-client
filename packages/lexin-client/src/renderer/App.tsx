import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createHashRouter, createBrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

import Home from "./routers/Home";
import TranslateSimple from "./routers/TranslateSimple";

import Themes from "./themes";

//css
import "bootstrap/dist/css/bootstrap.min.css";

const routers = [
  { path: "/", element: <Home /> },
  { path: "/translate_simple", element: <TranslateSimple /> },
];

const router = window.electronAPI
  ? createHashRouter(routers)
  : createBrowserRouter(routers);

function App() {
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

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
