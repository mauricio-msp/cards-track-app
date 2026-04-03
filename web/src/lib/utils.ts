import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitialLetters(name: string): string {
  const parts = name.trim().split(/\s+/)

  const firstLetter = parts[0]?.charAt(0).toUpperCase() ?? ''
  const secondLetter =
    parts.length > 1 ? parts[1].charAt(0).toUpperCase() : (parts[0]?.charAt(1)?.toUpperCase() ?? '')

  return firstLetter + secondLetter
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat('pt-br', { style: 'currency', currency: 'BRL' }).format(value)
}

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
