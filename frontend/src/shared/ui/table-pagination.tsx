import { ChevronLeft, ChevronRight } from 'lucide-react'

import type { PaginationMeta } from '@/shared/api'
import { cn } from '@/shared/lib/utils'
import { Button } from './button'

interface TablePaginationProps {
  meta: PaginationMeta
  onPageChange: (page: number) => void
}

/** Ko'rinadigan raqamlar soni — undan ortig'i "…" bilan qisqartiriladi. */
const WINDOW = 5

/**
 * Joriy sahifa atrofidagi raqamlarni qaytaradi; birinchi va oxirgi sahifa
 * doim ko'rinadi, orasidagi uzilish `null` bilan belgilanadi.
 */
function pageItems(current: number, totalPages: number): (number | null)[] {
  if (totalPages <= WINDOW + 2) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const start = Math.max(2, current - Math.floor(WINDOW / 2))
  const end = Math.min(totalPages - 1, start + WINDOW - 1)
  const window = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  return [
    1,
    ...(start > 2 ? [null] : []),
    ...window,
    ...(end < totalPages - 1 ? [null] : []),
    totalPages,
  ]
}

export function TablePagination({ meta, onPageChange }: TablePaginationProps) {
  if (meta.total === 0) return null

  const from = (meta.page - 1) * meta.limit + 1
  const to = Math.min(meta.page * meta.limit, meta.total)

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-muted-foreground tabular-nums">
        {meta.total} tadan {from}–{to} ko'rsatilmoqda
      </p>

      <nav aria-label="Sahifalar" className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          aria-label="Oldingi sahifa"
          disabled={meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
        >
          <ChevronLeft />
        </Button>

        {pageItems(meta.page, meta.totalPages).map((item, index) =>
          item === null ? (
            <span
              key={`gap-${index}`}
              aria-hidden
              className="px-1 text-sm text-muted-foreground"
            >
              …
            </span>
          ) : (
            <Button
              key={item}
              variant={item === meta.page ? 'default' : 'outline'}
              size="icon"
              aria-label={`${item}-sahifa`}
              aria-current={item === meta.page ? 'page' : undefined}
              className={cn('tabular-nums', item === meta.page && 'pointer-events-none')}
              onClick={() => onPageChange(item)}
            >
              {item}
            </Button>
          ),
        )}

        <Button
          variant="outline"
          size="icon"
          aria-label="Keyingi sahifa"
          disabled={meta.page >= meta.totalPages}
          onClick={() => onPageChange(meta.page + 1)}
        >
          <ChevronRight />
        </Button>
      </nav>
    </div>
  )
}
