<script setup lang="ts">
import { EnhancedWebSocket } from '@wthe/utils-core'
import { ref } from 'vue'

const message = ref('')
const ws = new EnhancedWebSocket('ws://127.0.0.1:8080', { immediate: false }, { onMessage(data: any) {
  message.value = data
} })
const { connect, send, close } = new EnhancedWebSocket('ws://127.0.0.1:8090', { immediate: false })
</script>

<template>
  <button @click="ws.connect">
    连接:8080
  </button>
  <button @click="ws.send('你好，服务器！')">
    发送:8080
  </button>
  <button @click="ws.close">
    断开:8080
  </button>
  <button @click="connect">
    连接:8090
  </button>
  <button @click="send('你好，服务器！')">
    发送:8090
  </button>
  <button @click="close">
    断开:8090
  </button>
  <span>
    {{ message }}
  </span>
</template>
