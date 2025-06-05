<script setup lang="ts">
import { useFullScreen } from '@wthe/utils-core'
import { onMounted, ref } from 'vue'

const boxRef = ref()

let enter1: () => void
let exit1: () => void
let toggle1: () => void

onMounted(() => {
  const { enter, exit, toggle } = useFullScreen(boxRef.value)

  enter1 = enter
  exit1 = exit
  toggle1 = toggle
})
</script>

<template>
  <div ref="boxRef" class="box">
    <button @click="enter1">
      Enter Fullscreen
    </button>
    <button @click="exit1">
      exit Fullscreen
    </button>
    <button @click="toggle1">
      toggle Fullscreen
    </button>
  </div>
</template>

<style scoped>
.box {
  width: 100px;
  height: 100px;
  background-color: rgb(160, 160, 160);
}
</style>
