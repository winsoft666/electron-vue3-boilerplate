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
    <a-collapse-panel key="1" header="功能">
      <a-space>
        <a-button @click="onShowAppEnv">
          应用环境
        </a-button>
        <a-button @click="onGetAppVersion">
          应用版本
        </a-button>
        <a-button @click="onShowOtherEnv">
          其他环境变量
        </a-button>
        <a-button @click="onOpenHomepage">
          打开主页
        </a-button>
        <a-button @click="onOpenDevTools">
          调试工具
        </a-button>
        <a-button @click="onShowFramelessWindow">
          无边框窗口
        </a-button>
        <a-button @click="onGetFileMd5">
          文件MD5
        </a-button>
      </a-space>
    </a-collapse-panel>
    <a-collapse-panel key="2" header="应用配置">
      <a-space>
        <a-button @click="onClearAppConfiguration">
          清空应用配置
        </a-button>
        <a-button @click="onGetAppConfiguration">
          获取应用配置
        </a-button>
      </a-space>
    </a-collapse-panel>
    <a-collapse-panel key="3" header="文件下载">
      <a-form
        :model="fdState" 
        :label-col="{ span: 3 }" 
        name="fileDownload"
        autocomplete="off"
        @finish="onStartDownloadFile"
      >
        <a-form-item label="下载链接" name="url" :rules="[{ required: true, message: 'Please input file download url!' }]">
          <a-input v-model:value="fdState.url" />
        </a-form-item>
        <a-form-item label="保存路径" name="savePath" :rules="[{ required: true, message: 'Please input file save path!' }]">
          <a-input v-model:value="fdState.savePath" />
        </a-form-item>
        <a-form-item label="文件MD5" name="md5">
          <a-input v-model:value="fdState.md5" />
        </a-form-item>
        <a-form-item class="download-buttons">
          <a-button v-if="!fdState.downloading" type="primary" html-type="submit">
            下载
          </a-button>
          <a-button v-if="fdState.downloading" type="primary" @click="onCancelDownloadFile">
            取消
          </a-button>
          <a-progress style="margin-left: 20px;" type="circle" :size="28" :percent="fdState.percent" />
        </a-form-item>
      </a-form>
    </a-collapse-panel>
    <a-collapse-panel key="4" header="网络请求">
      <a-space>
        <a-button @click="onHttpGetInMainProcess">
          主进程HTTP请求
        </a-button>
        <a-button @click="onHttpGetInRendererProcess">
          渲染进程HTTP请求
        </a-button>
      </a-space>
    </a-collapse-panel>
  </a-collapse>

  <a-modal
    :open="showExitAppMsgbox"
    :confirm-loading="isExitingApp"
    :cancel-button-props="{ disabled: isExitingApp }"
    :closable="!isExitingApp"
    ok-text="确定"
    cancel-text="取消"
    @ok="onExitApp"
    @cancel="showExitAppMsgbox = false"
  >
    <div class="exit-msg-title">
      <font-awesome-icon
        icon="fa-solid fa-triangle-exclamation"
        color="#ff0000"
      /> 警告
    </div>
    <p>{{ isExitingApp ? "正在退出客户端......" : "您确定要退出客户端软件吗？" }}</p>
  </a-modal>

  <a-modal
    :open="showClosePrimaryWinMsgbox"
    title="警告"
    @ok="onMinPrimaryWinToTray"
    @cancel="showClosePrimaryWinMsgbox = false"
  >
    <template #footer>
      <a-button key="minimize" type="primary" @click="onMinPrimaryWinToTray">
        最小化
      </a-button>
      <a-button key="exit-app" :loading="isExitingApp" @click="onExitApp">
        退出
      </a-button>
    </template>
    <p>退出客户端软件将导致功能不可用，建议您最小化到系统托盘！</p>
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

// 显示当前客户端的环境（开发、测试、生产）
function onShowAppEnv(){
  message.success(`当前环境为：${import.meta.env.MODE}`);
}

// 演示如何获取其他环境变量
function onShowOtherEnv(){
  message.success(`BaseUrl: ${import.meta.env.VITE_BASE_URL}`);
}

function onShowFramelessWindow(){
  // 通知主进程显示无边框示例窗口
  getElectronApi().showFramelessSampleWindow();
}

function onOpenHomepage(){
  // 调用utils模块的方法打开外链
  utils.openExternalLink("https://github.com/winsoft666/electron-vue3-boilerplate");
}

// 打开当前窗口的调试工具
function onOpenDevTools(){
  utils.openDevTools();
}

// 获取应用版本号并显示
function onGetAppVersion(){
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
  message.success("清空应用配置成功！");
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
    message.success(`[${result.uuid}] 文件下载成功 (大小: ${result.fileSize})!`);
  }else if(result.canceled){
    message.warning(`[${result.uuid}] 用户取消！`);
  }else{
    message.error(`[${result.uuid}] 下载失败: ${result.error}!`);
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
// 这一步在非打包环境会报跨域错误，打包或使用loadFile加载index.html后，就不会报错了
function onHttpGetInRendererProcess(){
  const url = "https://baidu.com";
  axiosInst.get(url)
    .then((rsp) => {
      message.info(`在渲染进程请求 ${url} 成功！状态码：${rsp.status}`);
    })
    .catch((err) => {
      message.error(`在渲染进程请求 ${url} 失败！错误消息：${err.message}`);
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
