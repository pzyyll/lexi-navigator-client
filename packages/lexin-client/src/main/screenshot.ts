import { app, BrowserWindow, ipcMain, screen, nativeImage } from "electron";
import { createBaseWindow } from "./base";
import { Channel } from "@src/common/const";
import fs from "fs-extra";
import screenshot from "screenshot-desktop";

let resolveScreenshotPromise = null;
let rejectScreenshotPromise = null;

function clearScreenshotPromise() {
  if (rejectScreenshotPromise) {
    rejectScreenshotPromise(new Error("screenshot window closed"));
  }
  resolveScreenshotPromise = null;
  rejectScreenshotPromise = null;
}

export function createScreenShotWindow() {
  const cursor = screen.getCursorScreenPoint();
  const curDisplay = screen.getDisplayNearestPoint(cursor);

  const { width, height } = curDisplay.workAreaSize;
  const wind = createBaseWindow("screenshot", {
    width: width,
    height: height,
    alwaysOnTop: true,
    transparent: true,
    frame: false,
    resizable: false,
    show: false,
    x: curDisplay.bounds.x,
    y: curDisplay.bounds.y,
  });
  wind.once("ready-to-show", () => {
    wind.show();
  });
  wind.webContents.on("render-process-gone", (e, details) => {
    console.log("render-process-gone", details);
    wind.destroy();
    clearScreenshotPromise();
  });
  wind.on("closed", () => {
    console.log("screenshot window closed");
    clearScreenshotPromise();
  });
}

export function init() {
  ipcMain.handle(Channel.ScreenShot, async (event, ...args) => {
    return await get_screen_shot();
  });

  ipcMain.on(Channel.CloseScreenShot, async (event, ...args) => {
    const wind = BrowserWindow.fromWebContents(event.sender);
    wind?.destroy();
    clearScreenshotPromise();
  });

  ipcMain.on(Channel.ScreenShotEnd, async (event, selectedArea) => {
    const wind = BrowserWindow.fromWebContents(event.sender);
    const windX = wind?.getBounds().x;
    const windY = wind?.getBounds().y;
    wind?.hide();
    console.log("selected area", selectedArea, windX, windY);

    // const path = app.getPath("pictures");
    const curDisplay = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
    let i = 0;
    for (; i < screen.getAllDisplays().length; i++) {
      if (screen.getAllDisplays()[i].id === curDisplay.id) {
        console.log("curDisplay index", curDisplay, i);
        break;
      }
    }
    const scaleFactor = curDisplay.scaleFactor; // 获取屏幕的缩放因子
    const width = Math.abs(selectedArea.endX - selectedArea.startX) * scaleFactor;
    const height = Math.abs(selectedArea.endY - selectedArea.startY) * scaleFactor;
    const x = Math.min(selectedArea.startX, selectedArea.endX) * scaleFactor;
    const y = (Math.min(selectedArea.startY, selectedArea.endY) + windY) * scaleFactor;

    screenshot({ screen: i, format: "png" }).then((img) => {
      const _img = nativeImage.createFromBuffer(img);
      const pngbuffer = _img.crop({ x, y, width, height }).toPNG();
      if (resolveScreenshotPromise) {
        resolveScreenshotPromise(pngbuffer);
        rejectScreenshotPromise = null;
        resolveScreenshotPromise = null;
      }
      //_callback && _callback(pngbuffer);
      // fs.writeFile(`${path}/${Date.now()}-${i}.png`, pngbuffer, (err) => {
      //   if (err) {
      //     console.error("save screenshot failed", err);
      //   } else {
      //     console.log("screenshot saved to", `${path}/${Date.now()}-${i}.png`);
      //   }
      // });
      wind?.destroy();
    });
  });
}

export function clear() {
  ipcMain.removeAllListeners(Channel.ScreenShot);
  ipcMain.removeAllListeners(Channel.ScreenShotEnd);
  ipcMain.removeAllListeners(Channel.CloseScreenShot);
}

export function get_screen_shot(): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    // 保存resolve以便后续使用
    resolveScreenshotPromise = resolve;
    rejectScreenshotPromise = reject;
    // 启动截图窗口
    createScreenShotWindow();
  });
}
