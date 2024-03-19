<template>
  <div>
    {{ pageName }}
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const pageName = ref<string>("%renderer_page_name%");

function getElectronApi(){
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).XXXWindowAPI;
}

getElectronApi().sendMessage(`Page ${pageName.value} created successfully!`);
</script>

<style scoped>
</style>
