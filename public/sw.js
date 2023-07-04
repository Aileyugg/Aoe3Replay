const cacheList = [
  '/index.html'
]

const version = 'CacheV117'
const windowHost = location.host

self.addEventListener('install', (event) => {
  async function addCache() {
    const cache = await caches.open(version)
    await cache.addAll(cacheList)
  }

  self.skipWaiting();
  event.waitUntil(addCache());
})

self.addEventListener('activate', (event) => {
  async function deleteCache() {
    const cachesArray = await caches.keys()

    for (let cache of cachesArray) {
      if (cache !== version) await caches.delete(cache)
    }
  }

  event.waitUntil(clients.claim())
  event.waitUntil(deleteCache())
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  // const { search } = url
  // const { method } = request
  const { host, pathname } = url
  async function fetchResponse() {
    const cache = await caches.match(request)
    if (cache) return cache
    const response = await fetch(request)
    const myCache = await caches.open(version)
    myCache.put(request, response.clone())
    return response
  }
  // if (search === '' && method !== 'POST') {
    
  // }
  // if (pathname.slice(pathname.lastIndexOf('/')) === '/replay') return
  if (pathname.slice(0, 4) === '/api') return

  // console.log(host, pathname);

  if (host === windowHost) {
    event.respondWith(fetchResponse())
  }
})