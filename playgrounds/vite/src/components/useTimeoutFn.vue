<script setup lang="ts">
import { useTimeoutFn } from '@wthe/utils-shared'
import { vUseTimeoutFn } from '@wthe/utils-vue'

const { start, pause, resume, cancel, getState, getRemaining } = useTimeoutFn(() => {}, 60000, false)

const { state, remaining } = vUseTimeoutFn(() => {}, 60000)
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
  <div>
    <div>
      <span>
        vue Remaining time：{{ remaining }}
      </span>
      <span> | </span>
      <span>
        vue State：{{ state }}
      </span>
    </div>
  </div>
</template>
