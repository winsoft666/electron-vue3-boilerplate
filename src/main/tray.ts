import path from "path";
import { Menu, MenuItem, Tray } from "electron";
import appState from "./app-state";

function CreateAppTray() : Tray{
  const iconPath = path.join(appState.mainStaticPath, "tray.ico");
  const tray = new Tray(iconPath);

  tray.on("click", () => {
    appState.primaryWindow?.browserWindow?.show();
  });

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open",
      type: "normal",
      accelerator: "Alt+O",
      registerAccelerator: true,
      click: () => {
        appState.primaryWindow?.browserWindow?.show();
      },
    },
    {
      label: "Exit App",
      type: "normal",
      click: () => {
        if(appState.primaryWindow){
          appState.primaryWindow.browserWindow?.show();
          appState.primaryWindow.browserWindow?.webContents.send("show-exit-app-msgbox");
        }
      },
    },
  ]);

  if(process.env.NODE_ENV === "development"){
    contextMenu.insert(
      0,
      new MenuItem({
        label: "Open DevTools",
        type: "normal",
        accelerator: "Alt+D",
        registerAccelerator: true,
        click: () => {
          appState.primaryWindow?.browserWindow?.webContents.openDevTools();
        },
      }),
    );
  }

  tray.setContextMenu(contextMenu);
  tray.setToolTip("A Electron + Vue3 template");
  tray.setTitle("electron-vue-template");

  return tray;
}

export { CreateAppTray };
