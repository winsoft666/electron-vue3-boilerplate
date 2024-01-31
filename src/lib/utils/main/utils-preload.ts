import { contextBridge, ipcRenderer } from "electron";

function initialize(){
  if(!ipcRenderer){
    return;
  }

  if(contextBridge && process.contextIsolated){
    try {
      contextBridge.exposeInMainWorld("__ElectronUtils__", {
        openDevTools: () => ipcRenderer.send("__electron-utils-open-dev-tools"),
        openExternalLink: (url: string) => ipcRenderer.send("__electron-utils-open-external-url", url),
      });
    } catch {
      // Sometimes this files can be included twice
    }
  }
}

initialize();