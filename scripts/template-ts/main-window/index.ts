import path from "path";
import { ipcMain } from "electron";
import WindowBase from "../window-base";

class XXXWindow extends WindowBase{
  constructor(){
    // 调用WindowBase构造函数创建窗口
    super({
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
      },
    });

    this.openRouter("/ROUTER-PATH");
  }

  protected registerIpcMainHandler(): void{
    // 一个简单的 IPC 示例
    ipcMain.on("send-message", (event, message) => {
      console.log(message);
    });

    // 添加更多的 ipcMain 处理函数
  }
}

export default XXXWindow;