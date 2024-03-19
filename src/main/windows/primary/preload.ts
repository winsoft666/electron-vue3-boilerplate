import { contextBridge, ipcRenderer } from "electron";

/*
暴露primary窗口主进程的方法到primary窗口的渲染进程
*/
contextBridge.exposeInMainWorld("primaryWindowAPI", {
  sendMessage: (message: string) => ipcRenderer.send("message", message),
  showFramelessSampleWindow: () => ipcRenderer.send("show-frameless-sample-window"),
  openExternalLink: (url: string) => ipcRenderer.send("open-external-link", url),
  clearAppConfiguration: () => ipcRenderer.send("clear-app-configuration"),
  onShowExitAppMsgbox: (callback) => ipcRenderer.on("show-exit-app-msgbox", () => {
    callback();
  }),
  onShowClosePrimaryWinMsgbox: (callback) => ipcRenderer.on("show-close-primary-win-msgbox", () => {
    callback();
  }),
  asyncExitApp: () => ipcRenderer.invoke("async-exit-app"),
  minToTray: () => ipcRenderer.send("min-to-tray"),
  httpGetRequest: (url:string) => ipcRenderer.send("http-get-request", url),
});
