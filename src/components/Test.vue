<script setup>
import { ref, computed } from 'vue'

function getId(id) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(id), 6000)
  })
}


// const test = ref()

// onMounted(async () => {
//   const info = {
//     member:[
//       { id: 123 },
//       { id: 222 }
//     ]
//   }
//   test.value = info
//   for await (const id of [getId(123), getId(222)]) {
//     for (const item of info.member) {
//       if (item.id === id) item.newId = id + 123
//     }
//     for (const item of test.value.member) {
//       if (item.id === id) {
//         item.newId = id + 123
//         console.log(item);
//       }
//     }
//   }
// })

const eloMap = new Map()



// const num = ref({
//   a: 88
// })

// const test = computed(() => {
//   const ss = num.value
//   console.log(111);
//   return ss.a
// })

setTimeout(async () => {
  console.log('1执行');
  eloMap.set('a', getId(123))
  console.log(typeof eloMap.get('a'));
  const id = await eloMap.get('a')
  eloMap.set('a', id)
  console.log(id);
  // console.log('out1');
  // num.value.s = 666
}, 1000)

setTimeout(async () => {
  console.log('9执行');
  console.log(typeof eloMap.get('a'));
  const id = await eloMap.get('a')
  eloMap.set('a', id)
  console.log(id);
  // console.log('out1');
  // num.value.s = 666
}, 3000)
let time = 0
const timer = setInterval(() => {
  console.log(time++ + 's');
}, 1000)

setTimeout(() => {
  clearInterval(timer)
}, 10000);
</script>

<template>
  <div class="test">
    <!-- {{ test }} -->
  </div>
</template>

<style lang="less" scoped>
.test {
  background: #eee;
}
</style>