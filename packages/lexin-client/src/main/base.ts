
import { BrowserWindow } from "electron";
import log from "electron-log";
import path from "path";
import { URL, format } from "url";

const createBaseWindow = (router = "", props: any) => {
  props.webPreferences = {
    preload: props.webPreferences?.preload || path.join(__dirname, "preload.js"),
    nodeIntegration: props.webPreferences?.nodeIntegration || false,
    contextIsolation: props.webPreferences?.contextIsolation || true,
    ...props.webPreferences
  }

  const window = new BrowserWindow(props);

  console.log("createBaseWindow", window, props, router, MAIN_WINDOW_VITE_DEV_SERVER_URL, MAIN_WINDOW_VITE_NAME)

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    const startUrl = new URL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    startUrl.hash = router ?? "/";
    log.info("startUrl:", startUrl.href);
    window.loadURL(startUrl.href);
  } else {
    const basePath = path.join(__dirname, `./renderer/${MAIN_WINDOW_VITE_NAME}/index.html`);
    const startUrl = new URL(`file://${basePath}`);
    startUrl.hash = router ?? "/";
    log.info("startUrl", startUrl.href);
    window.loadURL(startUrl.href);
  }
  return window;
};

export { createBaseWindow };