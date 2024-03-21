// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer, app } = require("electron");
import { Channel } from "../common/const";

const isDev = process.env.NODE_ENV === "development";
console.log("isDev", isDev);

contextBridge.exposeInMainWorld("electronAPI", {
    send: (channel: Channel, data?:any) => {
        ipcRenderer.send(channel, data);
    },
    receive: (channel: string, func: (...args: any[]) => void) => {
        ipcRenderer.on(channel, (event: any, ...args: any[]) => func(...args));
    },
    remove: (channel: string, func: (data: any) => void) => {
        ipcRenderer.removeListener(channel, func);
    },
    removeAll: (channel: string) => {
        ipcRenderer.removeAllListeners(channel);
    },
    invoke: (channel: Channel, ...args:any[]) => {
        return ipcRenderer.invoke(channel, ...args)
    }
});
