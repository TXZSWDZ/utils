export type State = 'initial' | 'running' | 'paused' | 'completed' | 'canceled'

export interface UseTimeoutFnReturn {
  getState: () => State
  getRemaining: () => number
  start: () => void
  pause: () => void
  resume: () => void
  cancel: () => void
}

export function useTimeoutFn(callback: () => void, delay: number, immediate: boolean = true): UseTimeoutFnReturn {
  if (delay < 0) {
    throw new Error('Delay must be a non-negative number')
  }

  let state: State = 'initial'

  let startTime: number | null = null

  let pauseTime: number | null = null

  let timer: ReturnType<typeof setTimeout> | null = null

  let remaining = delay

  const cleanup = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }

    startTime = null

    pauseTime = null
  }
  const fn = () => {
    state = 'completed'

    callback()

    remaining = delay

    cleanup()
  }

  function start() {
    if (state === 'running' || state === 'paused') {
      console.warn('Timeout is already running')
      return
    }

    state = 'running'

    startTime = Date.now()

    timer = setTimeout(fn, remaining)
  }

  function pause() {
    if (state !== 'running') {
      console.warn('Timeout is not running')
      return
    }

    state = 'paused'

    pauseTime = Date.now()

    remaining -= pauseTime - startTime!

    if (timer)
      clearTimeout(timer)
  }

  function resume() {
    if (state !== 'paused') {
      console.warn('Timeout is not paused.')
      return
    }

    state = 'running'

    startTime = Date.now()

    timer = setTimeout(fn, remaining)
  }

  function cancel() {
    if (state === 'canceled' || state === 'completed') {
      console.warn('Timeout has already been canceled or completed.')
      return
    }

    state = 'canceled'

    cleanup()

    remaining = delay
  }

  function getState() {
    return state
  }
  function getRemaining() {
    switch (state) {
      case 'initial':
        return delay
      case 'running':
        return remaining - (Date.now() - startTime!)
      case 'paused':
        return remaining
      case 'completed':
      case 'canceled':
        return 0
      default:
        return remaining
    }
  }

  if (immediate) {
    start()
  }

  const shell = { getState, getRemaining, start, pause, resume, cancel }

  return shell
}
