<script setup lang="ts">
import {useFetch} from "@wthe/utils-core"

const {execute,abort} =  useFetch('https://jsonplaceholder.typicode.com/posts/1',{ immediate: false });
</script>

<template>
  <button @click="execute">
    发送
  </button>
  <button @click="abort">
    取消
  </button>
</template>

