<script setup lang="ts">
import { usePassword } from '@wthe/utils-shared'
import { ref } from 'vue'

const { generate, validateStrength } = usePassword()
const password = ref('')
const strength = ref('')

function getPassword() {
  password.value = generate()
}

function validatePassword() {
  strength.value = validateStrength(password.value) as any
}
</script>

<template>
  <button @click="getPassword">
    生成密码
  </button>

  <button @click="validatePassword">
    密码强度
  </button>
  <div>密码： {{ password }}</div>
  <div>密码强度： {{ strength }}</div>
</template>
