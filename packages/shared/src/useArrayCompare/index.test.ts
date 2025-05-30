import { describe, expect, it } from 'vitest'

import { useArrayCompare } from '.'

describe('useArrayDifference', () => {
  it('should return the difference between two arrays', () => {
    const a = [1, 2, 3, 4]
    const b = [2, 4]
    const result = useArrayCompare(a, b)
    expect(result).toEqual([1, 3])
  })
  it('should return the difference between two arrays with custom compare function', () => {
    const a = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }]
    const b = [{ id: 2 }, { id: 4 }, { id: 6 }, { id: 8 }, { id: 10 }]
    const compareFn = (a: any, b: any) => a.id === b.id
    const result = useArrayCompare(a, b, { compareFn })
    expect(result).toEqual([{ id: 1 }, { id: 3 }, { id: 5 }])
  })
  it('should return the symmetric difference between two arrays with custom compare function', () => {
    const a = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }]
    const b = [{ id: 2 }, { id: 4 }, { id: 6 }, { id: 8 }, { id: 10 }]
    const compareFn = (a: any, b: any) => a.id === b.id
    const result = useArrayCompare(a, b, { compareFn, mode: 'symmetricDifference' })
    expect(result).toEqual([{ id: 1 }, { id: 3 }, { id: 5 }, { id: 6 }, { id: 8 }, { id: 10 }])
  })
  it('should return the intersection difference between two arrays with custom compare function', () => {
    const a = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }]
    const b = [{ id: 2 }, { id: 4 }, { id: 6 }, { id: 8 }, { id: 10 }]
    const compareFn = (a: any, b: any) => a.id === b.id
    const result = useArrayCompare(a, b, { compareFn, mode: 'intersection' })
    expect(result).toEqual([{ id: 2 }, { id: 4 }])
  })
})
