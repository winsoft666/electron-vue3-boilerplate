import { BrowserWindow, app, dialog, session, Menu } from "electron";
import log from "electron-log/main";
import PrimaryWindow from "./windows/primary";
import { CreateAppTray } from "./tray";
import appState from "./app-state";

// Disable sandbox
// app.commandLine.appendSwitch("no-sandbox");

// Remove default menu
Menu.setApplicationMenu(null);

const gotLock = app.requestSingleInstanceLock();
if(!gotLock && appState.onlyAllowSingleInstance){
  app.quit();
}else{
  app.whenReady().then(() => {
    if(!appState.initialize()){
      dialog.showErrorBox("App initialization failed", "The program will exit after click the OK button.",);
      app.exit();
      return;
    }

    log.info("App initialize ok");

    appState.primaryWindow = new PrimaryWindow();
    appState.tray = CreateAppTray();

    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          "Content-Security-Policy": [ "script-src 'self'" ],
        },
      });
    });
  });

  app.on("second-instance", () => {
    appState.primaryWindow?.browserWindow?.show();
  });

  app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
    if(BrowserWindow.getAllWindows().length === 0)
      appState.primaryWindow = new PrimaryWindow();
  });

  app.on("window-all-closed", () => {
    if(process.platform !== "darwin")
      app.quit();
  });

  app.on("will-quit", () => {
    appState.uninitialize();
  });
}