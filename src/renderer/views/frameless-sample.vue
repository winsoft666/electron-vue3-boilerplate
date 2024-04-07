<template>
  <div class="titlebar">
    <span class="title">无边框示例窗口</span>
    <div class="buttons">
      <div class="button" @click="onMinimizeWindow">
        <font-awesome-icon icon="fa-solid fa-minus" color="#9d9d9d" />
      </div>
      <div class="button" @click="onRestoreWindow">
        <font-awesome-icon icon="fa-solid fa-window-restore" color="#9d9d9d" />
      </div>
      <div class="button" @click="onCloseWindow">
        <font-awesome-icon icon="fa-solid fa-xmark" color="#9d9d9d" />
      </div>
    </div>
  </div>
  <div class="contents">
    <a-button @click="onOpenDevTools">
      Open DevTools
    </a-button>
  </div>
</template>
  
<script setup lang="ts">
import utils from "@utils/renderer";
  
function getElectronApi(){
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).framelessWindowAPI;
}
  
function onMinimizeWindow(){
  getElectronApi().minimizeWindow();
}
  
function onRestoreWindow(){
  getElectronApi().restoreWindow();
}
  
function onCloseWindow(){
  getElectronApi().closeWindow();
}
  
function onOpenDevTools(){
  utils.openDevTools();
}
</script>
  
  <style scoped>
  
  .titlebar {
    -webkit-app-region: drag;
    height: 36px;
    background-color: #1f1f1f;
  
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 0px 0 10px;
  }
  .title {
    font-size: 14px;
    font-weight: bold;
    color: #ffffff;
  }
  
  .buttons {
    display: flex;
    align-items: center;
    -webkit-app-region: no-drag;
  }
  
  .contents {
    display: flex;
    justify-content: center;
    padding-top: 50px;
  }
  .button {
    width: 36px;
    height: 36px;
    display: flex;
    justify-content: center;
    align-items: center;
  
    &:hover {
      background-color: #666666;
    }
  }
  
  </style>
  