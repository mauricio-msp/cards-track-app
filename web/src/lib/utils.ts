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
