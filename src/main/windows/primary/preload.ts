import { contextBridge, ipcRenderer } from "electron";

/*
The preload for MainWindow
*/
contextBridge.exposeInMainWorld("electronAPI", {
  sendMessage: (message: string) => ipcRenderer.send("message", message),
  showFramelessSampleWindow: () => ipcRenderer.send("show-frameless-sample-window"),
  openExternalLink: (url: string) => ipcRenderer.send("open-external-link", url),
  clearAppConfiguration: () => ipcRenderer.send("clear-app-configuration"),
  onShowExitAppMsgbox: (callback) => ipcRenderer.on("show-exit-app-msgbox", () => {
    callback();
  }),
  asyncExitApp: () => ipcRenderer.invoke("async-exit-app"),
  httpGetRequest: (url:string) => ipcRenderer.send("http-get-request", url),
});
