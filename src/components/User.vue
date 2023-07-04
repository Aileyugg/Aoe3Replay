<script setup>
import { ref, computed } from 'vue';
import { verifyToken } from '@/modules'
import { useRouter } from "vue-router";

const router = useRouter()
const userName = ref()
const isLogin = ref(false)

defineExpose({
  userName
})

const isShowUpload = (() => {
  if (router.currentRoute.value.path === '/replay') return false
  return true
})()

const tokenName = verifyToken()
if (tokenName) {
  userName.value = tokenName
  isLogin.value = true
}

const state = computed(() => {
  if (isLogin.value) return '退出登录'
  return '点击登录'
})

function login() {
  if (!isLogin.value) return router.push('/login')
  localStorage.removeItem('token')
  localStorage.removeItem('uid')
  location.reload()
}

</script>

<template>
  <div class="user">
    <div class="info">
      <img src="/images/avatar/avatar_tier0_Starter_01.png" alt="">
      <span class="name">{{ userName || '当前未登录' }}</span>
      <span class="state" @click="login">{{ state }}</span>
    </div>
    <button class="upload" v-if="isShowUpload" @click="router.push('/replay')">我要上传录像</button>
  </div>
</template>

<style lang="less" scoped>
.user {
  display: flex;
  padding: 24px 30px 42px;
  border-radius: 14px;
  background: rgba(238, 238, 238, 0.8);
  flex-direction: column;
  align-items: stretch;
}

.info {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  grid-template-rows: 1fr 1fr;
  align-items: center;
  justify-items: start;

  > img {
    height: 65px;
    border-radius: 50%;
    grid-row: 1 / 3;
  }

  > .name {
    font-size: 18px;
    font-weight: 600;
  }

  > .state {
    color: #2a82e4;
    cursor: pointer;
  }
}

.upload {
  margin-top: 24px;
  border-radius: 8px;
  padding: 10px;
  background: #C79037;
}
</style>