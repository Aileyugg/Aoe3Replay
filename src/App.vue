<script setup>
// import HelloWorld from '@/components/HelloWorld.vue'
</script>

<template>
  <header>
    <p><router-link to="/">帝国时代3录像分享</router-link></p>
  </header>
  <main>
    <router-view></router-view>
  </main>
  <footer>
  </footer>
</template>

<style lang="less" scoped>
header,
footer {
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  min-width: 980px;
  color: #ddb;
  background-image: linear-gradient(90deg, #321, #642, #321);
}

header{
  height: 90px;
  margin-bottom: 16px;
  border-bottom: 2px solid #cc6;

  > p {
    width: 980px;
    text-align: center;
    font: 600 34px/48px Arial, 'Microsoft YaHei';
  }
}

main {
  display: flex;
  justify-content: space-between;
  width: 1120px;
  margin: auto;
  flex: 1;
}

footer {
  height: 60px;
  margin-top: 16px;
  border-top: 2px solid #cc6;
}

</style>
