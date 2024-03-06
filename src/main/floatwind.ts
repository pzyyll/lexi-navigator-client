import { createBaseWindow } from "./base";
import { app, screen, BrowserWindow } from "electron";
const kmhook = require("kmhook/build/Release/kmhook.node");

let kmhook_listener;
let floatWin: BrowserWindow | null = null;

function triggerFloatWin() {
  if (!floatWin) {
    floatWin = createBaseWindow("/translate_simple", {
      width: 400,
      height: 300,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      show: false,
      webPreferences: {
        nodeIntegration: true,
      },
    });
  } 
  
  if (floatWin.isVisible()) {
    floatWin.hide();
  } else {
    const { x, y } = screen.getCursorScreenPoint();
    floatWin.show();
    floatWin.setPosition(x, y);
  }
}

function initFloatWinListener() {
  kmhook_listener = new kmhook.KMHook();

  kmhook_listener.RegisterShortcut("command+c+c", () => {
    triggerFloatWin();
  });

  kmhook_listener.RegisterShortcut("option+option", () => {
    triggerFloatWin();
  });

  kmhook_listener.Start();

  app.on("will-quit", () => {
    console.log("will-quit floatwin listener");
    kmhook_listener.UnregisterAllShortcuts();
    kmhook_listener.Stop();
  });

}




export { initFloatWinListener };