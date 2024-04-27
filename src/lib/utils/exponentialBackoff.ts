export function exponentialBackoff({
  interval,
  rate,
  attempt,
}: {
  interval: number
  rate: number
  attempt: number
}): number {
  if (attempt < 0) {
    throw new TypeError(
      `exponentialBackoff 'attempt' to be greater or equal to than zero, but got: ${attempt}`,
    )
  }

  return interval * rate ** attempt
}
