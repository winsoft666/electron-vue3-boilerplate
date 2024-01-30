<template>
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo">
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="/vue.svg" class="logo vue" alt="Vue logo">
    </a>
  </div>
  <HelloWorld msg="Electron + Vue3" />

  <a-space>
    <a-button @click="onShowFramelessWindow">
      Frameless Window
    </a-button>
    <a-button>
      Show
    </a-button>
    <a-button>
      Dialog
    </a-button>
  </a-space>
  
  <div class="funcSub">
    <p class="funcTitle">
      File Download Sample
    </p>
    <a-form
      class="fileDownloadForm"
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
      <a-form-item>
        <a-button v-if="!fdState.downloading" type="primary" html-type="submit">
          Download
        </a-button>
        <a-button v-if="fdState.downloading" type="primary" @click="onCancelDownloadFile">
          Cancel
        </a-button>
        <a-progress style="margin-left: 20px;" type="circle" :size="28" :percent="fdState.percent" />
      </a-form-item>
    </a-form>
  </div>

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
import * as fd from "../shared/file-download-types";

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
  url: "",
  savePath: "",
  md5: "",
  downloading: false,
  uuid: "",
  percent: 0
});

window.electronAPI.sendMessage("Hello from App.vue!");

window.electronAPI.onShowExitAppMsgbox(() => {
  showExitAppMsgbox.value = true;
});

window.electronAPI.onFileDownloadPrgressFeedback((uuid: string, bytesDone: number, bytesTotal: number) => {
  fdState.percent = Math.floor(bytesDone * 100 / bytesTotal);
});

log.info("Log from the renderer process(App.vue)!");

function onShowFramelessWindow(){
  window.electronAPI.showFramelessSampleWindow();
}

async function onStartDownloadFile(){
  const options = new fd.Options();
  options.url = fdState.url;
  options.savePath = fdState.savePath;
  options.skipWhenMd5Same = true;
  options.verifyMd5 = !!fdState.md5;
  options.md5 = fdState.md5;
  options.feedbackProgressToRenderer = true;

  fdState.downloading = true;
  fdState.uuid = options.uuid;
  fdState.percent = 0;

  const result:fd.Result = await window.electronAPI.asyncDownloadFile(options);
  
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
  window.electronAPI.cancelDownloadFile(fdState.uuid);
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

.funcSub {
  background-color: antiquewhite;
  margin: 10px 10px;
  padding: 6px 6px;
  border-radius: 6px;
}
.funcTitle {
  text-align: left;
  font-size: 16px;
  font-weight: bold;
}
.fileDownloadForm {
  padding: 6px 12px;
}
</style>
