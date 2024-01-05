import { isClass } from './isClass';

class _CustomClass_ {
  constructor() {}
}

describe('isClass', () => {
  it('should return true for a custom class', () => {
    expect(isClass(_CustomClass_)).toBe(true);
  });

  it('should return true a native class constructor', () => {
    expect(isClass(Date)).toBe(true);
  });

  it('should return false for a non-function value', () => {
    expect(isClass({})).toBe(false);
  });

  it('should return false for a function without a prototype', () => {
    expect(isClass(() => {})).toBe(false);
  });

  it('should return false for a function without a constructor name', () => {
    expect(isClass(function () {})).toBe(false);
  });

  it('should return false for a regular function', () => {
    expect(isClass(() => {})).toBe(false);
  });
});
