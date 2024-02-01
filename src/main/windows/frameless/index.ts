import path from "path";
import { BrowserWindow, app, ipcMain } from "electron";
import WindowBase from "../window-base";

class FramelessWindow extends WindowBase{
  protected createWindow() : BrowserWindow | null{
    const win = new BrowserWindow({
      width: 600,
      height: 360,
      frame: false,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    if(process.env.NODE_ENV === "development"){
      const rendererPort = process.argv[2];
      win.loadURL(`http://localhost:${rendererPort}/pages/frameless/index.html`);
    }else{
      win.loadFile(path.join(app.getAppPath(), "build/renderer/pages/frameless/index.html"));
    }
    
    return win;
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