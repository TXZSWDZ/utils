function defaultComparator<T>(value: T, othVal: T) {
  return value === othVal
}

export function useArrayCompare<T>(
  a: T[],
  b: T[],
  options?: {
    compareFn?: (value: T, othVal: T) => boolean
    mode?: 'difference' | 'intersection' | 'symmetricDifference'
  },
): T[] {
  const { compareFn, mode = 'difference' } = options || {}

  if (!compareFn && (typeof a[0] === 'number' || typeof a[0] === 'string' || typeof a[0] === 'boolean')) {
    const setA = new Set(a)
    const setB = new Set(b)

    switch (mode) {
      case 'difference':
        return a.filter(value => !setB.has(value))
      case 'intersection':
        return a.filter(value => setB.has(value))
      case 'symmetricDifference':
        return [
          ...a.filter(value => !setB.has(value)),
          ...b.filter(value => !setA.has(value)),
        ]
      default:
        return a.filter(value => !setB.has(value))
    }
  }

  const isInB = (value: T) =>
    b.findIndex(othVal =>
      compareFn ? compareFn(value, othVal) : defaultComparator(value, othVal),
    ) !== -1

  const isInA = (value: T) =>
    a.findIndex(othVal =>
      compareFn ? compareFn(value, othVal) : defaultComparator(value, othVal),
    ) !== -1

  switch (mode) {
    case 'difference':
      return a.filter(value => !isInB(value))
    case 'intersection':
      return a.filter(value => isInB(value))
    case 'symmetricDifference':
      return [
        ...a.filter(value => !isInB(value)),
        ...b.filter(value => !isInA(value)),
      ]
    default:
      return a.filter(value => !isInB(value))
  }
}
