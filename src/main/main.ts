import { app, BrowserWindow, ipcMain, globalShortcut, screen } from "electron";
import path from "path";
import fs from "fs";
import { Channel } from "../common/const";
import { createBaseWindow } from "./base";
import { initFloatWinListener } from "./floatwind";

const rootPath = app.getAppPath();

const configPath = path.join(rootPath, "app_data/config.json");
let configData: any;

function loadConfig() {
  try {
    const jsonString = fs.readFileSync(configPath, "utf-8");
    configData = JSON.parse(jsonString);
  } catch (error) {
    console.error("Error loading JSON file:", error);
  }
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const listenEvent = () => {
  ipcMain.on("fromRenderer", (event, data) => {
    event.reply("fromMain", "Hello from Main!");
  });

  ipcMain.handle(Channel.GetConfig, async (event, ...args) => {
    return configData;
  });
};


const createWindow = () => {
  // load config
  loadConfig();
  listenEvent();
  // Create the browser window.
  const mainWindow = createBaseWindow("/", {
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
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
  console.log("init", process.versions);

  createWindow();
  initFloatWinListener();

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

app.on("will-quit", () => {
  console.log("will-quit main");
  globalShortcut.unregisterAll();
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
