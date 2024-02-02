import path from "path";
import { Tray, app, dialog } from "electron";
import PrimaryWindow from "./windows/primary";
import FramelessWindow from "./windows/frameless";
import log from "electron-log/main";
import ElectronStore from "electron-store";
import { Singleton } from "../lib/utils/shared";
import fd from "../lib/file-download/main";
import utils from "../lib/utils/main";

class AppState extends Singleton{
  public initialize(): boolean{
    if(process.env.NODE_ENV === "development"){
      const packageJSON = require(path.join(app.getAppPath(), "../../package.json"));
      this.appVersion = packageJSON.version;

      // In development mode, appPath is ./build/main
      this._mainStaticPath = path.join(app.getAppPath(), "static");
    }else{
      const packageJSON = require(path.join(app.getAppPath(), "package.json"));
      this.appVersion = packageJSON.version;

      this._mainStaticPath = path.join(app.getAppPath(), "build/main/static");
    }

    if(!this.initLogger()){
      return false;
    }

    log.info(`Version: ${this.appVersion}`);

    if(!this.initConfigFile()){
      log.warn("Init config file failed");
      return false;
    }

    fd.initialize();
    utils.initialize();

    this._isInit = true;
    return true;
  }

  public uninitialize(){
    log.eventLogger.stopLogging();
    this._isInit = false;
  }

  public isInit(): boolean{
    return this._isInit;
  }

  public get mainStaticPath(){
    return this._mainStaticPath;
  }

  public appVersion: string = "";
  public cfgStore: null | ElectronStore = null;
  public primaryWindow: null | PrimaryWindow = null;
  public framelessWindow : null | FramelessWindow = null;
  public tray: null | Tray = null;
  public willExitApp: boolean = false;

  // Only allow one instance to run.
  public onlyAllowSingleInstance : boolean = true;

  // When user click close button, minimize window to tray.
  public minToTrayWhenClose: boolean = true;

  protected _isInit: boolean = false;
  protected _mainStaticPath: string = "";

  protected initLogger(): boolean{
    log.initialize();

    // save electron events to file.
    log.eventLogger.startLogging({
      events: {
        app: {
          "certificate-error": true,
          "child-process-gone": true,
          "render-process-gone": true,
        },
        webContents: {
          "did-fail-load": true,
          "did-fail-provisional-load": true,
          "plugin-crashed": true,
          "preload-error": true,
          "unresponsive": true,
        },
      },
      scope: "ElectronEvent",
    });

    // collect all unhandled errors/rejections
    log.errorHandler.startCatching({
      showDialog: false,
      onError({ createIssue, error, processType, versions }){
        if(processType === "renderer")
          return;

        dialog.showMessageBox({
          title: "An error occurred",
          message: error.message,
          detail: error.stack,
          type: "error",
          buttons: [ "Ignore", "Report", "Exit" ],
        })
          .then((result) => {
            if(result.response === 1){
              createIssue("https://github.com/winsoft666/electron-vue3-template/issues/new", {
                title: `Error report for ${versions.app}`,
                body: `Error:\n\`\`\`${error.stack}\n\`\`\`\n` + `OS: ${versions.os}`,
              });
              return;
            }

            if(result.response === 2)
              app.quit();
          });
      },
    });
    return true;
  }

  protected initConfigFile() : boolean{
    this.cfgStore = new ElectronStore({
      name: "AppConfig",
      fileExtension: "json",
    });
    ElectronStore.initRenderer();
    console.log(`Config file path: ${this.cfgStore.path}`);
    return true;
  }
}

function getAppState(): AppState{
  return AppState.instance();
}

const appState = getAppState();

export default appState;
