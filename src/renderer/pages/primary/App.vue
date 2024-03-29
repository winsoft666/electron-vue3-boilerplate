<template>
  <div class="logo">
    <a href="https://www.electronjs.org/" target="_blank">
      <img src="/electron.svg" class="logo electron" alt="Electron logo">
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="/vue.svg" class="logo vue" alt="Vue logo">
    </a>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo vite" alt="Vite logo">
    </a>
  </div>
  <HelloWorld msg="Electron + Vue3 + Vite" />

  <a-collapse v-model:activeKey="activeKey" class="collapse">
    <a-collapse-panel key="1" header="Utils">
      <a-space>
        <a-button @click="onShowFramelessWindow">
          Frameless Window
        </a-button>
        <a-button @click="onOpenHomepage">
          Homepage
        </a-button>
        <a-button @click="onOpenDevTools">
          DevTools
        </a-button>
        <a-button @click="onGetAppVersion">
          App Version
        </a-button>
        <a-button @click="onGetFileMd5">
          File MD5
        </a-button>
      </a-space>
    </a-collapse-panel>
    <a-collapse-panel key="2" header="App Configuration">
      <a-space>
        <a-button @click="onClearAppConfiguration">
          Clear App Configuration
        </a-button>
        <a-button @click="onGetAppConfiguration">
          Get App Configuration
        </a-button>
      </a-space>
    </a-collapse-panel>
    <a-collapse-panel key="3" header="File Download">
      <a-form
        :model="fdState" 
        :label-col="{ span: 3 }" 
        name="fileDownload"
        autocomplete="off"
        @finish="onStartDownloadFile"
      >
        <a-form-item label="Url" name="url" :rules="[{ required: true, message: 'Please input file download url!' }]">
          <a-input v-model:value="fdState.url" />
        </a-form-item>
        <a-form-item label="Save Path" name="savePath" :rules="[{ required: true, message: 'Please input file save path!' }]">
          <a-input v-model:value="fdState.savePath" />
        </a-form-item>
        <a-form-item label="File MD5" name="md5">
          <a-input v-model:value="fdState.md5" />
        </a-form-item>
        <a-form-item class="download-buttons">
          <a-button v-if="!fdState.downloading" type="primary" html-type="submit">
            Download
          </a-button>
          <a-button v-if="fdState.downloading" type="primary" @click="onCancelDownloadFile">
            Cancel
          </a-button>
          <a-progress style="margin-left: 20px;" type="circle" :size="28" :percent="fdState.percent" />
        </a-form-item>
      </a-form>
    </a-collapse-panel>
    <a-collapse-panel key="4" header="Network Request">
      <a-space>
        <a-button @click="onHttpGetInMainProcess">
          HTTP Get in main process
        </a-button>
        <a-button @click="onHttpGetInRendererProcess">
          HTTP Get in renderer process
        </a-button>
      </a-space>
    </a-collapse-panel>
  </a-collapse>

  <a-modal
    :open="showExitAppMsgbox"
    :confirm-loading="isExitingApp"
    :cancel-button-props="{ disabled: isExitingApp }"
    :closable="!isExitingApp"
    @ok="onExitApp"
    @cancel="showExitAppMsgbox = false"
  >
    <div class="exit-msg-title">
      <font-awesome-icon
        icon="fa-solid fa-triangle-exclamation"
        color="#ff0000"
      /> Warning
    </div>
    <p>{{ isExitingApp ? "Exiting App..." : "Are you sure to exit app?" }}</p>
  </a-modal>

  <a-modal
    :open="showClosePrimaryWinMsgbox"
    title="Important Choices"
    @ok="onMinPrimaryWinToTray"
    @cancel="showClosePrimaryWinMsgbox = false"
  >
    <template #footer>
      <a-button key="minimize" type="primary" @click="onMinPrimaryWinToTray">
        Minimize to Tray
      </a-button>
      <a-button key="exit-app" :loading="isExitingApp" @click="onExitApp">
        Exit App
      </a-button>
    </template>
    <p>Exiting the software will make the function unavailable, it is recommended to minimize it to the system tray!</p>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import log from "electron-log/renderer";
import HelloWorld from "./components/hello-world.vue";
import { message } from "ant-design-vue";
import fd from "../../../lib/file-download/renderer";
import * as fdTypes from "../../../lib/file-download/shared";
import utils from "../../../lib/utils/renderer";
import { GetErrorMessage } from "../../../lib/utils/shared";
import axiosInst from "../../../lib/axios-inst/renderer";

const activeKey = ref<number>(1);
const showExitAppMsgbox = ref<boolean>(false);
const showClosePrimaryWinMsgbox = ref<boolean>(false);
const isExitingApp = ref<boolean>(false);

function getElectronApi(){
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).primaryWindowAPI;
}

// 与文件下载相关的数据和状态
interface FileDownloadState {
  url : string;
  savePath: string;
  md5: string;
  downloading: boolean;
  uuid: string;
  percent: number;
}

const fdState = reactive<FileDownloadState>({
  url: "https://dldir1.qq.com/qqfile/qq/QQNT/bc30fb5d/QQ9.9.7.21217_x86.exe", 
  savePath: "QQ9.9.7.21217_x86.exe", 
  md5: "BC30FB5DB716D56012C8F0ECEE65CA20", 
  downloading: false, 
  uuid: "", 
  percent: 0
});

// 发送消息到主进程
getElectronApi().sendMessage("Hello from App.vue!");

// 当主进程通知显示退出程序前的消息弹窗时触发
getElectronApi().onShowExitAppMsgbox(() => {
  showExitAppMsgbox.value = true;
});

// 当主进程通知显示关闭主窗口前的消息弹窗时触发
getElectronApi().onShowClosePrimaryWinMsgbox(() => {
  showClosePrimaryWinMsgbox.value = true;
});

// 打印日志到文件
log.info("Log from the renderer process(App.vue)!");

function onShowFramelessWindow(){
  // 通知主进程显示无边框示例窗口
  getElectronApi().showFramelessSampleWindow();
}

function onOpenHomepage(){
  // 调用utils模块的方法打开外链
  utils.openExternalLink("https://github.com/winsoft666/electron-vue3-template");
}

function onOpenDevTools(){
  // 打开当前窗口的调试工具
  utils.openDevTools();
}

function onGetAppVersion(){
  // 获取应用版本号并显示
  message.success(utils.getAppVersion());
}

async function onGetFileMd5(){
  // 打开文件选择对话框
  const result = await utils.showOpenDialog({
    properties: [ "openFile" ],
    filters: [
      { name: "All Files", extensions: [ "*" ] }
    ]
  });

  if(result.filePaths.length > 0){
    // 计算文件MD5
    utils.getFileMd5(result.filePaths[0])
      .then((md5) => {
        message.success(md5);
      }).catch((e) => {
        message.error(GetErrorMessage(e));
      });
  }
}

function onClearAppConfiguration(){
  // 清空本地配置
  getElectronApi().clearAppConfiguration();
  message.success("Clear successful!");
}

function onGetAppConfiguration(){
  
}

// 开始下载文件
async function onStartDownloadFile(){
  // 文件下载选项
  const options = new fdTypes.Options();
  options.url = fdState.url;
  options.savePath = fdState.savePath;
  options.skipWhenMd5Same = true;
  options.verifyMd5 = !!fdState.md5;
  options.md5 = fdState.md5;
  options.feedbackProgressToRenderer = true;

  fdState.downloading = true;
  fdState.uuid = options.uuid;
  fdState.percent = 0;

  const result:fdTypes.Result = await fd.download(
    options, 
    (uuid: string, bytesDone: number, bytesTotal: number) => {
      // 文件下载进度反馈
      fdState.percent = Math.floor(bytesDone * 100 / bytesTotal);
    });
  
  fdState.downloading = false;
  if(result.success){
    message.success(`[${result.uuid}] Download Successful (size: ${result.fileSize})!`);
  }else if(result.canceled){
    message.warning(`[${result.uuid}] User Canceled!`);
  }else{
    message.error(`[${result.uuid}] Download Failed: ${result.error}!`);
  }
}

// 取消文件下载
async function onCancelDownloadFile(){
  fd.cancel(fdState.uuid);
}

// 测试在主进程中使用axios进行HTTP请求
function onHttpGetInMainProcess(){
  getElectronApi().httpGetRequest("https://baidu.com");
}

// 测试在渲染进程中使用axios进行HTTP请求
// 这一步在开发环境会报跨域，打包或使用loadFile加载index.html后，就不会报错了
function onHttpGetInRendererProcess(){
  const url = "https://baidu.com";
  axiosInst.get(url)
    .then((rsp) => {
      message.info(`Request ${url} in renderer process success! Status: ${rsp.status}`);
    })
    .catch((err) => {
      message.error(`Request ${url} in renderer process failed! Message: ${err.message}`);
    });
}

async function onExitApp(){
  isExitingApp.value = true;
  await getElectronApi().asyncExitApp();
  isExitingApp.value = false;
  showExitAppMsgbox.value = false;
}

function onMinPrimaryWinToTray(){
  showClosePrimaryWinMsgbox.value = false;
  getElectronApi().minToTray();
}
</script>

<style scoped>
.logo {
  height: 90px;
  padding: 20px 30px;
  margin-bottom: 20px;
  will-change: filter;
  transition: filter 300ms;
  text-align: center;
}

.logo.vite:hover {
  filter: drop-shadow(0 0 32px #646cffaa);
}

.logo.electron:hover {
  filter: drop-shadow(0 0 32px #2C2E39);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 32px #42b883aa);
}

.exit-msg-title {
  font-weight: bold;
  font-size: 14px;
}

.collapse {
  margin: 40px 20px 0px 20px;
  text-align: left;
}
.download-buttons {
  text-align: center;
}
</style>
