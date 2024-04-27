import { exponentialBackoff } from './exponentialBackoff'

describe('exponentialBackoff', () => {
  describe('attempt', () => {
    it('should raise an error when attempt is less than zero', () => {
      expect(() => exponentialBackoff({ interval: 1, rate: 1, attempt: -1 })).toThrow(
        TypeError,
      )
    })
  })

  describe('rate', () => {
    it('should handle negative rate correctly', () => {
      const params = { interval: 100, rate: 1, attempt: 2 }
      const expectedBackoff = 100

      const result = exponentialBackoff(params)

      expect(result).toBe(expectedBackoff)
    })

    it('should handle neutral (0) rate correctly', () => {
      const params = { interval: 100, rate: 1, attempt: 2 }
      const expectedBackoff = 100

      const result = exponentialBackoff(params)

      expect(result).toBe(expectedBackoff)
    })

    it('should handle positive rate correctly', () => {
      const params = { interval: 100, rate: 1, attempt: 2 }
      const expectedBackoff = 100

      const result = exponentialBackoff(params)

      expect(result).toBe(expectedBackoff)
    })

    it('should handle fractional rate correctly', () => {
      const params = { interval: 100, rate: 0.5, attempt: 2 }
      const expectedBackoff = 25

      const result = exponentialBackoff(params)

      expect(result).toBe(expectedBackoff)
    })
  })

  test.each<{ input: Parameters<typeof exponentialBackoff>[0]; output: number }>([
    {
      input: {
        interval: 100,
        rate: 2,
        attempt: 0,
      },
      output: 100,
    },
    {
      input: {
        interval: 100,
        rate: 2,
        attempt: 1,
      },
      output: 200,
    },
    {
      input: {
        interval: 100,
        rate: 2,
        attempt: 2,
      },
      output: 400,
    },
    {
      input: {
        interval: 100,
        rate: 2,
        attempt: 3,
      },
      output: 800,
    },
  ])('exponentialBackoff($input) should return $output', ({ input, output }) => {
    const result = exponentialBackoff(input)

    expect(result).toEqual(output)
  })
})
