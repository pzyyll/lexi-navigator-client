import { BrowserWindow } from "electron";
import path from "path";
import { URL } from "url";

const createBaseWindow = (router = "", props: any) => {
  props.webPreferences = {
    preload: props.webPreferences?.preload || path.join(__dirname, "preload.js"),
    nodeIntegration: props.webPreferences?.nodeIntegration || false,
    contextIsolation: props.webPreferences?.contextIsolation || true,
    ...props.webPreferences
  }

  const window = new BrowserWindow(props);

  // console.log("createBaseWindow", window, props, router, MAIN_WINDOW_VITE_DEV_SERVER_URL, MAIN_WINDOW_VITE_NAME)

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    let baseURL = new URL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    if (router) {
      baseURL.hash = router;
    }
    baseURL = router ? new URL(`${router}`, baseURL) : baseURL;
    window.loadURL(baseURL.href);
  } else {
    const basePath = path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`);
    const page_file = router ? path.join(basePath, `#${router}`) : basePath;
    window.loadFile(page_file);
  }
  return window;
};

export { createBaseWindow };