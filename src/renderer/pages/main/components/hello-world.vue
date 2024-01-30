<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <p>Edit any code to test HMR</p>
  </div>
  <p class="read-the-docs">
    Read <code>README.md</code> to learn more
  </p>
</template>

<script setup lang="ts">

defineProps({
  msg: { type: String, default: "" },
});

</script>

<style scoped>

.read-the-docs {
  font-size: 16px;
  color: #df1212;
}
</style>
