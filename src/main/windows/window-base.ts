import { app, BrowserWindow, IpcMainEvent, IpcMainInvokeEvent, BrowserWindowConstructorOptions } from "electron";

/**
 * 窗口基类，所有的窗口都继承自该类，如 PrimaryWindow、FramelessWindow
 * @class
 */
abstract class WindowBase{
  constructor(options?: BrowserWindowConstructorOptions){
    this._browserWindow = new BrowserWindow(options);

    if(this._browserWindow){
      // After received closed event, remove the reference to the window and avoid using it any more.
      this._browserWindow.on("closed", () => {
        this._browserWindow = null;
      });
    }

    this.registerIpcMainHandler();
  }

  public openRouter(routerPath : string){
    let url = "";
    if(app.isPackaged){
      url = `${app.getAppPath()}/build/renderer/index.html#${routerPath}`;
    }else{
      const rendererPort = process.argv[2];
      url = `http://localhost:${rendererPort}/#${routerPath}`;
    }

    console.log(`Load URL: ${url}`);

    if(this._browserWindow){
      this._browserWindow.loadURL(url);
    }
  }

  public get valid(){
    return this.browserWindow != null;
  }

  public get browserWindow(){
    return this._browserWindow;
  }

  protected abstract registerIpcMainHandler() : void;

  protected _browserWindow : BrowserWindow | null = null;

  public isIpcMainEventBelongMe(event : IpcMainEvent | IpcMainInvokeEvent) : boolean{
    if(!this._browserWindow)
      return false;
    return (event.sender.id == this.browserWindow?.webContents.id);
  }
}

export default WindowBase;