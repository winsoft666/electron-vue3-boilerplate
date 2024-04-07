import path from "path";
import { BrowserWindow, ipcMain } from "electron";
import WindowBase from "../window-base";
import appState from "../../app-state";

class FramelessWindow extends WindowBase{
  constructor(){
    // 调用WindowBase构造函数创建窗口
    super({
      width: 600,
      height: 360,
      frame: false,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
      },
      // 设置父窗口
      parent: appState.primaryWindow?.browserWindow as BrowserWindow,
    });

    this.openRouter("/frameless-sample");
  }

  protected registerIpcMainHandler(): void{  
    ipcMain.on("minimize-window", (event) => {
      if(!this.isIpcMainEventBelongMe(event))
        return;
      this._browserWindow?.minimize();
    });
  
    ipcMain.on("restore-window", (event) => {
      if(!this.isIpcMainEventBelongMe(event))
        return;
      if(this.browserWindow){
        if(this.browserWindow.isMaximized())
          this.browserWindow.restore();
        else
          this.browserWindow.maximize();
      }
    });
  
    ipcMain.on("close-window", (event) => {
      if(!this.isIpcMainEventBelongMe(event))
        return;
      this.browserWindow?.close();
    });
  }
}

export default FramelessWindow;