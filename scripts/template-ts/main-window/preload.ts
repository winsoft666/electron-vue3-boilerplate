import { contextBridge, ipcRenderer } from "electron";

/*
The preload for XXXWindow
*/
contextBridge.exposeInMainWorld("electronAPI", {
  openDevTools: () => ipcRenderer.send("open-dev-tools"),
});
