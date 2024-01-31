import { contextBridge, ipcRenderer } from "electron";

/*
The preload for FramelessWindow
*/
contextBridge.exposeInMainWorld("electronAPI", {
  openDevTools: () => ipcRenderer.send("open-dev-tools"),
  minimizeWindow: () => ipcRenderer.send("minimize-window"),
  restoreWindow: () => ipcRenderer.send("restore-window"),
  closeWindow: () => ipcRenderer.send("close-window"),
});
