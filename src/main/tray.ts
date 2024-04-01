/**
 * @file 与系统托盘的相关的功能
 */

import path from "path";
import { Menu, MenuItem, Tray } from "electron";
import appState, { AppEnv } from "./app-state";

// 创建系统托盘
function CreateAppTray() : Tray{
  const iconPath = process.platform === "win32" ? 
    path.join(appState.mainStaticPath, "tray.ico") : 
    path.join(appState.mainStaticPath, "tray.png");

  const tray = new Tray(iconPath);

  tray.on("click", () => {
    appState.primaryWindow?.browserWindow?.show();
  });

  // 创建托盘右键菜单
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "打开",
      type: "normal",
      accelerator: "Alt+O",
      registerAccelerator: true,
      click: () => {
        appState.primaryWindow?.browserWindow?.show();
      },
    },
    {
      label: "退出",
      type: "normal",
      click: () => {
        if(appState.primaryWindow){
          appState.primaryWindow.browserWindow?.show();
          appState.primaryWindow.browserWindow?.webContents.send("show-exit-app-msgbox");
        }
      },
    },
  ]);

  // 在非生产环境添加一个打开调试工具菜单，方便调试
  if(appState.appEnv != AppEnv.Production){
    contextMenu.insert(
      0,
      new MenuItem({
        label: "打开DevTools",
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
  tray.setToolTip("A Electron + Vue3 boilerplate");
  tray.setTitle("electron-vue3-boilerplate");

  return tray;
}

export { CreateAppTray };
