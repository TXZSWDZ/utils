<script setup lang="ts">
import { useDebounce } from '@wthe/utils-shared'
import { ref } from 'vue'

const count = ref<number>(0)

const { execute, cancel } = useDebounce({
  fn: () => {
    count.value++
  },
})

function handleClick() {
  execute()
}
</script>

<template>
  <button @click="handleClick">
    点击
  </button>
  <button @click="cancel">
    取消
  </button>
  <div>count : {{ count }}</div>
</template>
