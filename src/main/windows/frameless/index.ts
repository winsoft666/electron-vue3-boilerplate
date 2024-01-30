import path from "path";
import { BrowserWindow, app } from "electron";

function CreateFramelessWindow() : BrowserWindow{
  const win = new BrowserWindow({
    width: 600,
    height: 360,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  
  if(process.env.NODE_ENV === "development"){
    const rendererPort = process.argv[2];
    win.loadURL(`http://localhost:${rendererPort}/pages/frameless/index.html`);
  }else{
    win.loadFile(path.join(app.getAppPath(), "build/renderer/pages/frameless/index.html"));
  }
    
  return win;
}

export {
  CreateFramelessWindow
};