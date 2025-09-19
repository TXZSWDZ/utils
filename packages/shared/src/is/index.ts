export enum IsFlags {
  MAP = '[object Map]',
  SET = '[object Set]',
  DATE = '[object Date]',
  REGEXP = '[object RegExp]',
  OBJECT = '[object Object]',
  PROMISE = '[object Promise]',
}

export const objectToString: typeof Object.prototype.toString = Object.prototype.toString

export function toTypeString(value: unknown): string {
  return objectToString.call(value)
}

function isType<T>(val: unknown, type: IsFlags): val is T {
  return toTypeString(val) === type
}

export function isString(val: unknown): val is string {
  return typeof val === 'string'
}

export function isNumber(val: unknown): val is number {
  return typeof val === 'number'
}

export function isBoolean(val: unknown): val is boolean {
  return typeof val === 'boolean'
}

export function isSymbol(val: unknown): val is symbol {
  return typeof val === 'symbol'
}

export function isFunction(val: unknown): val is Function {
  return typeof val === 'function'
}

export function isObject(val: unknown): val is Record<any, any> {
  return isType<Record<any, any>>(val, IsFlags.OBJECT)
}

export const isArray: typeof Array.isArray = Array.isArray

export function isMap(val: unknown): val is Map<any, any> {
  return isType<Map<any, any>>(val, IsFlags.MAP)
}

export function isSet(val: unknown): val is Set<any> {
  return isType<Set<any>>(val, IsFlags.SET)
}

export function isDate(val: unknown): val is Date {
  return isType<Date>(val, IsFlags.DATE)
}

export function isRegExp(val: unknown): val is RegExp {
  return isType<RegExp>(val, IsFlags.REGEXP)
}

export function isFormData(val: unknown): val is FormData {
  return typeof val !== 'undefined' && val instanceof FormData
}

export function isPromise<T = any>(val: unknown): val is Promise<T> {
  if (!val)
    return false

  if (typeof val !== 'object' && typeof val !== 'function')
    return false

  if (isType<Promise<T>>(val, IsFlags.PROMISE)) {
    return true
  }

  const obj = val as { then?: Function, catch?: Function, finally?: Function }

  // Promise
  if (typeof obj.then === 'function'
    && typeof obj.catch === 'function'
    && typeof obj.finally === 'function') {
    return true
  }

  // PromiseLike
  if (typeof obj.then === 'function'
    && obj.catch === undefined
    && obj.finally === undefined) {
    return true
  }

  return false
}
