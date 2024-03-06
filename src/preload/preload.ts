// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require("electron");
import { Channel } from "../common/const";


contextBridge.exposeInMainWorld("electronAPI", {
    send: (channel: string, data: any) => {
        const validChannels = ["fromRenderer"];
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    receive: (channel: string, func: (...args: any[]) => void) => {
        const validChannels = ["fromMain"];
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, (event: any, ...args: any[]) => func(...args));
        }
    },
    async_request: (channel: Channel) => {
        return ipcRenderer.invoke(channel)
    }
});
