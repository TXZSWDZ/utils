import type { OutputOptions, RollupOptions } from 'rollup'

import { dts } from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'

const external = [/@wthe\/*/]
function output(fileName: string): OutputOptions {
  return {
    file: `./dist/${fileName}`,
    format: 'es',
  }
}

function defineConfig(): RollupOptions[] {
  const configs: RollupOptions[] = [
    {
      input: './index.ts',
      output: output('index.mjs'),
      plugins: [
        esbuild(),
      ],
      external,
    },
    {
      input: './index.ts',
      output: output('index.d.ts'),
      plugins: [
        dts(),
      ],
      external,
    },
  ]
  return configs
}

export default defineConfig
