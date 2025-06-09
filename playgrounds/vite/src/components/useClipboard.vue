<script setup lang="ts">
import { useClipboard } from '@wthe/utils-core'
import { ref } from 'vue'

const text = ref('Hello, Word!')
const { copy, isSupported } = useClipboard('.copy-container')
</script>

<template>
  <span>
    {{ isSupported ? 'Clipboard API is supported' : 'Clipboard API is not supported' }}
  </span>
  <button @click="() => { copy() }">
    {{ text }}
    复制
  </button>
  <div class="copy-container">
    <p>点击按钮将复制文本到剪贴板。</p>
    <p>当前文本: {{ text }}</p>
  </div>
</template>
