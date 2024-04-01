/**
 * @file 存储应用的状态数据
 */

import path from "path";
import { Tray, app, dialog } from "electron";
import PrimaryWindow from "./windows/primary";
import FramelessWindow from "./windows/frameless";
import log from "electron-log/main";
import ElectronStore from "electron-store";
import { Singleton } from "../lib/utils/shared";
import fd from "../lib/file-download/main";
import utils from "../lib/utils/main";

// 应用环境（开发环境、测试环境、生产环境）
enum AppEnv {
  Development,
  Test,
  Production
}

/**
 * 单实例类
 * 全局存储应用程序的状态数据，包含窗口对象、托盘对象等
 * @class
 */
class AppState extends Singleton{
  constructor(){
    super();
    let envStr = "";
    if(process.argv.length >= 2){
      envStr = process.argv[2].toLowerCase();
    }

    if(envStr == "development"){
      this.appEnv = AppEnv.Development;
    }else if(envStr == "test"){
      this.appEnv = AppEnv.Test;
    }else if(envStr == "production"){
      this.appEnv = AppEnv.Production;
    }
  }

  // 初始化应用程序，应用程序启动时会调用该方法
  public initialize(): boolean{
    if(app.isPackaged){
      const packageJSON = require(path.join(app.getAppPath(), "package.json"));
      this._appVersion = packageJSON.version;

      this._mainStaticPath = path.join(app.getAppPath(), "build/main/static");
    }else{
      const packageJSON = require(path.join(app.getAppPath(), "../../package.json"));
      this._appVersion = packageJSON.version;

      // 在非打包环境, appPath为 ./build/main
      this._mainStaticPath = path.join(app.getAppPath(), "static");
    }

    if(!this.initLogger()){
      return false;
    }

    log.info(`Env: ${AppEnv[this.appEnv]}, Version: ${this._appVersion}`);

    if(!this.initConfigFile()){
      log.warn("Init config file failed");
      return false;
    }

    // 初始化文件下载组件
    fd.initialize();

    // 初始化Utils组件
    utils.initialize();

    this._isInit = true;
    return true;
  }

  // 反初始化应用程序，应用程序程序退出前会调用该方法
  public uninitialize(){
    log.eventLogger.stopLogging();
    this._isInit = false;
  }

  public get isInit(){
    return this._isInit;
  }

  public get appVersion(){
    return this._appVersion;
  }

  public get mainStaticPath(){
    return this._mainStaticPath;
  }

  // 应用程序的环境（默认为生产环境）
  public readonly appEnv: AppEnv = AppEnv.Production;

  // 配置文件读写
  public cfgStore: null | ElectronStore = null;

  // 主窗口对象
  public primaryWindow: null | PrimaryWindow = null;

  // 无边框示例窗口的对象
  public framelessWindow : null | FramelessWindow = null;

  // 系统托盘
  public tray: null | Tray = null;

  // 是否即将退出应用程序
  // 该变量用来拦截非用户主动触发的关闭消息，防止主窗口收到close事件时退出应用
  public willExitApp: boolean = false;

  // 当前应用程序仅允许运行一个实例
  public onlyAllowSingleInstance : boolean = true;

  // ======== Protected 成员 ========
  //
  // 应用程序是否已初始化
  protected _isInit: boolean = false;

  // 当前应用的版本号
  protected _appVersion: string = "";

  // 主进程静态资源目录的路径
  protected _mainStaticPath: string = "";

  // 初始化文件日志系统
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

  // 初始化配置文件
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
export { AppEnv };