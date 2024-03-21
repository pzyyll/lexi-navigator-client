import React from "react";
import { createRoot } from "react-dom/client";

import { CssBaseline, ThemeProvider } from "@mui/material";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// import "@assets/style/index.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import Themes from "@themes";

import Dashboard from "./routes/Dashboard.tsx";
import Login from "./routes/Login.tsx";
import Root from "./routes/Root.tsx";

const router = createBrowserRouter([
  { path: "/", element: <Root /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/login", element: <Login /> },
  { path: "/:pathMatch(.*)", element: <h1>404</h1> },
]);

function App() {
  const [theme, setTheme] = React.useState(Themes.light);
  return (
    <React.StrictMode>
      <ThemeProvider theme={Themes.global}>
        <CssBaseline />
        <ThemeProvider theme={theme}>
          <RouterProvider router={router} />
        </ThemeProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
