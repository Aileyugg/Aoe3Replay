<script setup>
import { onMounted, watch } from 'vue';

const props = defineProps({
  content: String,
  duration: Number,
  destroy: Function
})
// [content, duration, destroy]
onMounted(() => {
  setTimeout(() => props.destroy(), props.duration)
})

watch(props, () => {
  if (!props.content) props.destroy()
})
</script>

<template>
  <div class="dialog">
    <p>{{ content }}</p>
  </div>
</template>

<style lang="less" scoped>
.dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 240px;
  margin: 16vh auto;
  border-radius: 14px;
  padding: 16px;
  box-sizing: border-box;
  background: rgb(238 238 238 / 80%);
}

p {
  white-space: pre-wrap;
}
</style>