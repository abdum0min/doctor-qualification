import { useEffect, useRef, useState } from 'react'
import { Clock } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

const WARNING_SECONDS = 60

function format(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

interface ExamTimerProps {
  /** Server bergan muddat — mijoz soati faqat ko'rsatish uchun ishlatiladi. */
  deadlineAt: string
  onExpire: () => void
}

export function ExamTimer({ deadlineAt, onExpire }: ExamTimerProps) {
  const deadline = new Date(deadlineAt).getTime()
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, Math.floor((deadline - Date.now()) / 1000)),
  )

  // Taymer intervali qayta yaratilmasligi uchun callback ref orqali uzatiladi.
  const onExpireRef = useRef(onExpire)

  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  useEffect(() => {
    const tick = () => {
      const next = Math.max(0, Math.floor((deadline - Date.now()) / 1000))
      setRemaining(next)

      if (next === 0) {
        onExpireRef.current()
      }
    }

    tick()
    const interval = setInterval(tick, 1000)

    return () => clearInterval(interval)
  }, [deadline])

  const isWarning = remaining <= WARNING_SECONDS

  return (
    <div
      role="timer"
      aria-live={isWarning ? 'assertive' : 'off'}
      className={cn(
        'inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium tabular-nums',
        isWarning && 'border-destructive/40 bg-destructive/10 text-destructive',
      )}
    >
      <Clock className="size-4" />
      {format(remaining)}
    </div>
  )
}
