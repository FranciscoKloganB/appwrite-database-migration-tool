import { secondsToMilliseconds } from './secondsToMilliseconds';

describe('secondsToMilliseconds', () => {
  it('should convert positive seconds to milliseconds correctly', () => {
    const seconds = 5;
    const expectedMilliseconds = 5000;

    const result = secondsToMilliseconds(seconds);

    expect(result).toBe(expectedMilliseconds);
  });

  it('should handle zero seconds correctly', () => {
    const seconds = 0;
    const expectedMilliseconds = 0;

    const result = secondsToMilliseconds(seconds);

    expect(result).toBe(expectedMilliseconds);
  });

  it('should convert negative seconds to milliseconds correctly', () => {
    const seconds = -3;
    const expectedMilliseconds = -3000;

    const result = secondsToMilliseconds(seconds);

    expect(result).toBe(expectedMilliseconds);
  });
});
