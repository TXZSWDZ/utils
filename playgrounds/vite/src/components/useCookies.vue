<script setup lang="ts">
import { useCookies } from '@wthe/utils-core'
import { ref } from 'vue'

const cookies = useCookies()

cookies.addChangeListener(() => {
  console.warn('cookies change')
})

const count = ref(0)
const deleteCount = ref(0)

function setCookie() {
  cookies.set(`name0`, `wthe${count.value}`)
  count.value++
}
function getCookie() {
  cookies.get('name0')
}
function getAllCookie() {
  cookies.getAll()
}
function deleteCookie() {
  cookies.remove(`name${deleteCount.value}`)
  deleteCount.value++
}
</script>

<template>
  <div>count:{{ count }}</div>
  <div>deleteCount:{{ deleteCount }}</div>
  <button @click="setCookie">
    设置cookie
  </button>
  <button @click="getCookie">
    获取单个cookie
  </button>
  <button @click="getAllCookie">
    获取全部cookie
  </button>
  <button @click="deleteCookie">
    删除cookie
  </button>
</template>
