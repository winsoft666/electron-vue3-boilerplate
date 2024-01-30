import path from "path";
import { BrowserWindow, app } from "electron";

function CreateFramelessWindow() : BrowserWindow{
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
    
  if(process.env.NODE_ENV === "development"){
    const rendererPort = process.argv[2];
    win.loadURL(`http://localhost:${rendererPort}/frameless-window`);
  }else{
    win.loadFile(path.join(app.getAppPath(), "build/renderer/index.html"));
  }
    
  return win;
}

export {
  CreateFramelessWindow
};