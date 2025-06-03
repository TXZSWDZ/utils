<script setup lang="ts">
import { onClickOutside } from '@wthe/utils-core'
import { onBeforeMount, onMounted, ref } from 'vue'

const boxRef = ref()

const count = ref(0)

let cancel: () => void

onMounted(() => {
  cancel = onClickOutside(boxRef.value, () => {
    count.value++
  }, { ignore: ['.outside-box'] })
})

onBeforeMount(() => {
  cancel?.()
})
</script>

<template>
  <div>点击外部次数：{{ count }}</div>
  <div ref="boxRef" class="box">
    <div class="inner" />
  </div>
  <div class="outside-box" />
</template>

<style scoped>
.box{
    width: 100px;
    height: 100px;
    background-color: red;
}
.inner{
    width: 50px;
    height: 50px;
    background-color: blue;
}

.outside-box{
    width: 100px;
    height: 100px;
    background-color: green;
}
</style>
