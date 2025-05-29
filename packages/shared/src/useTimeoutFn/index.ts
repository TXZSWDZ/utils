type State = 'initial' | 'running' | 'paused' | 'completed' | 'canceled'

interface FnReturn {
  getState: () => State
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
  const fn = () => {
    callback()
    state = 'completed'
    remaining = delay
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

    if (timer)
      clearTimeout(timer)

    timer = null

    startTime = null

    pauseTime = null

    remaining = delay
  }

  function getState() {
    return state
  }

  const shell = { getState, start, pause, resume, cancel }

  if (immediate) {
    start()
  }

  return shell
}
