import log from "electron-log";

import { createBaseWindow } from "./base";
import { app, screen, BrowserWindow } from "electron";

const { ipcMain, clipboard } = require("electron");
const { kmhook } = require("kmhook");

import { Channel } from "@src/common/const";

let kmhook_listener;
let floatWin: BrowserWindow | null = null;
let floatWinDelayCloseTimer: NodeJS.Timeout | null = null;
let mouseEventId = 0;

let fakeWin: BrowserWindow | null = null;
let isPinFloatWin = false;

function fakeFocusWindow() {
  if (fakeWin?.isDestroyed()) {
    fakeWin = null;
    return;
  }
  if (!fakeWin) {
    fakeWin = new BrowserWindow({
      width: 1,
      height: 1,
      x: -110,
      y: -110,
      frame: false,
      transparent: true,
      skipTaskbar: true
    });
    fakeWin.loadURL("about:blank");
  }
  const focus = BrowserWindow.getFocusedWindow();
  if (focus === floatWin || !focus) {
    fakeWin.focus();
  }
}

function hideFloatWinNoReturnFocus() {
  fakeFocusWindow();
  floatWin?.hide();
}

function clearDelayCloseTimer() {
  if (floatWinDelayCloseTimer) {
    clearTimeout(floatWinDelayCloseTimer);
    floatWinDelayCloseTimer = null;
  }
}

function eventOnCloseFlat(event, data) {
  console.log("eventOnCloseFlat", data);
  floatWin?.hide();
}

function eventOnPinFloatWin(event, data) {
  console.log("eventOnPinFloatWin", data);
  isPinFloatWin = data;
}

function createFloatWin() {
  floatWin = createBaseWindow("/translate_simple", {
    width: 400,
    height: 300,
    minWidth: 200,
    minHeight: 200,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    show: false,
  });

  floatWin.on("focus", () => {
    clearDelayCloseTimer();
  });

  floatWin.on("show", () => {
    clearDelayCloseTimer();
  });

  floatWin.on("hide", () => {
    clearDelayCloseTimer();
    clearMouseEventOutWin();
    floatWin?.webContents.send(Channel.OnFloatWinHide);
    floatWinDelayCloseTimer = setTimeout(() => {
      console.log("delay close floatwin");
      floatWin?.destroy();
      floatWin = null;
      floatWinDelayCloseTimer = null;
      ipcMain.removeListener(Channel.CloseFloatWin, eventOnCloseFlat);
      ipcMain.removeListener(Channel.PinFloatWin, eventOnPinFloatWin);
      ipcMain.removeHandler(Channel.GetPinStatus);
    }, 1000*60*5);
  });

  floatWin.on("blur", () => {
    if (isPinFloatWin) {
      return;
    }
    floatWin?.hide();
  });

  floatWin.on("close", (e) => {
    e.preventDefault();
    hideFloatWinNoReturnFocus();
  });

  floatWin.on("closed", () => {
    clearMouseEventOutWin();
    floatWin = null;
  });

  floatWin.webContents.on("render-process-gone", (e, details) => {
    console.log("render-process-gone", details);
    clearFloatWin();
  });

  ipcMain.on(Channel.CloseFloatWin, eventOnCloseFlat);
  ipcMain.on(Channel.PinFloatWin, eventOnPinFloatWin);

  ipcMain.handle(Channel.GetPinStatus, async (event, ...args) => {
    return isPinFloatWin;
  });

}

function clearFloatWin() {
  clearDelayCloseTimer();

  floatWin?.destroy();
  floatWin = null;

  ipcMain.removeListener(Channel.CloseFloatWin, eventOnCloseFlat);
  ipcMain.removeListener(Channel.PinFloatWin, eventOnPinFloatWin);
}

function getShowPosition(win) {
  const cursor = screen.getCursorScreenPoint();
  const curDisplay = screen.getDisplayNearestPoint(cursor);

  const screenSize = curDisplay.workAreaSize;
  const winSize = win.getSize();

  let x = cursor.x;
  let y = cursor.y;

  if (x + winSize[0] > screenSize.width) {
    x = x - winSize[0];
  }
  if (y + winSize[1] > screenSize.height) {
    y = y - winSize[1];
  }

  return { x, y };
}

function triggerFloatWin(onShow?: () => void){
  if (floatWin && floatWin.isDestroyed()){
    clearFloatWin();
  }

  const checkShowFunc = () => {
    onShow && onShow();
    if (floatWin && floatWin.isVisible() && floatWin.isFocused()) {
      return;
    } 
    
    if (floatWin && !floatWin.isVisible()){
      const { x, y } = getShowPosition(floatWin);
      setMouseEventOutWin();
      floatWin.show();
      floatWin.setPosition(x, y);
    }
  }

  if (!floatWin) {
    createFloatWin();
    floatWin.once("ready-to-show", () => {
      checkShowFunc();
    });
  } else {
    checkShowFunc();
  }
}

function setMouseEventOutWin() {
  if (!floatWin || floatWin.isVisible()) {
    return;
  }
  mouseEventId = kmhook_listener.RegisterMouseEvent(kmhook.MouseLeftDown, (event) => {
    const x = event.point.x;
    const y = event.point.y;
    if (!floatWin) {
      return;
    }
    const winPos = floatWin?.getPosition();
    const winSize = floatWin?.getSize();

    // console.log("mouseEventId", x, y, winPos, winSize);
    if (x < winPos[0] || y < winPos[1] || x > winPos[0] + winSize[0] || y > winPos[1] + winSize[1]) {
      // console.log("mouseEventId hideFloatWinNoReturnFocus");
      if (!isPinFloatWin) hideFloatWinNoReturnFocus();
    }
  });
}

function clearMouseEventOutWin() {
  if (mouseEventId) {
    kmhook_listener.UnregisterMouseEvent(mouseEventId);
    mouseEventId = 0;
  }
}

function initFloatWinListener(main_win: BrowserWindow) {
  kmhook_listener = new kmhook.KMHook();

  log.info("initFloatWinListener ...", kmhook_listener)
  kmhook_listener.TestCallback(()=> {
    log.info("initFloatWinListener TestCallback ...")
  })

  kmhook_listener.RegisterShortcut("command+c+c", () => {
    console.log("command+c+c");
    const sendClipboardText = () => {
      const text = clipboard.readText();
      if (text) {
        // console.log("sendClipboardText", text);
        floatWin?.webContents.send(Channel.TranslateText, text);
      }
    }
    triggerFloatWin(sendClipboardText);
  });

  kmhook_listener.RegisterShortcut("option+option", () => {
    if (floatWin?.isVisible()) {
      hideFloatWinNoReturnFocus()
    } else {
      triggerFloatWin();
    }
  });

  try{
    kmhook_listener.Start();
  } catch (e) {
    log.error("initFloatWinListener Start error", e);
  }

  app.on("will-quit", () => {
    console.log("will-quit floatwin listener");
    clearFloatWin()
    fakeWin?.destroy();
    fakeWin = null;
    kmhook_listener?.UnregisterAllShortcuts();
    kmhook_listener?.UnregisterAllMouse();
    kmhook_listener?.Stop();
    kmhook_listener = null;
  });

  app.on("window-all-closed", () => {
    console.log("window-all-closed floatwin listener");
    kmhook_listener?.UnregisterAllShortcuts();
    kmhook_listener?.UnregisterAllMouse();
    kmhook_listener?.Stop();
    kmhook_listener = null;
  });

  main_win.on("focus", () => {
    fakeWin?.destroy();
    fakeWin = null;
  });
}

export function ClearFloatWinResource() {
  clearFloatWin();
  fakeWin?.destroy();
  fakeWin = null;
  kmhook_listener?.UnregisterAllShortcuts();
  kmhook_listener?.UnregisterAllMouse();
  kmhook_listener?.Stop();
  kmhook_listener = null;
}

export { initFloatWinListener };