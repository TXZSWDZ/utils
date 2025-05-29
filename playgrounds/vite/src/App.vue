<script setup lang="ts">
import { useFetch, useStorage } from "@wthe/utils-core"

import { useTimeoutFn } from "@wthe/utils-shared"

const { execute, abort } = useFetch('https://jsonplaceholder.typicode.com/posts/1', { immediate: false });

const { get, set, remove, clear } = useStorage()

const { start, pause, resume, cancel, getState } = useTimeoutFn(() => { console.log('useSetTimeoutFn') }, 5000)
</script>

<template>
  <div>
    <span>useFetch：</span>
    <button @click="execute">
      发送
    </button>
    <button @click="abort">
      取消
    </button>
  </div>
  <div>
    <span>useStorage：</span>
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
  </div>
  <div>
    <span>useSetTimeoutFn：</span>
    <button @click="start">开始</button>
    <button @click="pause">暂停</button>
    <button @click="resume">继续</button>
    <button @click="cancel">取消</button>
    <button @click="() => { console.log(getState()) }">获取状态</button>
  </div>
</template>
