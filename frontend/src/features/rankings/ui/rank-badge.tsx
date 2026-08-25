import { cn } from '@/shared/lib/utils'

/** Birinchi uchta o'rin ajratib ko'rsatiladi. */
const MEDALS: Record<number, string> = {
  1: 'bg-[var(--stat-amber)] text-white',
  2: 'bg-muted-foreground/70 text-white',
  3: 'bg-[var(--stat-red)]/80 text-white',
}

export function RankBadge({ position }: { position: number }) {
  return (
    <span
      className={cn(
        'inline-flex size-7 items-center justify-center rounded-full text-xs font-semibold tabular-nums',
        MEDALS[position] ?? 'bg-muted text-muted-foreground',
      )}
    >
      {position}
    </span>
  )
}
