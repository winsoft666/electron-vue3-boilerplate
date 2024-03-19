/* eslint-disable */
const fsPromises = require("fs/promises")
const path = require("path")

module.exports = {
  packagerConfig: {
    name: "Electron-Vue3-Template",
    appCopyright: "Copyright (C) 2024",
    icon: "./setup/exe.ico",
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
      ProductName: "electron-vue-template",
      CompanyName: "",
      FileDescription: "A Electron + Vue3 template",
      // 如果安装包需要以管理员权限运行，请打开下面的注释
      // "requested-execution-level": "requireAdministrator",
    },
    asar: true,
  },
  hooks: {
    packageAfterCopy: async(config, buildPath, electronVersion, platform, arch) => {
      // Remove folders.
      //await fsPromises.rmdir(path.join(buildPath, "src"), { recursive: true })
    },
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        // certificateFile: './cert.pfx',
        // certificatePassword: process.env.CERTIFICATE_PASSWORD
      },
    },
    {
      name: "@electron-forge/maker-dmg",
      config: {
        // background: './assets/dmg-background.png',
        format: "ULFO",
      },
    },
    {
      name: "@electron-forge/maker-zip",
    },
  ],
}
