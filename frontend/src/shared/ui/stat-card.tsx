import type { LucideIcon } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { Card, CardContent } from './card'
import { Skeleton } from './skeleton'

export type StatTone = 'blue' | 'emerald' | 'amber' | 'violet' | 'red'

const TONE_CLASSES: Record<StatTone, string> = {
  blue: 'bg-[var(--stat-blue)]',
  emerald: 'bg-[var(--stat-emerald)]',
  amber: 'bg-[var(--stat-amber)]',
  violet: 'bg-[var(--stat-violet)]',
  red: 'bg-[var(--stat-red)]',
}

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  hint?: string
  tone?: StatTone
  isLoading?: boolean
}

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = 'blue',
  isLoading,
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <span
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-xl text-white',
            TONE_CLASSES[tone],
          )}
        >
          <Icon className="size-5" />
        </span>

        <div className="min-w-0 space-y-0.5">
          {isLoading ? (
            <Skeleton className="h-7 w-16" />
          ) : (
            <p className="text-2xl leading-tight font-semibold tabular-nums">{value}</p>
          )}
          {/* Yorliq qirqilmasin — tor ustunlarda ikki qatorga o'tadi. */}
          <p className="text-sm leading-snug font-medium break-words text-pretty">
            {label}
          </p>
          {hint && <p className="truncate text-xs text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
