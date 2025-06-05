<script setup lang="ts">
import { shallowRef } from 'vue'

const componentList: Record<string, any> = shallowRef({})

const components = import.meta.glob('./components/*.vue', { eager: true })

for (const path in components) {
  const component: any = components[path]
  const name = path.split('/').pop()?.replace(/\.\w+$/, '')
  if (name) {
    componentList.value[name] = component.default
  }
}
</script>

<template>
  <div v-for="(value, key) in componentList" :key="key" class="component-item">
    <span>{{ key }}：</span>
    <component :is="value" />
  </div>
</template>

<style scoped>
.component-item{
  margin-bottom: 24px;
}
</style>
