<script setup>
import ReplayList from './ReplayList.vue';
import { civs } from '@/assets/data.json';
import User from '@/components/User.vue';
import { baseUrl } from '@/config';

console.log(baseUrl);
</script>

<template>
  <div class="index">
    <header>录像下载</header>
    <div class="player">
      <select name="player1Civ" disabled>
        <option value="">选择文明</option>
        <option v-for="value, key in civs" :value="key">{{ value.dpName }}</option>
      </select>
      <input type="text" placeholder="搜索玩家1游戏名" disabled>
      <select name="player2Civ" disabled>
        <option value="">选择文明</option>
        <option v-for="value, key in civs" :value="key">{{ value.dpName }}</option>
      </select>
      <input type="text" placeholder="搜索玩家2游戏名" disabled>
    </div>
    <div class="filter">
      <select name="player1Civ" disabled>
        <option value="">选择分数区间</option>
        <option value="0,1200">1200以下</option>
        <option value="1200,1600">1200到1600</option>
        <option value="1600,2500">1600以上</option>
      </select>
      <select name="player1Civ" disabled>
        <option value="">选择排序方式</option>
        <option value="0,1200">按时间从新到旧</option>
        <option value="1200,1600">按下载量从高到低</option>
        <option value="1600,2500">按分数从高到低</option>
      </select>
      <button disabled>搜索录像</button>
    </div>
    <sup>搜索功能暂不可用</sup>
    <ul class="replay-list">
      <Suspense>
        <ReplayList />
        <template #fallback>加载中...</template>
      </Suspense>
    </ul>
  </div>
  <aside>
    <User />
  </aside>
</template>

<style lang="less" scoped>
.index {
  display: flex;
  box-sizing: border-box;
  width: 820px;
  border-radius: 14px;
  padding: 34px 30px;
  background: rgb(238 238 238 / 80%);
  flex-direction: column;

  >header {
    font-size: 20px;
    font-weight: 700;
    text-align: center;
    padding: 10px 0 36px;
  }
}

#lib {
  .select-focus() {
    outline: solid 2px #888;
  }

  .select() {
    border: 0;
    border-radius: 8px;
    padding-left: 10px;
  }
}

.player {
  display: grid;
  grid-template-columns: repeat(2, 1fr 2fr);
  grid-column-gap: 10px;
  height: 36px;

  >select {
    #lib.select();

    &:focus {
      #lib.select-focus();
    }
  }

  >input {
    #lib.select();
  }
}

.filter {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-column-gap: 10px;
  height: 36px;
  margin-top: 12px;

  >select {
    #lib.select();

    &:focus {
      #lib.select-focus()
    }
  }

  >button {
    border-radius: 8px;
    width: 180px;
    background: #C79037;
  }
}

.replay-list {
  margin-top: 24px;
  border-top: solid 2px #999;
  padding-top: 16px;
}
</style>
