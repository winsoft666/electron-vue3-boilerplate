<template>
  <div>
    {{ pageName }}
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const pageName = ref<string>("%renderer_page_name%");

window.electronAPI.sendMessage(`Page ${pageName.value} created successfully!`);
</script>

<style scoped>
</style>
