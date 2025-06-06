<script setup lang="ts">
import { useIntervalFn } from '@wthe/utils-shared'
import { ref } from 'vue'

const count = ref(0)

const { start, pause, resume, cancel, getState, getRemaining } = useIntervalFn(() => {
  count.value++
}, 6000, false)
</script>

<template>
  <button @click="start">
    开始
  </button>
  <button @click="pause">
    暂停
  </button>
  <button @click="resume">
    继续
  </button>
  <button @click="cancel">
    取消
  </button>
  <button @click="() => { console.log(getState()) }">
    获取状态
  </button>
  <button @click="() => { console.log(getRemaining()) }">
    获取剩余时间
  </button>
  <span>
    Interval function executed：{{ count }}
  </span>
</template>
