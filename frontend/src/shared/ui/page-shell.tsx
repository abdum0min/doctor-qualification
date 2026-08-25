import type { ReactNode } from 'react'
import { Search } from 'lucide-react'

import { Card, CardContent } from './card'
import { Input } from './input'

interface PageShellProps {
  title: string
  description?: string
  search?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  filters?: ReactNode
  action?: ReactNode
  children: ReactNode
}

export function PageShell({
  title,
  description,
  search,
  onSearchChange,
  searchPlaceholder = 'Qidirish...',
  filters,
  action,
  children,
}: PageShellProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>

      <Card>
        {(onSearchChange || filters) && (
          <CardContent className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
            {onSearchChange && (
              <div className="relative min-w-48 flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="pl-8"
                />
              </div>
            )}
            {filters}
          </CardContent>
        )}

        <CardContent className="space-y-4">{children}</CardContent>
      </Card>
    </div>
  )
}
