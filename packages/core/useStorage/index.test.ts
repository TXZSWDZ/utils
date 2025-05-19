import { beforeEach, describe, expect, it } from 'vitest'

import { useStorage } from './index'

const { set, get, remove, clear } = useStorage()

const storage1 = useStorage()

const storage2 = useStorage()

describe('useStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })
  it('should set and get a value', () => {
    set('key', 'value')
    const result = get('key')
    expect(result).toBe('value')
  })
  it('should remove a value', () => {
    set('key', 'value')
    remove('key')
    const result = get('key')
    expect(result).toBe(null)
  })
  it('should clear all values', () => {
    set('key1', 'value1')
    set('key2', 'value2')
    clear()
    const result1 = get('key1')
    const result2 = get('key2')
    expect(result1).toBe(null)
    expect(result2).toBe(null)
  })
  it('should return null when getting a non-existent value', () => {
    const result = get('nonExistentKey')
    expect(result).toBe(null)
  })
  it('should return the same instance for local and session storage', () => {
    expect(storage1 === storage2).toBe(true)
  })
})
