import { contextBridge, ipcRenderer } from "electron";

/*
The preload for XXXWindow
*/
contextBridge.exposeInMainWorld("XXXWindowAPI", {
  // A simple sample
  sendMessage: (message) => ipcRenderer.send("send-message", message),

  // Expose more api to renderer...
});
