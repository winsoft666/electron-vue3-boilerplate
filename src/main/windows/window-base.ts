import { BrowserWindow, IpcMainEvent, IpcMainInvokeEvent } from "electron";

abstract class WindowBase{
  constructor(){
    this._browserWindow = this.createWindow();

    if(this._browserWindow){
      // After received closed event, remove the reference to the window and avoid using it any more.
      this._browserWindow.on("closed", () => {
        this._browserWindow = null;
      });
    }

    this.registerIpcMainHandler();
  }

  public get valid(){
    return this.browserWindow != null;
  }

  public get browserWindow(){
    return this._browserWindow;
  }

  protected abstract createWindow() : BrowserWindow | null;

  protected abstract registerIpcMainHandler() : void;

  protected _browserWindow : BrowserWindow | null = null;

  public isIpcMainEventBelongMe(event : IpcMainEvent | IpcMainInvokeEvent) : boolean{
    if(!this._browserWindow)
      return false;
    return (event.sender.id == this.browserWindow?.webContents.id);
  }
}

export default WindowBase;