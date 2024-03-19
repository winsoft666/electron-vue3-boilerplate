/**
 * @file 实现创建Electron窗口的快捷指令
 */

const chalk = require("chalk");
const path = require("path");
const fs = require("fs");
const { ToCamelName } = require("./private/utils");

const outputTips = (message) => console.log(chalk.blue(`${message}`));
const outputSuccess = (message) => console.log(chalk.green(`${message}`));
const outputError = (error) => console.log(chalk.red(`${error}`));

let windowName = "";
let className = "";

outputTips("输入窗口名称:");

process.stdin.on("data", async(chunk) => {
  // Input page name
  windowName = String(chunk).trim().toString().toLowerCase();
  if(!windowName){
    outputError("窗口名称不能为空!");
    outputTips("\n输入窗口名称:");
    return;
  }

  className = ToCamelName(windowName);

  const targetPath = path.join(__dirname, "../src/main/windows", windowName);
  // Check whether page is exist or not
  const pageExists = fs.existsSync(targetPath);
  if(pageExists){
    outputError(`窗口 ${windowName} 已经存在!`);
    outputTips("\n输入窗口名称:");
    return;
  }

  fs.mkdirSync(targetPath);
  const sourcePath = path.join(__dirname, "template-ts/main-window");
  copyFile(sourcePath, targetPath);

  handleIndexTsFile(targetPath);
  handlePreloadTsFile(targetPath);

  process.stdin.emit("end");
});

function handleIndexTsFile(targetPath){
  const indexTsPath = path.join(targetPath, "index.ts");
  let code = fs.readFileSync(indexTsPath, { encoding: "utf-8" });

  code = code.replaceAll("XXXWindow", className + "Window");
  code = code.replaceAll("%renderer_page_name%", windowName);

  fs.writeFileSync(indexTsPath, code, { encoding: "utf-8" });
}

function handlePreloadTsFile(targetPath){
  const preloadTsPath = path.join(targetPath, "preload.ts");
  let code = fs.readFileSync(preloadTsPath, { encoding: "utf-8" });

  code = code.replaceAll("XXXWindow", className + "Window");

  fs.writeFileSync(preloadTsPath, code, { encoding: "utf-8" });
}

process.stdin.on("end", () => {
  outputSuccess(`Create ${windowName} window successful!`);
  process.exit();
});

const createDirectories = (path) => {
  if(!fs.existsSync(path)){
    fs.mkdirSync(path);
  }
};

const copyFile = (sourcePath, targetPath) => {
  const sourceFile = fs.readdirSync(sourcePath, { withFileTypes: true });

  sourceFile.forEach((file) => {
    const newSourcePath = path.resolve(sourcePath, file.name);
    const newTargetPath = path.resolve(targetPath, file.name);

    if(file.isDirectory()){
      createDirectories(newTargetPath);
      copyFile(newSourcePath, newTargetPath);
    }else{
      fs.copyFileSync(newSourcePath, newTargetPath);
    }
  });
};
