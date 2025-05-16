import { IsFlags } from '../constants'

export const objectToString: typeof Object.prototype.toString = Object.prototype.toString

export function toTypeString(value: unknown): string {
  return objectToString.call(value)
}

export function isMap(val: unknown): val is Map<any, any> {
  return toTypeString(val) === IsFlags.MAP
}

export function isSet(val: unknown): val is Set<any> {
  return toTypeString(val) === IsFlags.SET
}

export function isDate(val: unknown): val is Date {
  return toTypeString(val) === IsFlags.DATE
}

export function isRegExp(val: unknown): val is RegExp {
  return toTypeString(val) === IsFlags.REGEXP
}

export function isObject(val: unknown): val is Record<any, any> {
  return toTypeString(val) === IsFlags.OBJECT
}

export const isArray: typeof Array.isArray = Array.isArray

export function isFunction(val: unknown): val is Function {
  return typeof val === 'function'
}

export function isPromise<T = any>(val: unknown): val is Promise<T> {
  return (
    (toTypeString(val) === IsFlags.PROMISE
      || isFunction(val))
    && isFunction((val as any).then)
    && isFunction((val as any).catch)
    && isFunction((val as any).finally)
  )
}

export const isSymbol = (val: unknown): val is symbol => typeof val === 'symbol'

export const isString = (val: unknown): val is string => typeof val === 'string'
