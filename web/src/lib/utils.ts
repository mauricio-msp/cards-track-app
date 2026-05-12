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

const brlFormatter = new Intl.NumberFormat('pt-br', { style: 'currency', currency: 'BRL' })

export function formatPrice(value: number) {
  return brlFormatter.format(value)
}

export function formatCompact(cents: number) {
  const value = cents / 100
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(1)}k`
  return formatPrice(value)
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

export function applyPhoneMask(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11)
  if (!digits) return ''
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function formatPhone(e164: string): string {
  const digits = e164.replace(/\D/g, '')
  if (digits.length < 12) return e164
  const ddd = digits.slice(2, 4)
  const number = digits.slice(4)
  if (number.length === 9) return `+55 (${ddd}) ${number.slice(0, 5)}-${number.slice(5)}`
  return `+55 (${ddd}) ${number.slice(0, 4)}-${number.slice(4)}`
}

export function applyBRLMask(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  return (parseInt(digits, 10) / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
