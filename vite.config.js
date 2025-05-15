/// <reference types="vitest" />
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'

const resolve = path => fileURLToPath(new URL(path, import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@wthe/utils-core': resolve('packages/core/index.ts'),
      '@wthe/utils-shared': resolve('packages/shared/index.ts'),
    },
  },
  test: {
    include: ['packages/**/*.{test,spec}.{js,ts}'],
  },
})
