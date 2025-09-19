import type { AsyncFn, Fn } from '../types'

export interface Options<T extends any[], THIS = any> {
  fn: Fn<T, void> | AsyncFn<T, void>
  delay?: number
  thisArg?: THIS
}

export interface UseDebounceReturn<T extends any[]> {
  execute: Fn<T, void>
  cancel: () => void
}

export function useDebounce<T extends any[], THIS = any>(options: Options<T, THIS>): UseDebounceReturn<T> {
  if (!options) {
    throw new Error('useDebounce: options is required')
  }

  const {
    fn,
    delay = 500,
    thisArg,
  } = options || {}

  if (delay < 0) {
    throw new Error('Delay must be a non-negative number')
  }

  if (!options.fn) {
    throw new Error('Function is required')
  }

  let timer: ReturnType<typeof setTimeout> | null = null

  function execute(this: THIS, ...args: T) {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    timer = setTimeout(async () => {
      if (thisArg) {
        await fn.call(thisArg, ...args)
      }
      else {
        await fn.call(this as unknown as THIS, ...args)
      }
    }, delay)
  }

  function cancel() {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  return { execute, cancel }
}
