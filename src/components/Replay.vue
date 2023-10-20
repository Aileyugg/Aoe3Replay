<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { parseReplay } from '@/modules/replay.js'
import { inflateRaw } from '@/modules/pako.js'
import { filter, hashMd5, progress, upFetch } from '@/modules'
import User from '@/components/User.vue'
import { dialogMsg } from '@/modules/components.js'
import { url } from '@/modules/global'
import Loading from '@/components/Loading.vue'

const fileList = ref([])
const fileInfoList = ref([])
const activeFile = ref(-1)

const eloMap = new Map()

watch(activeFile, async (index) => {
  if (index === -1) return
  if (fileInfoList.value[index]) return
  await getReplayInfo(index)
})

const replayData = computed(() => {
  return fileInfoList.value[activeFile.value]
})

async function getReplayInfo(index) {
  const info = await replayInfo(fileList.value[index])
  fileInfoList.value[index] = info

  const { players } = info
  const promiseAry = []

  for (const player of players) {
    const { name } = player

    if (eloMap.has(name)) {
      const playerElo = eloMap.get(name)
      if (typeof playerElo === 'object') promiseAry.push(playerElo)
      else player.elo = playerElo
      continue
    }

    const eloPromise = getPlayerElo(name)
    promiseAry.push(eloPromise)
    eloMap.set(name, eloPromise)
  }

  for await (const promise of promiseAry) {
    const [name, elo] = promise

    for (let player of fileInfoList.value[index].players) {
      if (player.name === name) player.elo = elo
    }

    eloMap.set(name, elo)
  }
}

async function openFile(event) {
  const files = event.target.files
  await pushFile(files)
}

async function replayInfo(file) {
  const arrayBuffer = await file.arrayBuffer()
  const md5 = hashMd5(arrayBuffer)
  const buffer = inflateRaw(arrayBuffer.slice(10))
  console.time('replay')
  const replayInfo = parseReplay(buffer)
  console.timeEnd('replay')
  console.log(replayInfo);
  const fileName = getFileName(replayInfo.players, replayInfo.map)
  return { ...replayInfo, md5, fileName }
}

async function pushFile(files) {
  for (const file of files) {
    if (file.name.slice(-8) !== 'age3Yrec') return true
    fileList.value.push(file)
  }
}

function getFileName(palyersAry, map) {
  const groupObj = {}

  for (const player of palyersAry) {
    const key = player.teamId
    groupObj[key] = groupObj[key] || ''
    groupObj[key] += `${player.name}(${filter('civName', player.civ)})`
  }

  return `[${filter('mapName', map)}] ${Object.values(groupObj).join(' VS ')}`
}

async function uploadFile(fileIndex, msgElement) {
  // 2: '文件重复上传', 3: '文件上传失败', 4: '文件上传成功'
  const { fileName, md5, version, ...upData } = fileInfoList.value[fileIndex]
  console.log(fileInfoList.value[fileIndex]);
  const prepare = await fetch(`${url}api/upload?md5=${md5}`, {
    headers: { token: localStorage.getItem('token') }
  }).then((res) => res.json())
  if (prepare.code === 0) return 2

  const file = fileList.value[fileIndex]
  const formData = new FormData()

  formData.append('files', file, `${fileName}.age3Yrec`)
  formData.append('folderId', 0)
  formData.append('fileId', '')
  formData.append('fileDesc', '')
  formData.append('accToken', '644ed4d0e1c01287cbaeff48c21c62358107c85ec4c2027aac52eaed49313a2e6447d4122005c2d5443ab8678b63f111')

  for (let [key, value] of Object.entries(prepare)) {
    formData.append(key, value)
  }

  let progressFun = progress(msgElement)
  const upResult = await upFetch('https://upload.feijipan.com/app/file/upload', {
    method: 'POST',
    body: formData
  }, progressFun)
  progressFun = null

  const { fileIds, code } = JSON.parse(upResult)

  if (code !== 200) return 3

  await fetch(`${url}api/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      token: localStorage.getItem('token')
    },
    body: JSON.stringify({
      fileId: fileIds[0],
      md5,
      version,
      content: upData,
      uid: localStorage.getItem('uid')
    })
  })

  return 4
}

async function dragFile(event) {
  event.preventDefault()
  event.target.classList.remove('dragover')
  const files = event.dataTransfer.files
  if (await pushFile(files)) return dialogMsg('该文件不是录像文件')
}

function dragEnter(event) {
  event.target.classList.add('dragover')
}

function dragLeave(event) {
  event.target.classList.remove('dragover')
}

const isUpload = ref([])

async function activeFileFun(event) {
  if (event.target.tagName === 'LI') {
    const index = parseInt(event.target.getAttribute('index'))
    activeFile.value = index
  } else if (event.target.tagName === 'A') {
    if (!localStorage.getItem('uid')) return dialogMsg('请先登录帐号再上传录像')
    const element = event.target
    const index = parseInt(element.parentElement.getAttribute('index'))
    element.innerText = '正在上传'
    isUpload.value[index] = 1
    if (!fileInfoList.value[index]) await getReplayInfo(index)
    const code = await uploadFile(index, element)
    if (code === 2) {
      element.innerText = '文件重复上传'
    } else if (code === 3) {
      element.innerText = '文件上传失败'
      isUpload.value[index] = 0
    } else if (code === 4) {
      element.innerText = '文件上传成功'
    }
  }
}

async function getPlayerElo(playerName) {
  const body = {
    count: 2,
    matchType: "1",
    page: 1,
    region: "7",
    searchPlayer: playerName
  }
  const { count, items } = await fetch('https://api.ageofempires.com/api/ageiii/Leaderboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }).then(async (res) => {
    const data = await res.text()
    if (data === '') return {}
    return JSON.parse(data)
  })
  if (!count || count > 1) return [playerName, -1]
  return [playerName, items[0].elo]
}
</script>

<template>
  <div class="replay">
    <header>在线录像解析</header>
    <button class="open-file">
      <span>打开录像文件</span>
      <input type="file" accept=".age3Yrec" @change="openFile" multiple>
    </button>
    <div class="drop-box" @dragover.prevent @drop="dragFile" @dragenter="dragEnter" @dragleave="dragLeave">
      <p class="drop-text">
        <i class="ifont icon-upload"></i>
        <span>或者将文件拖到此处</span>
      </p>
    </div>
    <ul class="file-list" @click="activeFileFun" v-show="fileList.length !== 0">
      <li v-for="file, index in fileList" :key="index" :index="index" :class="{ active: activeFile === index }">
        <i class="ifont icon-file"></i>
        <span class="file-name">{{ file.name }}</span>
        <a :class="{ uploading: isUpload[index] }">上传</a>
      </li>
    </ul>
    <div class="replay-info" v-if="replayData">
      <div class="map">
        <img :src="filter('mapIcon', replayData.map)" alt="">
        <p>{{ filter('mapName', replayData.map) }}</p>
      </div>
      <div class="name">{{ replayData.fileName }}</div>
      <div class="players">
        <div class="player" v-for="player in replayData.players">
          <img :src="filter('civIcon', player.civ)" alt="">
          <span>{{ player.name }}</span>
          <span>
            <Loading v-if="!player.elo" />
            <span>{{ player.elo }}</span>
          </span>
        </div>
      </div>
      <div>录像时长：{{ filter('duration', replayData.duration) }}</div>
    </div>
  </div>
  <aside>
    <User />
  </aside>
</template>

<style lang="less" scoped>
.replay {
  display: flex;
  box-sizing: border-box;
  width: 820px;
  border-radius: 14px;
  padding: 24px 16px;
  background: rgb(238 238 238 / 80%);
  align-items: center;
  flex-direction: column;
}

header {
  font-size: 20px;
  font-weight: 700;
  text-align: center;
  margin: 36px auto 60px;
}

.open-file {
  position: relative;
  width: 300px;
  height: 50px;
  margin-bottom: 20px;
  border-radius: 5px;
  overflow: hidden;
  background: #C79037;

  >input {
    width: 300px;
    height: 56px;
    position: absolute;
    cursor: pointer;
    font-size: 0;
    top: -6px;
    left: 0;
  }

  >span {
    font-size: 16px;
  }
}

.drop-box {
  display: flex;
  height: 100px;
  width: 300px;
  background: rgb(200 200 200 / 66%);
  margin-bottom: 24px;
  border: 3px dashed #b0b1b1;
  border-radius: 12px;
  align-items: center;
  justify-content: center;

  >.drop-text {
    font-size: 16px;
    color: #818182;
    pointer-events: none;

    >.icon-upload {
      margin-right: 6px;
      font-size: 26px;
    }
  }
}

.dragover {
  outline: solid 2px #888;
}

.file-list {
  width: 640px;
  margin-bottom: 24px;
  border-radius: 12px;
  padding: 30px 42px;
  box-sizing: border-box;
  background: rgb(238 238 238 / 80%);

  >li {
    display: grid;
    grid-template-columns: 42px 1fr 100px;
    justify-items: start;
    padding: 8px 12px;

    >.icon-file {
      font-size: 28px;
      pointer-events: none;
    }

    >.file-name {
      cursor: pointer;
      pointer-events: none;
    }

    >.uploading {
      pointer-events: none;
    }
  }

  >.active {
    border-radius: 8px;
    background: #ccc;
  }
}

.replay-info {
  display: grid;
  grid-gap: 16px 16px;
  grid-template-columns: 1.2fr 2fr;
  grid-template-rows: auto auto 1fr;
  box-sizing: border-box;
  width: 640px;
  margin-bottom: 36px;
  border-radius: 12px;
  padding: 32px 46px 32px 26px;
  background: rgb(238 238 238 / 80%);

  >.name {
    margin-top: 10px;
    /* font-size: 16px; */
    font-weight: 600;
  }

  >.map {
    display: flex;
    grid-row: 1 / 5;
    flex-direction: column;
    align-items: center;

    >img {
      height: 160px;
      margin: 10px 0;
    }
  }

  .players {

    >.player {
      display: grid;
      grid-template-columns: 72px 1fr 80px;
      height: 46px;
      margin: 8px -12px;
      border-radius: 8px;
      background: #ccc;
      align-items: center;

      >img {
        height: 30px;
        margin: 0 10px;
        border-radius: 6px;
        /* margin: 10px 0; */
      }
    }
  }
}
</style>