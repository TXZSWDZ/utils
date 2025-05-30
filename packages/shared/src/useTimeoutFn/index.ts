type State = 'initial' | 'running' | 'paused' | 'completed' | 'canceled'

interface FnReturn {
  getState: () => State
  getRemaining: () => number
  start: () => void
  pause: () => void
  resume: () => void
  cancel: () => void
}

export function useTimeoutFn(callback: () => void, delay: number, immediate: boolean = true): FnReturn {
  if (delay < 0) {
    throw new Error('Delay must be a non-negative number')
  }

  let state: State = 'initial'

  let startTime: number | null = null

  let pauseTime: number | null = null

  let timer: NodeJS.Timeout | null = null

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
    callback()
    state = 'completed'
    remaining = delay
    cleanup()
  }

  function start() {
    if (state === 'running' || state === 'paused')
      return

    startTime = Date.now()

    state = 'running'

    timer = setTimeout(fn, remaining)
  }

  function pause() {
    if (state !== 'running') {
      return
    }

    pauseTime = Date.now()

    remaining -= pauseTime - startTime!

    state = 'paused'

    if (timer)
      clearTimeout(timer)
  }

  function resume() {
    if (state !== 'paused') {
      return
    }

    startTime = Date.now()

    state = 'running'

    timer = setTimeout(fn, remaining)
  }

  function cancel() {
    if (state === 'canceled' || state === 'completed')
      return

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

  const shell = { getState, getRemaining, start, pause, resume, cancel }

  if (immediate) {
    start()
  }

  return shell
}
