<template>
  <h1 class="msg">
    {{ msg }}
  </h1>
</template>

<script setup lang="ts">

defineProps({
  msg: { type: String, default: "" },
});

</script>

<style scoped>
.msg {
  font-size: 38px;
  font-weight: bold;
  margin: 10px;
  text-align: center;
}
</style>
