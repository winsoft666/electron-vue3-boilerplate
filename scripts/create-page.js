const chalk = require("chalk");
const path = require("path");
const fs = require("fs");

const outputTips = (message) => console.log(chalk.blue(`${message}`));
const outputSuccess = (message) => console.log(chalk.green(`${message}`));
const outputError = (error) => console.log(chalk.red(`${error}`));

let pageName = "";

outputTips("Input page name:");

process.stdin.on("data", async(chunk) => {
  // Input page name
  pageName = String(chunk).trim().toString().toLowerCase();
  if(!pageName){
    outputError("Name is empty!");
    outputTips("\nInput page name:");
    return;
  }

  const targetPath = path.join(__dirname, "../src/renderer/pages", pageName);
  // Check whether page is exist or not
  const pageExists = fs.existsSync(targetPath);
  if(pageExists){
    outputError(`Page ${pageName} has already exist!`);
    outputTips("\nInput page name:");
    return;
  }

  fs.mkdirSync(targetPath);
  const sourcePath = path.join(__dirname, "template-ts/renderer-page");
  copyFile(sourcePath, targetPath);

  handleVueFile(targetPath);
  
  process.stdin.emit("end");
});

process.stdin.on("end", () => {
  outputSuccess(`Create ${pageName} page successful!`);
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
