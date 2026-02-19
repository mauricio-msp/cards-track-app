export function formatValueToCents(value: string): number | null {
  const trimmed = value.trim()

  const hasComma = trimmed.includes(',')
  const hasDot = trimmed.includes('.')

  if (hasComma && hasDot && trimmed.indexOf(',') < trimmed.indexOf('.')) {
    // formato inválido: 1,234.56
    return null
  }

  const normalized = trimmed.replace(/\./g, '').replace(',', '.')

  const parsed = Number(normalized)

  if (!Number.isFinite(parsed)) return null

  return Math.round(parsed * 100)
}
