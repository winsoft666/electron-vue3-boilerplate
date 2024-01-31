<template>
  <h1 class="msg">
    {{ msg }}
  </h1>

  <div class="card">
    <p>Edit any code to test HMR and read <code>README.md</code> to learn more.</p>
  </div>
</template>

<script setup lang="ts">

defineProps({
  msg: { type: String, default: "" },
});

</script>

<style scoped>
.msg {
  margin: 10px;
  text-align: center;
}
.card {
  margin: 10px;
  font-size: 16px;
  color: #303841;
  text-align: center;
}
</style>
