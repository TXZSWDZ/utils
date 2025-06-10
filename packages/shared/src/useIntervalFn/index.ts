import type { State } from '../useTimeoutFn'

export interface UseIntervalFnReturn {
  getState: () => Exclude<State, 'completed'>
  getRemaining: () => number
  start: () => void
  pause: () => void
  resume: () => void
  cancel: () => void
}

export function useIntervalFn(callback: () => void, delay: number, immediate: boolean = true): UseIntervalFnReturn {
  if (delay < 0) {
    throw new Error('Delay must be a non-negative number')
  }

  let timer: NodeJS.Timeout | null = null
  let state: Exclude<State, 'completed'> = 'initial'
  let remaining = delay
  let startTime: number | null = null
  let pauseTime: number | null = null

  function fn() {
    callback()

    startTime = Date.now()

    if (remaining !== delay) {
      if (timer) {
        clearInterval(timer)
        timer = null
      }

      remaining = delay

      timer = setInterval(fn, delay)
    }
  }

  function start() {
    if (state === 'running' || state === 'paused') {
      console.warn('Interval is already running.')
      return
    }

    startTime = Date.now()

    timer = setInterval(fn, delay)

    state = 'running'
  }

  function pause() {
    if (state !== 'running') {
      console.warn('Interval is not running.')
      return
    }

    pauseTime = Date.now()

    remaining -= pauseTime - startTime!

    if (timer) {
      clearInterval(timer)
      timer = null
    }

    state = 'paused'
  }

  function resume() {
    if (state !== 'paused') {
      console.warn('Interval is not paused.')
      return
    }

    startTime = Date.now()

    timer = setInterval(fn, remaining)

    state = 'running'
  }

  function cancel() {
    if (state === 'canceled') {
      console.warn('Interval has already been canceled.')
      return
    }

    if (timer) {
      clearInterval(timer)
      timer = null
    }

    startTime = null

    pauseTime = null

    state = 'canceled'
  }

  function getState() {
    return state
  }

  function getRemaining() {
    if (state === 'initial') {
      return delay
    }
    else if (state === 'running') {
      return remaining - (Date.now() - startTime!)
    }
    else if (state === 'paused') {
      return remaining
    }
    else {
      return 0
    }
  }

  if (immediate) {
    start()
  }
  return {
    getState,
    getRemaining,
    start,
    pause,
    resume,
    cancel,
  }
}
