import { sleep } from './sleep'

describe('sleep function', () => {
  it('should resolve after a specified time', async () => {
    const start = Date.now()
    const delay = 500

    await sleep(delay)

    const end = Date.now()
    const elapsed = end - start

    expect(elapsed).toBeGreaterThanOrEqual(delay - 50) // Account for setTimeout inaccuracy
    expect(elapsed).toBeLessThan(delay + 50) // Account for setTimeout inaccuracy
  })

  it('should resolve after a longer specified time', async () => {
    const start = Date.now()
    const delay = 1000

    await sleep(delay)

    const end = Date.now()
    const elapsed = end - start

    expect(elapsed).toBeGreaterThanOrEqual(delay - 50) // Account for setTimeout inaccuracy
    expect(elapsed).toBeLessThan(delay + 50) // Account for setTimeout inaccuracy
  })
})
