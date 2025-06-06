<script setup lang="ts">
import { useWebSocket } from '@wthe/utils-core'
import { ref } from 'vue'

const message = ref('')

const ws = useWebSocket('ws://127.0.0.1:8080', { immediate: false }, { onMessage(data: any) {
  message.value = data
} })
const { connect } = useWebSocket('ws://127.0.0.1:8090', { immediate: false })
</script>

<template>
  <div>
    <button @click="ws.connect">
      连接:8080
    </button>
    <button @click="ws.pauseHeartbeat">
      暂停心跳:8080
    </button>
    <button @click="ws.resumeHeartbeat">
      继续心跳:8080
    </button>
    <button @click="ws.send('你好，服务器！')">
      发送:8080
    </button>
    <button @click="ws.close">
      断开:8080
    </button>
  </div>
  <div>
    <button @click="connect">
      连接:8090
    </button>
  </div>
  <div>
    <span>
      {{ message }}
    </span>
  </div>
</template>
