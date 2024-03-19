/**
 * @file 与系统托盘的相关的功能
 */

import path from "path";
import { Menu, MenuItem, Tray } from "electron";
import appState from "./app-state";

// 创建系统托盘
function CreateAppTray() : Tray{
  const iconPath = process.platform === "win32" ? 
    path.join(appState.mainStaticPath, "tray.ico") : 
    path.join(appState.mainStaticPath, "tray.png");

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
