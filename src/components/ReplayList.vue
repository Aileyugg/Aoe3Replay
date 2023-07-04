<script setup>
import { ref } from 'vue'
import { url } from '@/modules/global.js'
import Page from '@/components/Page.vue'
import { splitPage, filter } from '@/modules'

const replayData = await (async () => {
  const replayData = await fetch(`${url}api/replay`).then((res) => res.json())
  const data = []
  for (const value of replayData) {
    const copy = { ...JSON.parse(value.content), ...value }
    const { content, ...notContent } = copy
    data.push(notContent)
  }
  return data.reverse()
})()

const pageSize = 9
const pages = parseInt((replayData.length + pageSize - 1) / pageSize)

const pageData = ref(splitPage(replayData, 1, pageSize))
console.log(pageData);

function download(fileId) {
  fetch(`${url}api/downloads?fileId=${fileId}`)
}

function updateData(page) {
  pageData.value = splitPage(replayData, page, pageSize)
}
</script>

<template>
  <li class="replay" v-for="replay in pageData">
    <img class="map-icon" :src="filter('mapIcon', replay.map)" :alt="filter('mapName', replay.map)">
    <div class="name">
      <span>游戏时长：{{ filter('duration', replay.duration) }}</span>
      <span>地图：{{ filter('mapName', replay.map) }}</span>
    </div>
    <div class="players">
      <div class="player" v-for="palyer in replay.players">
        <img :src="filter('civIcon', palyer.civ)" alt="">
        <span class="player-name" :title="palyer.name">{{ palyer.name }}</span>
        <span class="elo">{{ palyer.elo }}</span>
      </div>
    </div>
    <div class="download">
      <a target="_blank" :href="filter('shareUrl', replay.shareUrl)" @click="download(replay.fileId)">下载录像</a>
      <span class="count">下载量：{{ replay.download }}</span>
    </div>
  </li>
  <Page @update="updateData" :pages="pages" />
</template>

<style lang="less" scoped>
.replay {
  display: grid;
  grid-template-columns: 1fr 4fr;
  grid-template-rows: auto auto 1fr;
  grid-gap: 10px 16px;
  box-sizing: border-box;
  margin-top: 16px;
  padding: 20px 34px 20px 16px;
  border-radius: 12px;
  background: rgb(224 224 224 / 80%);
}

.map-icon {
  height: 150px;
  grid-row: 1 / 5;
  margin: 0 12px;
}

.name {
  display: grid;
  grid-template-columns: 1fr 2fr;
}

.players {
  display: grid;
  margin: 12px -6px;
  border-radius: 8px;
  grid-template-columns: 46% 46%;
  align-items: center;
  justify-content: space-between;

  > .player {
    display: grid;
    border-radius: 8px;
    background: rgb(200 200 200 / 60%);
    grid-template-columns: 1fr 2.5fr 1fr;
    grid-gap: 10px;
    align-items: center;
    padding: 9px 5px;

    > .player-name {
      white-space: nowrap;
      font-weight: 600;
      overflow: hidden;
    }

    &:nth-of-type(2n) {
      position: relative;
      // text-align: right;

      > .elo {
        grid-column: 1;
        grid-row: 1;
      }

      > img {
        grid-column: 3;
        grid-row: 1;
      }

      &::before {
        content: "VS";
        position: absolute;
        left: -36px;
        font-size: 21px;
        font-weight: 600;
        color: #dc0707;
      }
    }

    > span {
      /* height: 10px; */
      text-align: center;
    }

    > img {
      margin: 0 8px;
      height: 36px;
      border-radius: 6px;
    }
  }
}

.download {
  display: grid;
  grid-template-columns: 1fr 4fr;

  > a {
    justify-self: start;
  }

  > .count {
    color: #666;
  }
}
</style>