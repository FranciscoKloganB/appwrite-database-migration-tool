export function isClass(
  value: unknown,
): value is { prototype: { constructor: () => unknown } } {
  return (
    typeof value === 'function' &&
    !!value.prototype &&
    !!value.prototype.constructor.name
  )
}
