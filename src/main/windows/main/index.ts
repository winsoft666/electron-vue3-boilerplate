import path from "node:path";
import { BrowserWindow, app } from "electron";
import { appState } from "../../app-state";

function CreateMainWindow() : BrowserWindow{
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.on("close", (e) => {
    if(!appState.willExitApp && appState.minToTrayWhenClose){
      mainWindow.hide();
      if(!appState.cfgStore?.get("TrayBalloonDisplayed", false) as boolean){
        appState.cfgStore?.set("TrayBalloonDisplayed", true);
        if(appState.tray){
          appState.tray.displayBalloon({
            title: "electron-vue-template",
            content: "The program has been minimized to the system tray.\n\nThis balloon will only be displayed once!"
          });
        }
      }
      e.preventDefault();
    }
  });

  if(process.env.NODE_ENV === "development"){
    const rendererPort = process.argv[2];
    mainWindow.loadURL(`http://localhost:${rendererPort}/pages/main/index.html`);
  }else{
    mainWindow.loadFile(path.join(app.getAppPath(), "build/renderer/pages/main/index.html"));
  }

  return mainWindow;
}

export { CreateMainWindow };
