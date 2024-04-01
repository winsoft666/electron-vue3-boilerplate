import path from "node:path";
import { BrowserWindow, app, dialog, ipcMain } from "electron";
import appState from "../../app-state";
import WindowBase from "../window-base";
import FramelessWindow from "../frameless";
import axiosInst from "../../../lib/axios-inst/main";

class PrimaryWindow extends WindowBase{
  protected createWindow() : BrowserWindow | null{
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        nodeIntegration: false,
        contextIsolation: true,
      },
    });
  
    // 拦截close事件
    win.on("close", (e) => {
      if(!appState.willExitApp){
        win.webContents.send("show-close-primary-win-msgbox");
        e.preventDefault();
      }
    });

    if(app.isPackaged){
      win.loadFile(path.join(app.getAppPath(), "build/renderer/pages/primary/index.html"));
    }else{
      const rendererPort = process.argv[2];
      win.loadURL(`http://localhost:${rendererPort}/pages/primary/index.html`);
    }
  
    return win;
  }

  protected registerIpcMainHandler(): void{
    ipcMain.on("message", (event, message) => {
      if(!this.isIpcMainEventBelongMe(event))
        return;

      console.log(message);
    });
  
    ipcMain.on("show-frameless-sample-window", (event) => {
      if(!appState.framelessWindow?.valid){
        appState.framelessWindow = new FramelessWindow();
      }
      
      const win = appState.framelessWindow?.browserWindow;
      if(win){
        // 居中到父窗体中
        const parent = win.getParentWindow();
        if(parent){
          const parentBounds = parent.getBounds();
          const x = Math.round(parentBounds.x + (parentBounds.width - win.getSize()[0]) / 2);
          const y = Math.round(parentBounds.y + (parentBounds.height - win.getSize()[1]) / 2);

          win.setPosition(x, y, false);
        }
        win.show();
      }
    });

    ipcMain.on("clear-app-configuration", (event) => {
      appState.cfgStore?.clear();
    });
    
    function delay(time){
      return new Promise(resolve => setTimeout(resolve, time));
    }

    ipcMain.on("min-to-tray", (event) => {
      if(!this.isIpcMainEventBelongMe(event))
        return;

      this.browserWindow?.hide();

      // 托盘气泡消息只显示一次，用配置文件记录是否已经显示
      if(!appState.cfgStore?.get("TrayBalloonDisplayed", false) as boolean){
        appState.cfgStore?.set("TrayBalloonDisplayed", true);
        if(appState.tray){
          appState.tray.displayBalloon({
            title: "electron-vue-boilerplate",
            content: "客户端已经最小化到系统托盘。\n\n该气泡消息只会显示一次!"
          });
        }
      }
    });
    
    ipcMain.handle("async-exit-app", async(event) => {
      // 暂停1500毫秒，模拟退出程序时的清理操作
      await delay(1500);
      appState.willExitApp = true;
      app.quit();
    });

    ipcMain.on("http-get-request", (event, url) => {
      axiosInst.get(url)
        .then((rsp) => {
          dialog.showMessageBox(this._browserWindow!, {
            message: `在主进程中请求 ${url} 成功！状态码：${rsp.status}`,
            type: "info"
          });
        })
        .catch((err) => {
          dialog.showMessageBox(this._browserWindow!, {
            message: `在主进程中请求 ${url} 失败！错误消息：${err.message}`,
            type: "error"
          });
        });
    });
  }
}

export default PrimaryWindow;
