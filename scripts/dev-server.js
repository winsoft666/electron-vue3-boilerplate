process.env.NODE_ENV = "development";

const childProcess = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");
const { EOL } = require("node:os");
const vite = require("vite");
const chalk = require("chalk");
const chokidar = require("chokidar");
const electron = require("electron");
const compileTs = require("./private/tsc");

let viteServer = null;
let electronProcess = null;
let electronProcessLocker = false;
let rendererPort = 0;

async function startRenderer(){
  viteServer = await vite.createServer({
    configFile: path.join(__dirname, "..", "vite.config.js"),
    mode: "development",
  });

  return viteServer.listen();
}

async function startElectron(){
  if(electronProcess){
    // single instance lock
    return;
  }

  try {
    await compileTs(path.join(__dirname, "..", "src"));
  } catch {
    console.log(chalk.redBright("Could not start Electron because of the above typescript error(s)."));
    electronProcessLocker = false;
    return;
  }

  const args = [ path.join(__dirname, "..", "build", "main", "main.js"), rendererPort ];
  const electronPath = electron;
  electronProcess = childProcess.spawn(electronPath, args);
  electronProcessLocker = false;

  electronProcess.stdout.on("data", (data) => {
    if(data == EOL)
      return;

    process.stdout.write(chalk.blueBright("[electron] ") + chalk.white(data.toString()));
  });

  electronProcess.stderr.on("data", (data) => {
    process.stderr.write(chalk.blueBright("[electron] ") + chalk.white(data.toString()));
  });

  electronProcess.on("exit", () => stop());
}

function restartElectron(){
  if(electronProcess){
    electronProcess.removeAllListeners("exit");
    electronProcess.kill();
    electronProcess = null;
  }

  if(!electronProcessLocker){
    electronProcessLocker = true;
    startElectron();
  }
}

function copyStaticFiles(){
  copyMainSubFiles("static");
}

/*
The working dir of Electron is build/main instead of src/main because of TS.
tsc does not copy static files, so copy them over manually for dev server.
*/
function copyMainSubFiles(subPath){
  fs.cpSync(path.join(__dirname, "..", "src", "main", subPath), path.join(__dirname, "..", "build", "main", subPath), { recursive: true });
}

function stop(){
  viteServer.close();
  process.exit();
}

async function start(){
  console.log(`${chalk.greenBright("=========================================")}`);
  console.log(`${chalk.greenBright("Starting Electron + Vue3 Dev Server...")}`);
  console.log(`${chalk.greenBright("=========================================")}`);

  const devServer = await startRenderer();
  rendererPort = devServer.config.server.port;

  copyStaticFiles();
  startElectron();
  
  const mainFolder = path.join(__dirname, "..", "src", "main");
  chokidar.watch(mainFolder, {
    cwd: mainFolder,
  })
    .on("change", (mainFolder) => {
      console.log(`${chalk.blueBright("[electron] ")}Change in ${mainFolder}. reloading... 🚀`);

      if(mainFolder.startsWith(path.join("static", "/")))
        copyMainSubFiles(mainFolder);

      restartElectron();
    });
}

start();
