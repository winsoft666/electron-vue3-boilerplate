/**
 * @file 实现创建IPC函数的快捷指令
 */

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
  outputTips("创建语法: 调用方向,函数名称,函数类型");
  outputTips("调用方向:\n\trm = 渲染进程调用主进程的函数\n\tmr = 主进程调用渲染进程的函数（忽略函数类型）");
  outputTips("函数名称:\n\txxx-xxx-xxx");
  outputTips("函数类型:\n\ta = 异步调用, 不带返回值\n\tap = 异步调用, 带Promise类型的返回值\n\ts = 同步调用, 带返回值");
}

outputUsage();
outputTips("输入指令:");

process.stdin.on("data", async(chunk) => {
  const inputStr = String(chunk).trim().toString().toLowerCase();
  const values = inputStr.split(",");
  if(values.length < 2){
    outputError("语法错误!");
    outputTips("\n输入指令:");
    return;
  }

  callWay = values.at(0);
  funcName = values.at(1);
  if(values.length > 2)
    funcType = values.at(2);

  if(callWay != "rm" && callWay != "mr"){
    outputError("调用方向类型错误!");
    outputTips("\n输入指令:");
    return;
  }

  if(!funcName){
    outputError("函数名称不能为空!");
    outputTips("\n输入指令:");
    return;
  }

  if(callWay == "rm"){
    if(funcType != "a" && funcType != "ap" && funcType != "s"){
      outputError("函数类型不能为空!");
      outputTips("\n输入指令:");
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
