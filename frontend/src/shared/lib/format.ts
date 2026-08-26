import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns'
import { uz } from 'date-fns/locale'

import { env } from '@/shared/config/env'

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—'

  const date = typeof value === 'string' ? parseISO(value) : value

  return isValid(date) ? format(date, 'dd.MM.yyyy') : '—'
}

export function formatDateForInput(value: string | Date | null | undefined): string {
  if (!value) return ''

  const date = typeof value === 'string' ? parseISO(value) : value

  return isValid(date) ? format(date, 'yyyy-MM-dd') : ''
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return '—'

  const date = typeof value === 'string' ? parseISO(value) : value

  return isValid(date) ? format(date, 'dd.MM.yyyy HH:mm') : '—'
}

/** Bildirishnomalar uchun "3 soat oldin" ko'rinishidagi nisbiy vaqt. */
export function formatRelativeTime(value: string | Date | null | undefined): string {
  if (!value) return '—'

  const date = typeof value === 'string' ? parseISO(value) : value

  if (!isValid(date)) return '—'

  return formatDistanceToNow(date, { addSuffix: true, locale: uz })
}

/**
 * Yuklangan fayl yo'li backendga nisbiy keladi (`/uploads/...`), backend esa
 * boshqa portda turadi — shuning uchun to'liq manzilga aylantiriladi.
 */
export function toFileUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined

  return path.startsWith('/') ? `${env.apiUrl}${path}` : path
}
