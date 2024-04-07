/* eslint-disable */
const fsPromises = require("fs/promises");
const fs = require("fs");
const path = require("path");

async function prunePackageJson(buildPath) {
  const packageDotJsonPath = path.join(buildPath, "package.json");
  const content = await fsPromises.readFile(packageDotJsonPath);
  const json = JSON.parse(content.toString());
  Object.keys(json).forEach((key) => {
      switch (key) {
          case 'name': {
              break;
          }
          case 'version': {
              break;
          }
          case 'main': {
              break;
          }
          case 'author': {
              break;
          }
          case 'description': {
              break;
          }
          default: {
              delete json[key];
              break;
          }
      }
  });
  await fsPromises.writeFile(packageDotJsonPath, JSON.stringify(json, null, "\t"));
}

module.exports = {
  packagerConfig: {
    name: "Electron-Vue3-Boilerplate",
    appCopyright: "Copyright (C) 2024",
    icon: "./setup/exe.ico",
    // ElectronForge默认会将项目根目录下的所有文件及目录打包到resources
    // 因此需要在这里忽略不需要打入到安装包的文件和目录
    // 对于node_modules目录，只会打包dependencies依赖项
    // 不支持正则表达式
    ignore: [
      ".vscode",
      "node_modules/.vite",
      "node_modules/.ignored",
      "node_modules/.cache",
      "README.md",
      "yarn.lock",
      "vite.config.js",
      "forge.config.js",
      ".gitignore",
      ".eslintrc.js",
      ".eslintignore",
      ".prettierignore",
      ".prettierrc.js",
      "LICENSE",
      "^(\/src$)",
      "^(\/scripts$)",
      "^(\/out$)",
      "^(\/setup$)",
      "^(\/screenshot$)",
    ],
    win32metadata: {
      ProductName: "electron-vue-boilerplate",
      CompanyName: "",
      FileDescription: "A Electron + Vue3 + Vite Boilerplate",
      // 如果安装包需要以管理员权限运行，请打开下面的注释
      // "requested-execution-level": "requireAdministrator",
    },
    // 是否使用asar压缩资源
    asar: true,
  },
  // 定义钩子，更多钩子请参考：https://www.electronforge.io/config/hooks
  hooks: {
    // 在文件拷贝完成后触发
    packageAfterCopy: async(config, buildPath, electronVersion, platform, arch) => {
      // 比如在拷贝完成后需要删除src目录
      //await fsPromises.rmdir(path.join(buildPath, "src"), { recursive: true });

      // 精简package.json，删除无需暴露的属性
      await prunePackageJson(buildPath);
    },
  },
  rebuildConfig: {},
  // Maker用于最终生成对应平台的安装包
  // 更多Maker请参考：https://www.electronforge.io/config/makers
  makers: [
    {
      // 仅支持Windows平台
      name: "@electron-forge/maker-squirrel",
      config: {
        // 用于数字签名的证书路径和密码
        // certificateFile: './cert.pfx',
        // certificatePassword: process.env.CERTIFICATE_PASSWORD
      },
    },
    {
      // 仅支持macOS平台
      name: "@electron-forge/maker-dmg",
      config: {
        // background: './assets/dmg-background.png',
        format: "ULFO",
      },
    },
    {
      // 创建一个zip压缩包，支持所有平台
      name: "@electron-forge/maker-zip",
    },
  ],
}
