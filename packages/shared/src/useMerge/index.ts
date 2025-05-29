import { isArray } from '../is/index'

function merge<T, U>(a: T, b: U): T | U | (T extends object ? (U extends object ? T & U : [T, U]) : (U extends object ? [T, U] : [T, U])) {
  if (typeof a === 'object' && a !== null && typeof b === 'object' && b !== null) {
    if (isArray(a) && isArray(b)) {
      return [...(a as any[]), ...(b as any[])] as any
    }
    else if (Array.isArray(a)) {
      return [...(a as any[]), b] as any
    }
    else if (isArray(b)) {
      return [...(b as any[]), a] as any
    }
    else {
      return { ...(a as object), ...(b as object) } as any
    }
  }
  else if (isArray(a)) {
    return [...(a as any[]), b] as any
  }
  else if (isArray(b)) {
    return [...(b as any[]), a] as any
  }
  else {
    return [a, b] as any
  }
}

export function useMerge<T, U>(a: T, b: U): T | U | (T extends object ? (U extends object ? T & U : [T, U]) : (U extends object ? [T, U] : [T, U])) {
  return merge(a, b)
}
