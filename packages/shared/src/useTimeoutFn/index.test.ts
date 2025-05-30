import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useTimeoutFn } from './index'

describe('useTimeoutFn', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  it('works', () => {
    const { getState } = useTimeoutFn(() => {}, 1)
    vi.advanceTimersByTime(1)
    expect(getState()).toEqual('completed')
  })
  it('works immediate:false', () => {
    const { getState } = useTimeoutFn(() => {}, 1, false)
    vi.advanceTimersByTime(1)
    expect(getState()).toEqual('initial')
  })
  it('works running', () => {
    const { getState } = useTimeoutFn(() => {}, 2)
    vi.advanceTimersByTime(1)
    expect(getState()).toEqual('running')
  })
  it('works canceled', () => {
    const { cancel, getState } = useTimeoutFn(() => {}, 2)
    vi.advanceTimersByTime(1)
    cancel()
    expect(getState()).toEqual('canceled')
  })
  it('works getRemaining', () => {
    const { getRemaining } = useTimeoutFn(() => {}, 2)
    vi.advanceTimersByTime(1)
    expect(getRemaining()).toEqual(1)
    vi.advanceTimersByTime(1)
    expect(getRemaining()).toEqual(0)
  })
})
