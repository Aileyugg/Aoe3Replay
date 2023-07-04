<script setup>
import { url } from '@/modules/global';
import { sleep } from '@/modules'
import { ref, computed, reactive, watch } from 'vue'
import { dialogMsg } from '@/modules/components.js'
import { useRouter } from "vue-router";

const router = useRouter()
const isLogin = ref(true)

const content = computed(() => {
  if (isLogin.value) return {
    title: '登录帐号',
    submit: '登录',
    switch: '注册帐号'
  }
  return {
    title: '注册帐号',
    submit: '注册',
    switch: '返回登录'
  }
})

const inputForm = reactive({ userName: '', password: '', verify: '', invite: '' })

let timeout
watch(() => inputForm.verify, () => {
  clearInterval(timeout)
  timeout = setTimeout(() => {
    if (inputForm.verify !== inputForm.password) dialogMsg('密码不一致');
  }, 2400);
})

async function submit(event) {
  let submitUrl
  let submitBody
  if (inputForm.userName === '') return dialogMsg('用户名不能为空')
  if (inputForm.password === '') return dialogMsg('密码不能为空')

  const nameExp = /^[a-zA-Z0-9]{5,12}$/
  if (!nameExp.test(inputForm.userName)) return dialogMsg('用户名格式错误\r\n只能为英文字母，数字\r\n长度为5~12位')

  if (isLogin.value) {
    submitUrl = `${url}api/login`
    submitBody = {
      userName: inputForm.userName,
      password: inputForm.password
    }
  } else {
    submitUrl = `${url}api/register`
    submitBody = inputForm
    if (inputForm.verify === '') return dialogMsg('密码不能为空')
    if (inputForm.invite === '') return dialogMsg('邀请码不能为空')
  }
  const { code, token, msg, uid } = await fetch(submitUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(submitBody)
  }).then((res) => res.json())

  if (code) {
    localStorage.setItem('token', token)
    localStorage.setItem('uid', uid)
    event.target.classList.add('disable')
    dialogMsg('登录成功，3秒后跳转页面')
    await sleep(3000)
    router.push('/')
  }
  dialogMsg(msg)
}

function register() {
  isLogin.value = !isLogin.value
}
</script>

<template>
  <div class="login">
    <header>{{ content.title }}</header>
    <div class="form">
      <label>用户名：</label>
      <input type="text" placeholder="请输入用户名" v-model="inputForm.userName">
      <label>密码：</label>
      <input type="password" placeholder="请输入密码" v-model="inputForm.password" @keyup.enter="submit">
    </div>
    <div class="form" v-if="!isLogin">
      <label>确认密码：</label>
      <input type="password" placeholder="请确认密码" v-model="inputForm.verify">
      <label>
        <i class="ifont icon-help" title="邀请码必须要填，想要的联系我的QQ：1580515248"></i>
        <span>邀请码：</span>
      </label>
      <input type="text" placeholder="请输入邀请码" v-model="inputForm.invite">
    </div>
    <button @click="submit">{{ content.submit }}</button>
    <div class="more">
      <a v-show="isLogin">忘记密码</a>
      <a @click="register">{{ content.switch }}</a>
    </div>
  </div>
</template>

<style lang="less" scoped>
.login {
  display: flex;
  width: 430px;
  margin: 10vh auto auto 30vw;
  border-radius: 14px;
  padding: 24px 30px 36px;
  box-sizing: border-box;
  background: rgb(238 238 238 / 80%);
  flex-direction: column;
}

.disable {
  pointer-events: none;
}

header {
  margin: 12px;
  font-size: 20px;
  font-weight: 700;
  text-align: center;
}

.form {
  display: flex;
  flex-direction: column;

  > label {
    display: flex;
    padding: 6px;

    > .icon-help {
      font-size: 19px;
      margin-right: 4px;
    }
  }

  > input {
    padding: 10px 24px;
    border: 0;
    border-radius: 8px;
    font-size: 16px;

    &:focus {
      outline: solid 2px #888;
    }
  }
}

button {
  margin-top: 20px;
  border-radius: 8px;
  padding: 10px;
  font-size: 16px;
  background: #C79037;
}

.more {
  display: flex;
  padding: 6px;
  justify-content: space-between;
}
</style>