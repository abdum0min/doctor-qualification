import { Badge } from '@/shared/ui/badge'
import { DIFFICULTY_LABELS, type Difficulty } from '../model/types'

const VARIANTS: Record<Difficulty, 'secondary' | 'info' | 'warning' | 'success'> = {
  BEGINNER: 'secondary',
  INTERMEDIATE: 'info',
  ADVANCED: 'warning',
  EXPERT: 'success',
}

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return <Badge variant={VARIANTS[difficulty]}>{DIFFICULTY_LABELS[difficulty]}</Badge>
}
