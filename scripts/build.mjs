import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import fsPromises from "fs/promises";
import chalk from "chalk";
import * as vite from "vite";
import { CompileTS } from "./private/tsc.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function buildRenderer(){
  return vite.build({
    configFile: path.join(__dirname, "../src/renderer/vite.config.mjs"),
    base: "./",
    mode: "production",
  });
}

function buildMain(){
  const mainPath = path.join(__dirname, "../src/main");
  return CompileTS(mainPath);
}

function copyStaticFiles(){
  return copyMainSubFiles("static");
}

/*
注意：Electron的工作目录是 build/main 而不是 src/main
tsc不能复制编译后的JS静态文件，所以需要手动复制编译后的文件到build/main
*/
function copyMainSubFiles(subPath){
  return fsPromises.cp(path.join(__dirname, "../src/main", subPath), path.join(__dirname, "../build/main", subPath), { recursive: true });
}

fs.rmSync(path.join(__dirname, "../build"), {
  recursive: true,
  force: true,
});

console.log(chalk.blueBright("Transpiling renderer & main..."));

Promise.allSettled([ buildRenderer(), buildMain(), copyStaticFiles() ])
  .then(() => {
    console.log(chalk.greenBright("Renderer & main successfully transpiled! (ready to be built with electron-forge)"));
  });
