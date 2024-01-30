import { app, BrowserWindow, ipcMain } from "electron";
import { appState } from "./app-state";
import * as fd from "./util/file-download";
import * as fdTypes from "../shared/file-download-types";
import { GetErrorMessage } from "../shared/error-utils";

function RegisterIPCHandler(){
  ipcMain.on("message", (event, message) => {
    console.log(message);
  });

  ipcMain.on("show-frameless-sample-window", () => {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        // preload: path.join(__dirname, "preload.js"),
        nodeIntegration: false,
        contextIsolation: true,
      },
    });
  
    if(process.env.NODE_ENV === "development"){
      const rendererPort = process.argv[2];
      win.loadURL(`http://localhost:${rendererPort}/frameless-window`);
    }else{
      // win.loadFile(path.join(app.getAppPath(), "build/renderer/index.html"));
    }
  });
  
  function delay(time){
    return new Promise(resolve => setTimeout(resolve, time));
  }
  
  ipcMain.handle("async-exit-app", async() => {
    await delay(1500);
    appState.willExitApp = true;
    app.quit();
  });

  // According to bug https://github.com/electron/electron/issues/25196
  // Electron can not pass rejected promise to renderer correctly.
  // So we do not throw exception in handle function.
  ipcMain.handle("async-download-file", async(event, options : fdTypes.Options) => {
    const win = BrowserWindow.getFocusedWindow();
    try {
      const result = await fd.Download(options, win);
      return result;
    } catch (err){
      const result : fdTypes.Result = {
        uuid: options.uuid,
        success: false,
        canceled: false,
        error: GetErrorMessage(err),
        fileSize: 0,
      };
      return result;
    }
  });

  ipcMain.on("cancel-download-file", (event, uuid) => {
    if(uuid){
      fd.Cancel(uuid);
    }
  });
}

export { RegisterIPCHandler };