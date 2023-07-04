<script setup>
import { ref } from 'vue'

defineProps({
  pages: Number
})

const emit = defineEmits(['update'])

let nowPage = ref(1)

function updatePage(page) {
  nowPage.value = page
  emit('update', page)
}
</script>

<template>
  <div class="pages">
    <div v-for="item in pages" @click="updatePage(item)" :class="{ active: nowPage === item }">{{ item }}</div>
  </div>
</template>

<style lang="less" scoped>
.pages {
  display: flex;
  margin-top: 10px;

  > div {
    margin: 0 10px 5px;
    border-radius: 6px;
    padding: 6px 12px;
    font-weight: 600;
    background: #aaa;
    cursor: pointer;
    user-select: none;
  }

  > .active {
    background: #9BC;
    cursor: default;
  }
}
</style>