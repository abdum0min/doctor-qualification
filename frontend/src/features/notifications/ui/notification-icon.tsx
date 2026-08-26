import { Award, BellRing, GraduationCap, ShieldAlert } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import type { NotificationType } from '../model/types'

const ICONS = {
  EXAM_PUBLISHED: GraduationCap,
  CERTIFICATE_ISSUED: Award,
  CERTIFICATE_REVOKED: ShieldAlert,
  SYSTEM: BellRing,
} as const

/** Bekor qilingan sertifikat — yagona ogohlantiruvchi tur, shuning uchun qizil. */
const TONES: Record<NotificationType, string> = {
  EXAM_PUBLISHED: 'bg-primary/10 text-primary',
  CERTIFICATE_ISSUED: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  CERTIFICATE_REVOKED: 'bg-destructive/10 text-destructive',
  SYSTEM: 'bg-muted text-muted-foreground',
}

export function NotificationIcon({
  type,
  className,
}: {
  type: NotificationType
  className?: string
}) {
  const Icon = ICONS[type] ?? BellRing

  return (
    <span
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-full',
        TONES[type],
        className,
      )}
    >
      <Icon className="size-4" />
    </span>
  )
}
