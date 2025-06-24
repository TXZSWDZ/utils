import type { State, UseTimeoutFnReturn } from '@wthe/utils-shared'
import type { Ref } from 'vue'

import { useTimeoutFn } from '@wthe/utils-shared'
import { ref } from 'vue'

export interface VUseTimeoutFnReturn extends Omit<UseTimeoutFnReturn, 'getState' | 'getRemaining'> {
  state: Ref<State>
  remaining: Ref<number>
}

export function vUseTimeoutFn(callback: () => void, delay: number, immediate: boolean = true): VUseTimeoutFnReturn {
  const state = ref<State>('initial')

  const remaining = ref<number>(0)

  const timeout = useTimeoutFn(callback, delay, immediate)

  const getRemaining = () => {
    requestAnimationFrame(() => {
      remaining.value = timeout.getRemaining()

      if (remaining.value === 0) {
        state.value = timeout.getState()
        return
      }
      getRemaining()
    })
  }

  const start = () => {
    timeout.start()
    state.value = timeout.getState()
    getRemaining()
  }
  const pause = () => {
    timeout.pause()
    state.value = timeout.getState()
  }
  const resume = () => {
    timeout.resume()
    state.value = timeout.getState()
  }
  const cancel = () => {
    timeout.cancel()
    state.value = timeout.getState()
  }

  if (immediate) {
    remaining.value = timeout.getRemaining()
    start()
  }

  return {
    state,
    remaining,
    start,
    pause,
    resume,
    cancel,
  }
}
