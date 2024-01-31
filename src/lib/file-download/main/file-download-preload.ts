import { contextBridge, ipcRenderer } from "electron";
import { Options } from "../shared";

function initialize(){
  if(!ipcRenderer){
    return;
  }

  if(contextBridge && process.contextIsolated){
    try {
      contextBridge.exposeInMainWorld("__ElectronFileDownload__", {
        asyncDownloadFile: (options: Options) => ipcRenderer.invoke("__electron-async-download-file", options),
        cancelDownloadFile: (uuid: string) => ipcRenderer.send("__electron-cancel-download-file", uuid),
        onDownloadFilePrgressFeedback: (callback) => ipcRenderer.on("__electron-download-file-progress-feedback", (_event, uuid: string, bytesDone: number, bytesTotal: number) => {
          callback(uuid, bytesDone, bytesTotal);
        }),
      });
    } catch {
      // Sometimes this files can be included twice
    }
  }
}

initialize();