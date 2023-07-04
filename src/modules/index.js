import { civs, maps } from '@/assets/data.json'
import { ArrayBufferMD5 } from '@/modules/md5.js'

export function splitPage(array, index, pageSize = 25) {
  return array.slice((index - 1) * pageSize, index * pageSize)
}

export function filter(type, value) {
  const civIcon = '/resources/images/icons/flags/'
  const mapIcon = '/resources/images/icons/random_map/'
  switch (type) {
    case('civIcon'): return civIcon + civs[value].icon
    case('civName'): return civs[value].dpName
    case('mapIcon'): return mapIcon + maps[value.toLowerCase()]?.icon
    case('mapName'): return maps[value.toLowerCase()]?.dpName
    case('duration'): return `${parseInt(value / 60000)} 分 ${parseInt(value % 60000 / 1000)} 秒`
    case('shareUrl'): return `https://www.feijix.com/s/${value}`
  }
}

export function hashMd5(arrayBuffer) {
  const md5 = new ArrayBufferMD5()
  md5.append(arrayBuffer)
  return md5.end()
}

export function progress(msg) {
  let oldLoaded = 0
  let oldTime = 0
  return (event) => {
    const duration = (new Date().getTime() - oldTime) / 1000
    const loadBytes = event.loaded - oldLoaded
    oldTime = new Date().getTime()
    oldLoaded = event.loaded
    let speed = loadBytes / duration
    let units = 'b/s';

    if (speed / 1024 > 1) {
      speed = parseInt(speed / 1024);
      units = 'k/s';
    }

    if (speed / 1024 > 1) {
      speed = parseInt(speed / 1024)
      units = 'M/s';
    }

    msg.innerText = `${parseInt(event.loaded / event.total * 100)}% ${speed + units}`
  }
}

export async function upFetch(url, opts = {}, onProgress) {
  return new Promise((res, rej) => {
    const xhr = new XMLHttpRequest();
    xhr.open(opts.method || 'GET', url);
    for (let key of Object.keys(opts.headers || {})) xhr.setRequestHeader(key, opts.headers[key]);
    xhr.onload = (e) => res(e.target.responseText);
    xhr.onerror = rej;
    if (xhr.upload && onProgress) xhr.upload.onprogress = onProgress; // event.loaded / event.total * 100 ; //event.lengthComputable
    xhr.send(opts.body);
  });
}

export function sleep(duration) {
  return new Promise((resolve) => {
      setTimeout(resolve, duration)
  })
}

function base64url(base64) {
  let string = base64.replaceAll('-', '+')
  string = string.replaceAll('_', '/')
  return window.atob(string)
}

export function verifyToken() {
  const token = localStorage.getItem('token')
  if (!token) return
  let [body] = token.split('#')
  body = base64url(body)
  const endTime = body.slice(-13)
  if (endTime < Date.now()) return
  return body.slice(0, -13)
}