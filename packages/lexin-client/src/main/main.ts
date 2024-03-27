import { app, BrowserWindow, ipcMain, globalShortcut, crashReporter, Menu, Tray } from "electron";
import log from "electron-log";
import path from "path";
import { createBaseWindow } from "./base";
import { initFloatWinListener, ClearFloatWinResource } from "./floatwind";
import * as TranslateModule from "./translate"
import * as Speech from "./speech";
import * as ScreenShot from "./screenshot";

log.transports.file.level = "info";
log.transports.console.level = "info";
log.transports.file.format = "{h}:{i}:{s}:{ms} {text}";

log.info("App starting...");

console.log = log.log;

crashReporter.start({
  productName: "LexiNavigator",
  companyName: "tarzipc.top",
  uploadToServer: false,
});

const rootPath = app.getAppPath();

let mainWindow: BrowserWindow;
let appTray: Tray;
let isQuit = false;

// console.log('root', app.getAppPath());
// console.log('userData', app.getPath('userData'));
// console.log('appData', app.getPath('appData'));
// console.log('temp', app.getPath('temp'));
// console.log('exe', app.getPath('exe'));
// console.log('desktop', app.getPath('desktop'));
// console.log('documents', app.getPath('documents'));
// console.log('downloads', app.getPath('downloads'));
// console.log('music', app.getPath('music'));
// console.log('pictures', app.getPath('pictures'));
// console.log('videos', app.getPath('videos'));
// console.log('logs', app.getPath('logs'));
// console.log('crashDumps', app.getPath('crashDumps'));

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const listenEvent = () => {
  ipcMain.on("fromRenderer", (event, data) => {
    event.reply("fromMain", "Hello from Main!");
  });

  // ipcMain.handle(Channel.GetConfig, async (event, ...args) => {
  //   return configData;
  // });
};

const initAppTray = () => {

  let icon_path = path.join(rootPath, "./resources/assets/AppIcon.appiconset/Icon-16-Template.png");
  if (process.platform == "win32") {
    icon_path = path.join(rootPath, "./resources/assets/ln_white_icon.ico");
  }

  appTray = new Tray(icon_path);
  appTray.setToolTip("LexiNavigator");

  appTray.on("click", () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
      app.dock.hide();
    } else {
      mainWindow.show();
      app.dock.show();
    }
  });

  appTray.on("right-click", () => {
    appTray.popUpContextMenu(contextMenu);
  });

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Exit",
      click: (menuItem, browserWindow, event) => {
        console.log("exit ...");
        isQuit = true;
        app.quit();
      },
    },
  ]);
  // appTray.setContextMenu(contextMenu);
}

const createWindow = () => {
  listenEvent();
  // Create the browser window.

  mainWindow = createBaseWindow("/", {
    width: 800,
    height: 600,
    icon: path.join(rootPath, "./resources/assets/lnb.icns"),
  });

  // 如果是windows系统，隐藏菜单栏
  if (process.platform === "win32") {
    Menu.setApplicationMenu(null);
  }

  mainWindow.on("close", (e) => {
    if (!isQuit) {
      e.preventDefault();
      mainWindow.hide();
      app.dock.hide();
    }
  });

  mainWindow.webContents.on("render-process-gone", (e, details) => {
    console.log("render-process-gone", details);
    ClearFloatWinResource();
    app.quit();
  });

  globalShortcut.register("F12", () => {
    // Open the DevTools.
    const focus = BrowserWindow.getFocusedWindow();
    if (!focus) {
      return;
    }
    if (focus.webContents.isDevToolsOpened()) {
      focus.webContents.closeDevTools();
    } else {
      focus.webContents.openDevTools();
    }
  });
};

const init = () => {
  createWindow();
  initFloatWinListener(mainWindow);
  initAppTray();
  TranslateModule.initTanslateModule();
  Speech.initSpeech();
  ScreenShot.init();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", init);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  console.log("before-quit...")
  isQuit = true;
  ipcMain.removeAllListeners();
  globalShortcut.unregisterAll();
  BrowserWindow.getAllWindows().forEach(win=>{
    win.removeAllListeners()
    win.destroy()
  });
  TranslateModule.clear();
  ClearFloatWinResource();
  Speech.clear();
  ScreenShot.clear();
});

app.on("will-quit", () => {
  console.log('will-quit ...');
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  } else if (!mainWindow?.isVisible()) {
    mainWindow?.show();
  }
});


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
