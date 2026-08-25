import { format, isValid, parseISO } from 'date-fns'

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
