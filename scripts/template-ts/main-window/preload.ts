import { contextBridge, ipcRenderer } from "electron";

/*
暴露XXXWindow窗口主进程的方法到XXXWindow窗口的渲染进程
*/
contextBridge.exposeInMainWorld("XXXWindowAPI", {
  // 一个简单的示例
  sendMessage: (message) => ipcRenderer.send("send-message", message),

  // 暴露更多的API到渲染进程...
});
