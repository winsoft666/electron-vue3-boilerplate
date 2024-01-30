import { contextBridge, ipcRenderer } from "electron";
import { Options } from "../../../shared/file-download-types";

contextBridge.exposeInMainWorld("electronAPI", {
  sendMessage: (message: string) => ipcRenderer.send("message", message),
  showFramelessSampleWindow: () => ipcRenderer.send("show-frameless-sample-window"),
  onShowExitAppMsgbox: (callback) => ipcRenderer.on("show-exit-app-msgbox", () => {
    callback();
  }),
  asyncExitApp: () => ipcRenderer.invoke("async-exit-app"),
  // File download
  asyncDownloadFile: (options: Options) => ipcRenderer.invoke("async-download-file", options),
  cancelDownloadFile: (uuid: string) => ipcRenderer.send("cancel-download-file", uuid),
  onFileDownloadPrgressFeedback: (callback) => ipcRenderer.on("file-download-progress-feedback", (_event, uuid: string, bytesDone: number, bytesTotal: number) => {
    callback(uuid, bytesDone, bytesTotal);
  }),
});
