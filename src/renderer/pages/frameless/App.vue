<template>
  <div class="titlebar">
    <span class="title">Frameless Window Sample</span>
    <div class="buttons">
      <div class="button" @click="onMinimizeWindow">
        <font-awesome-icon icon="fa-solid fa-minus" color="#9d9d9d" />
      </div>
      <div class="button" @click="onRestoreWindow">
        <font-awesome-icon icon="fa-regular fa-window-restore" color="#9d9d9d" />
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
import utils from "../../../lib/utils/renderer";

function onMinimizeWindow(){
  window.electronAPI.minimizeWindow();
}

function onRestoreWindow(){
  window.electronAPI.restoreWindow();
}

function onCloseWindow(){
  window.electronAPI.closeWindow();
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
  font-size: 16px;
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
