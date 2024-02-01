import { BrowserWindow, app, dialog, session } from "electron";
import log from "electron-log/main";
import MainWindow from "./windows/main";
import { CreateAppTray } from "./tray";
import appState from "./app-state";

// Disable sandbox
// app.commandLine.appendSwitch("no-sandbox");

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

    appState.mainWindow = new MainWindow();
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
    appState.mainWindow?.browserWindow?.show();
  });

  app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
    if(BrowserWindow.getAllWindows().length === 0)
      appState.mainWindow = new MainWindow();
  });

  app.on("window-all-closed", () => {
    if(process.platform !== "darwin")
      app.quit();
  });

  app.on("will-quit", () => {
    appState.uninitialize();
  });
}