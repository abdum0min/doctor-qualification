import { Badge } from '@/shared/ui/badge'
import { QUALIFICATION_LABELS, type QualificationLevel } from '../model/types'

const VARIANTS: Record<
  QualificationLevel,
  'secondary' | 'info' | 'warning' | 'success' | 'default'
> = {
  BEGINNER: 'secondary',
  INTERMEDIATE: 'warning',
  GOOD: 'info',
  HIGH: 'default',
  EXPERT: 'success',
}

export function QualificationBadge({
  qualification,
}: {
  qualification: QualificationLevel
}) {
  return (
    <Badge variant={VARIANTS[qualification]}>
      {QUALIFICATION_LABELS[qualification]}
    </Badge>
  )
}
