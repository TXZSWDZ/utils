<script setup lang="ts">
import { useFullScreen } from '@wthe/utils-core'
import { onMounted, ref } from 'vue'

const boxRef = ref()

let toggle: () => void

onMounted(() => {
  const result = useFullScreen(boxRef.value)

  toggle = result.toggle
})
</script>

<template>
  <button @click="toggle">
    Toggle Fullscreen
  </button>
  <div ref="boxRef" class="box" />
</template>

<style scoped>
.box {
  width: 100px;
  height: 100px;
  background-color: red;
}
</style>
