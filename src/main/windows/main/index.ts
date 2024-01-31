import path from "node:path";
import { BrowserWindow, app, ipcMain } from "electron";
import { appState } from "../../app-state";
import { WindowBase } from "../window-base";
import * as fd from "../../utils/file-download";
import * as fdTypes from "../../../shared/file-download-types";
import { GetErrorMessage } from "../../../shared/error-utils";
import FramelessWindow from "../frameless";

class MainWindow extends WindowBase{
  protected createWindow() : BrowserWindow | null{
    const mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        nodeIntegration: false,
        contextIsolation: true,
      },
    });
  
    mainWindow.on("close", (e) => {
      if(!appState.willExitApp && appState.minToTrayWhenClose){
        mainWindow.hide();
        if(!appState.cfgStore?.get("TrayBalloonDisplayed", false) as boolean){
          appState.cfgStore?.set("TrayBalloonDisplayed", true);
          if(appState.tray){
            appState.tray.displayBalloon({
              title: "electron-vue-template",
              content: "The program has been minimized to the system tray.\n\nThis balloon will only be displayed once!"
            });
          }
        }
        e.preventDefault();
      }
    });
  
    if(process.env.NODE_ENV === "development"){
      const rendererPort = process.argv[2];
      mainWindow.loadURL(`http://localhost:${rendererPort}/pages/main/index.html`);
    }else{
      mainWindow.loadFile(path.join(app.getAppPath(), "build/renderer/pages/main/index.html"));
    }
  
    return mainWindow;
  }

  protected registerIpcMainHandler(): void{
    ipcMain.on("message", (event, message) => {
      if(!this.isIpcMainEventBelongMe(event))
        return;

      console.log(message);
    });
  
    ipcMain.on("show-frameless-sample-window", (event) => {
      if(!this.isIpcMainEventBelongMe(event))
        return;

      if(appState.framelessWindow?.valid){
        appState.framelessWindow?.browserWindow?.show();
      }else{
        appState.framelessWindow = new FramelessWindow();
      }
    });
    
    function delay(time){
      return new Promise(resolve => setTimeout(resolve, time));
    }
    
    ipcMain.handle("async-exit-app", async(event) => {
      if(!this.isIpcMainEventBelongMe(event))
        return;

      await delay(1500);
      appState.willExitApp = true;
      app.quit();
    });
  
    // According to bug https://github.com/electron/electron/issues/25196
    // Electron can not pass rejected promise to renderer correctly.
    // So we do not throw exception in handle function.
    ipcMain.handle("async-download-file", async(event, options : fdTypes.Options) => {
      if(!this.isIpcMainEventBelongMe(event))
        return;

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
      if(!this.isIpcMainEventBelongMe(event))
        return;
      
      if(uuid){
        fd.Cancel(uuid);
      }
    });
  }
}

export default MainWindow;
