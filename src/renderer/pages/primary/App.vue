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
const isExitingApp = ref<boolean>(false);

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

window.electronAPI.sendMessage("Hello from App.vue!");

window.electronAPI.onShowExitAppMsgbox(() => {
  showExitAppMsgbox.value = true;
});

log.info("Log from the renderer process(App.vue)!");

function onShowFramelessWindow(){
  window.electronAPI.showFramelessSampleWindow();
}

function onOpenHomepage(){
  utils.openExternalLink("https://github.com/winsoft666/electron-vue3-template");
}

function onOpenDevTools(){
  utils.openDevTools();
}

function onGetAppVersion(){
  message.success(utils.getAppVersion());
}

async function onGetFileMd5(){
  const result = await utils.showOpenDialog({
    properties: [ "openFile" ],
    filters: [
      { name: "All Files", extensions: [ "*" ] }
    ]
  });

  if(result.filePaths.length > 0){
    utils.getFileMd5(result.filePaths[0])
      .then((md5) => {
        message.success(md5);
      }).catch((e) => {
        message.error(GetErrorMessage(e));
      });
  }
}

function onClearAppConfiguration(){
  window.electronAPI.clearAppConfiguration();
  message.success("Clear successful!");
}

function onGetAppConfiguration(){
  
}

async function onStartDownloadFile(){
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

  const result:fdTypes.Result = await fd.download(options, (uuid: string, bytesDone: number, bytesTotal: number) => {
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

async function onCancelDownloadFile(){
  fd.cancel(fdState.uuid);
}

function onHttpGetInMainProcess(){
  window.electronAPI.httpGetRequest("https://baidu.com");
}

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
  await window.electronAPI.asyncExitApp();
  isExitingApp.value = false;
  showExitAppMsgbox.value = false;
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
