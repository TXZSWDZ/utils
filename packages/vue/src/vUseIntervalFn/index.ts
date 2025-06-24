import type { State, UseIntervalFnReturn } from '@wthe/utils-shared'
import type { Ref } from 'vue'

import { useIntervalFn } from '@wthe/utils-shared'
import { ref } from 'vue'

interface VUseIntervalFnReturn extends Omit<UseIntervalFnReturn, 'getState' | 'getRemaining'> {
  state: Ref<Exclude<State, 'completed'>>
  remaining: Ref<number>
}

export function vUseIntervalFn(callback: () => void, delay: number, immediate: boolean = true): VUseIntervalFnReturn {
  const interval = useIntervalFn(callback, delay, immediate)

  const state = ref<Exclude<State, 'completed'>>('initial')
  const remaining = ref<number>(0)

  const getRemaining = () => {
    requestAnimationFrame(() => {
      remaining.value = interval.getRemaining()

      if (interval.getState() === 'canceled') {
        state.value = interval.getState()
        return
      }
      getRemaining()
    })
  }

  const start = () => {
    interval.start()
    state.value = interval.getState()
    getRemaining()
  }
  const pause = () => {
    interval.pause()
    state.value = interval.getState()
  }
  const resume = () => {
    interval.resume()
    state.value = interval.getState()
  }
  const cancel = () => {
    interval.cancel()
    state.value = interval.getState()
  }

  if (immediate) {
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
