import path from "node:path";
import { BrowserWindow, app, ipcMain, shell } from "electron";
import { appState } from "../../app-state";
import { WindowBase } from "../window-base";
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

    ipcMain.on("open-external-link", (event, url) => {
      if(!this.isIpcMainEventBelongMe(event))
        return;
      shell.openExternal(url);
    });

    ipcMain.on("clear-app-configuration", (event) => {
      if(!this.isIpcMainEventBelongMe(event))
        return;
      appState.cfgStore?.clear();
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
  }
}

export default MainWindow;
