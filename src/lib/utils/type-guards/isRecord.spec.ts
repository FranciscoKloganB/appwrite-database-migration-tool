import { isRecord } from './isRecord'

describe('isRecord', () => {
  it('should return true for an object with string keys and unknown values', () => {
    const obj: Record<string, unknown> = {
      key1: 'value1',
      key2: 42,
      key3: { nestedKey: 'nestedValue' },
    }
    const result = isRecord(obj)
    expect(result).toBe(true)
  })

  it('should return false for an array', () => {
    const arr = [1, 2, 3]
    const result = isRecord(arr)
    expect(result).toBe(false)
  })

  it('should return false for null', () => {
    const value = null
    const result = isRecord(value)
    expect(result).toBe(false)
  })

  it('should return false for a string', () => {
    const value = 'test'
    const result = isRecord(value)
    expect(result).toBe(false)
  })

  it('should return false for a number', () => {
    const value = 42
    const result = isRecord(value)
    expect(result).toBe(false)
  })

  it('should return false for undefined', () => {
    const value = undefined
    const result = isRecord(value)
    expect(result).toBe(false)
  })

  it('should return false for a function', () => {
    const value = () => {}
    const result = isRecord(value)
    expect(result).toBe(false)
  })
})
