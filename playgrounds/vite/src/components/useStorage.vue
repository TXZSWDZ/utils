<script setup lang="ts">
import { useStorage } from '@wthe/utils-core'

const { get, set, remove, clear } = useStorage()
</script>

<template>
  <button @click="set('name', { age: 16 })">
    设置1
  </button>
  <button @click="set('name', 2, { merge: true })">
    设置2
  </button>
  <button @click="set('name', 3)">
    设置3
  </button>
  <button @click="() => { console.log(get('name')) }">
    获取
  </button>
  <button @click="remove('name')">
    删除
  </button>
  <button @click="clear()">
    清除
  </button>
</template>
