import type { PaginationMeta } from '@/shared/api'
import { Button } from './button'

interface TablePaginationProps {
  meta: PaginationMeta
  onNext: (cursor: string) => void
  onPrev: () => void
  canGoBack: boolean
}

export function TablePagination({ meta, onNext, onPrev, canGoBack }: TablePaginationProps) {
  if (!meta.hasMore && !canGoBack) return null

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-muted-foreground tabular-nums">
        {meta.limit} ta ko'rsatilmoqda
      </p>

      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" disabled={!canGoBack} onClick={onPrev}>
          Oldingi
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={!meta.hasMore || !meta.nextCursor}
          onClick={() => meta.nextCursor && onNext(meta.nextCursor)}
        >
          Keyingi
        </Button>
      </div>
    </div>
  )
}