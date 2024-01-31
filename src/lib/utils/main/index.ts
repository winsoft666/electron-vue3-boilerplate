import { app, session, BrowserWindow, ipcMain, shell } from "electron";
import path from "path";
import * as FileUtils from "./file-util";

class Utils{
  public initialize(){
    this._preloadFilePath = path.join(__dirname, "utils-preload.js");
    console.log("Utils preload path: " + this._preloadFilePath);
    this.setPreload(session.defaultSession);

    app.on("session-created", (session) => {
      this.setPreload(session);
    });
  }
  
  protected setPreload(session){
    session.setPreloads([ ...session.getPreloads(), this._preloadFilePath ]);
  }

  protected _preloadFilePath : string = "";
}

const utils = new Utils();

ipcMain.on("__electron-utils-open-dev-tools", () => {
  const win = BrowserWindow.getFocusedWindow();
  win?.webContents.openDevTools();
});

ipcMain.on("__electron-utils-open-external-url", (event, url) => {
  if(url){
    shell.openExternal(url);
  }
});

ipcMain.on("__electron-utils-check-path-exist", (event, path) => {
  let exist = false;
  if(path){
    exist = FileUtils.IsPathExist(path);
  }
  event.returnValue = exist;
});

export default utils;
export {
  FileUtils
};