import path from "path";
import { BrowserWindow, app, ipcMain } from "electron";
import WindowBase from "../window-base";

class XXXWindow extends WindowBase{
  protected createWindow() : BrowserWindow | null{
    const win = new BrowserWindow({
      width: 600,
      height: 300,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    if(process.env.NODE_ENV === "development"){
      const rendererPort = process.argv[2];
      win.loadURL(`http://localhost:${rendererPort}/pages/%renderer_page_name%/index.html`);
    }else{
      win.loadFile(path.join(app.getAppPath(), "build/renderer/pages/%renderer_page_name%/index.html"));
    }
    
    return win;
  }

  protected registerIpcMainHandler(): void{
    // A simple sample
    ipcMain.on("send-message", (event, message) => {
      if(!this.isIpcMainEventBelongMe(event))
        return;
      console.log(message);
    });

    // Add more ipcMain handler...
  }
}

export default XXXWindow;