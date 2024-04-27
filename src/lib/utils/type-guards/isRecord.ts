export function isRecord(document: unknown): document is Record<string, unknown> {
  return !!document && typeof document === 'object' && !Array.isArray(document)
}
