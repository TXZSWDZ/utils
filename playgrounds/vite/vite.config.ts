import { resolve } from 'node:path'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@wthe/utils-core': resolve(__dirname, '../../packages/core/index.ts'),
      '@wthe/utils-shared': resolve(__dirname, '../../packages/shared/index.ts'),
      '@wthe/utils-vue': resolve(__dirname, '../../packages/vue/index.ts'),
    },
  },
})
