/* eslint-disable */
const chalk = require("chalk");
const path = require("path");
const fs = require("fs");

const outputTips = (message) => console.log(chalk.blue(`${message}`));
const outputSuccess = (message) => console.log(chalk.green(`${message}`));
const outputError = (error) => console.log(chalk.red(`${error}`));

let callWay = "";
let funcName = "";
let funcType = "";
let humpFuncName = "";

function outputUsage(){
  outputTips("Create syntax: CallWay,FunctionName,FunctionType");
  outputTips("Call Way:\n\trm = Renderer process call the function of main process\n\tmr = Main process call the function of renderer process (Ignore FunctionType)");
  outputTips("Function Name:\n\txxx-xxx-xxx");
  outputTips("Function Type:\n\ta = Asynchronous call without result\n\tap = Asynchronous call with promise result\n\ts = Synchronous call with result");
}

outputUsage();
outputTips("Input:");

process.stdin.on("data", async(chunk) => {
  const inputStr = String(chunk).trim().toString().toLowerCase();
  const values = inputStr.split(",");
  if(values.length < 2){
    outputError("Syntax error!");
    outputTips("\nInput:");
    return;
  }

  callWay = values.at(0);
  funcName = values.at(1);
  if(values.length > 2)
    funcType = values.at(2);

  if(callWay != "rm" && callWay != "mr"){
    outputError("Call way type error!");
    outputTips("\nInput:");
    return;
  }

  if(!funcName){
    outputError("Function name can not be empty!");
    outputTips("\nInput:");
    return;
  }

  if(callWay == "rm"){
    if(funcType != "a" && funcType != "ap" && funcType != "s"){
      outputError("Function type error!");
      outputTips("\nInput:");
      return;
    }
  }

  humpFuncName = toHumpFunctionName(funcName);
  if(callWay == "rm"){
    handleMainIndex_rm();
    handleProload_rm();
    handleRendererIndex_rm();
  }else if(callWay == "mr"){
    handleMainIndex_mr();
    handleProload_mr();
    handleRendererIndex_mr();
  }

  process.stdin.emit("end");
});

function toHumpFunctionName(funcName){
  let funcNameCopy = funcName;
  let offset = 0;
  for (;;){
    const pos = funcNameCopy.indexOf("-", offset);
    if(pos == -1){
      humpFuncName += funcNameCopy.charAt(0).toUpperCase();
      humpFuncName += funcNameCopy.substring(1);
      break;
    }

    const slice = funcNameCopy.substring(0, pos);
    humpFuncName += slice.charAt(0).toUpperCase();
    humpFuncName += slice.substring(1);

    funcNameCopy = funcNameCopy.substring(pos + 1);
  }
  humpFuncName = humpFuncName.charAt(0).toLowerCase() + humpFuncName.substring(1);
  return humpFuncName;
}

function handleMainIndex_rm(){
  const filePath = path.join(__dirname, "../src/lib/utils/main/index.ts");
  let code = fs.readFileSync(filePath, { encoding: "utf-8" });

  let funcFlag = "";
  let ipcMainFunctionName = "";
  if(funcType == "ap"){
    funcFlag = "async";
    ipcMainFunctionName = "handle";
  }else{
    ipcMainFunctionName = "on";
  }

  const generateCode = `ipcMain.${ipcMainFunctionName}("electron-utils-${funcName}", ${funcFlag}(event) => {
});
// === FALG LINE (DO NOT MODIFY/REMOVE) ===`;

  code = code.replace("// === FALG LINE (DO NOT MODIFY/REMOVE) ===", generateCode);

  fs.writeFileSync(filePath, code, { encoding: "utf-8" });
}

function handleProload_rm(){
  const filePath = path.join(__dirname, "../src/lib/utils/main/utils-preload.ts");
  let code = fs.readFileSync(filePath, { encoding: "utf-8" });
  
  let ipcRendererFuncName = "";
  if(funcType == "ap"){
    ipcRendererFuncName = "invoke";
  }else if(funcType == "a"){
    ipcRendererFuncName = "send";
  }else if(funcType == "s"){
    ipcRendererFuncName = "sendSync";
  }
  
  const generateCode = `        ${humpFuncName}: () => ipcRenderer.${ipcRendererFuncName}("electron-utils-${funcName}"),
        // === FALG LINE (DO NOT MODIFY/REMOVE) ===`;
  
  code = code.replace("        // === FALG LINE (DO NOT MODIFY/REMOVE) ===", generateCode);
  
  fs.writeFileSync(filePath, code, { encoding: "utf-8" });
}

function handleRendererIndex_rm(){
  const filePath = path.join(__dirname, "../src/lib/utils/renderer/index.ts");
  let code = fs.readFileSync(filePath, { encoding: "utf-8" });
    
  let funcFlag = "";
  if(funcType == "ap"){
    funcFlag = " async";
  }

  let callFlag = "";
  if(funcType == "ap"){
    callFlag = " await";
  }
  
  const generateCode = `  public${funcFlag} ${humpFuncName}(){
    return${callFlag} (window as any).__ElectronUtils__.${humpFuncName}();
  }
  // === FALG LINE (DO NOT MODIFY/REMOVE) ===`;
    
  code = code.replace("  // === FALG LINE (DO NOT MODIFY/REMOVE) ===", generateCode);
    
  fs.writeFileSync(filePath, code, { encoding: "utf-8" });
}

function handleMainIndex_mr(){
  const filePath = path.join(__dirname, "../src/lib/utils/main/index.ts");
  let code = fs.readFileSync(filePath, { encoding: "utf-8" });
    
  const generateCode = `  public ${humpFuncName}(browserWindow: BrowserWindow | null){
    if(browserWindow){
      browserWindow.webContents.send("electron-utils-${funcName}");
    }
  }
  // === PUBLIC METHOD FALG LINE (DO NOT MODIFY/REMOVE) ===`;
    
  code = code.replace("  // === PUBLIC METHOD FALG LINE (DO NOT MODIFY/REMOVE) ===", generateCode);
    
  fs.writeFileSync(filePath, code, { encoding: "utf-8" });
}

function handleProload_mr(){
  const filePath = path.join(__dirname, "../src/lib/utils/main/utils-preload.ts");
  let code = fs.readFileSync(filePath, { encoding: "utf-8" });

  const humpFuncNameUpper = humpFuncName.charAt(0).toUpperCase() + humpFuncName.substring(1);
  
  const generateCode = `        on${humpFuncNameUpper}: (callback) => ipcRenderer.on("electron-utils-${funcName}", (event) => {
          callback();
        }),
        // === FALG LINE (DO NOT MODIFY/REMOVE) ===`;
  
  code = code.replace("        // === FALG LINE (DO NOT MODIFY/REMOVE) ===", generateCode);
  
  fs.writeFileSync(filePath, code, { encoding: "utf-8" });
}

function handleRendererIndex_mr(){
  const filePath = path.join(__dirname, "../src/lib/utils/renderer/index.ts");
  let code = fs.readFileSync(filePath, { encoding: "utf-8" });
    
  const humpFuncNameUpper = humpFuncName.charAt(0).toUpperCase() + humpFuncName.substring(1);
  
  const generateCode = `  public on${humpFuncNameUpper}(callback){
    (window as any).__ElectronUtils__.on${humpFuncNameUpper}(callback);
  }
  // === FALG LINE (DO NOT MODIFY/REMOVE) ===`;
    
  code = code.replace("  // === FALG LINE (DO NOT MODIFY/REMOVE) ===", generateCode);
    
  fs.writeFileSync(filePath, code, { encoding: "utf-8" });
}

process.stdin.on("end", () => {
  if(callWay == "mr"){
    const humpFuncNameUpper = humpFuncName.charAt(0).toUpperCase() + humpFuncName.substring(1);
    outputSuccess(`Create IPC (Main -> Renderer) function successful!\n\n[Usage]\n  Main process:\n\tutils.${humpFuncName}(...)\n  Renderer process:\n\tutils.on${humpFuncNameUpper}(...)`);
  }else if(callWay == "rm"){
    outputSuccess(`Create IPC (Renderer -> Main) function successful!\n\n[Usage]\n  Renderer process:\n\tutils.${humpFuncName}(...)`);
  }
  process.exit();
});
