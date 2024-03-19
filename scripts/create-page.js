/**
 * @file 实现创建Vue页面的快捷指令
 */

const chalk = require("chalk");
const path = require("path");
const fs = require("fs");
const { ToCamelName } = require("./private/utils");

const outputTips = (message) => console.log(chalk.blue(`${message}`));
const outputSuccess = (message) => console.log(chalk.green(`${message}`));
const outputError = (error) => console.log(chalk.red(`${error}`));

let pageName = "";

outputTips("输入页面名称:");

process.stdin.on("data", async(chunk) => {
  // Input page name
  pageName = String(chunk).trim().toString().toLowerCase();
  if(!pageName){
    outputError("页面名称不能为空!");
    outputTips("\n输入页面名称:");
    return;
  }

  const targetPath = path.join(__dirname, "../src/renderer/pages", pageName);
  // Check whether page is exist or not
  const pageExists = fs.existsSync(targetPath);
  if(pageExists){
    outputError(`页面 ${pageName} 已经存在!`);
    outputTips("\n输入页面名称:");
    return;
  }

  fs.mkdirSync(targetPath);
  const sourcePath = path.join(__dirname, "template-ts/renderer-page");
  copyFile(sourcePath, targetPath);

  handleVueFile(targetPath);
  
  process.stdin.emit("end");
});

process.stdin.on("end", () => {
  outputSuccess(`创建 ${pageName} 页面成功!`);
  process.exit();
});

const createDirectories = (path) => {
  if(!fs.existsSync(path)){
    fs.mkdirSync(path);
  }
};

function handleVueFile(targetPath){
  const filePath = path.join(targetPath, "App.vue");
  let code = fs.readFileSync(filePath, { encoding: "utf-8" });

  code = code.replaceAll("%renderer_page_name%", pageName);

  code = code.replaceAll("XXXWindowAPI", ToCamelName(pageName) + "WindowAPI");

  fs.writeFileSync(filePath, code, { encoding: "utf-8" });
}

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
