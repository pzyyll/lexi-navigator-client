import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createHashRouter, createBrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

import Home from "./routers/Home";
import TranslateSimple from "./routers/TranslateSimple";
import ScreenShot from "./routers/ScreenShot";

import Themes from "@themes";

//css
import "bootstrap/dist/css/bootstrap.min.css";

const routers = [
  { path: "/", element: <Home /> },
  { path: "/translate_simple", element: <TranslateSimple /> },
  { path: "/screenshot", element: <ScreenShot /> },
];

const router = window.electronAPI
  ? createHashRouter(routers)
  : createBrowserRouter(routers);

function App() {
  const [theme, setTheme] = React.useState(Themes.light);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
