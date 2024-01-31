<template>
  <div class="logo">
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo">
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="/vue.svg" class="logo vue" alt="Vue logo">
    </a>
  </div>
  <HelloWorld msg="Electron + Vue3" />

  <a-collapse v-model:activeKey="activeKey" class="collapse">
    <a-collapse-panel key="1" header="Functional Display">
      <a-space>
        <a-button @click="onShowFramelessWindow">
          Frameless Window
        </a-button>
        <a-button @click="onOpenHomepage">
          Homepage
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
    <a-collapse-panel key="3" header="File Download Sample">
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
  url: "https://static.deskdiy.com/package/2024/01/25IV790M/DeskDIY_008_5.7.6.1.exe", 
  savePath: "E:\\test.exe", 
  md5: "614C78D842C4AD778326A20E04FDB01D", 
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

async function onExitApp(){
  isExitingApp.value = true;
  await window.electronAPI.asyncExitApp();
  isExitingApp.value = false;
  showExitAppMsgbox.value = false;
}
</script>

<style scoped>
.logo {
  height: 68px;
  padding: 10px 50px;
  will-change: filter;
  transition: filter 300ms;
  text-align: center;
}

.logo:hover {
  filter: drop-shadow(0 0 32px #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 32px #42b883aa);
}

.exit-msg-title {
  font-weight: bold;
  font-size: 14px;
}

.collapse {
  margin: 20px;
  text-align: left;
}
.download-buttons {
  text-align: center;
}
</style>
