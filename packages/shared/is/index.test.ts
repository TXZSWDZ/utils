import { describe, expect, it } from 'vitest'

import { isArray, isDate, isFunction, isMap, isObject, isPromise, isRegExp, isSet, isString, isSymbol } from './index'

describe('is', () => {
  it('isArray', () => {
    expect(isArray([])).toBe(true)
    expect(isArray({})).toBe(false)
  })

  it('isDate', () => {
    expect(isDate(new Date())).toBe(true)
    expect(isDate({})).toBe(false)
  })

  it('isFunction', () => {
    expect(isFunction(() => {})).toBe(true)
    expect(isFunction({})).toBe(false)
  })

  it('isMap', () => {
    expect(isMap(new Map())).toBe(true)
    expect(isMap({})).toBe(false)
  })

  it('isObject', () => {
    expect(isObject({})).toBe(true)
    expect(isObject('')).toBe(false)
  })

  it('isPromise', () => {
    expect(isPromise(Promise.resolve())).toBe(true)
    expect(isPromise({})).toBe(false)
  })

  it('isRegExp', () => {
    expect(isRegExp(/test/)).toBe(true)
    expect(isRegExp({})).toBe(false)
  })

  it('isSet', () => {
    expect(isSet(new Set())).toBe(true)
    expect(isSet({})).toBe(false)
  })

  it('isString', () => {
    expect(isString('')).toBe(true)
    expect(isString({})).toBe(false)
  })

  it('isSymbol', () => {
    expect(isSymbol(Symbol('test'))).toBe(true)
    expect(isSymbol({})).toBe(false)
  })
})
