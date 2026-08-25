import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { DIFFICULTIES, DIFFICULTY_LABELS, type Difficulty } from '../model/types'

interface DifficultySelectProps {
  value?: Difficulty | null
  onChange: (difficulty: Difficulty | null) => void
  id?: string
  placeholder?: string
  /** Tanlovni bekor qilish imkonini beradi — filtrlar uchun. */
  clearable?: boolean
}

const ALL = 'all'

export function DifficultySelect({
  value,
  onChange,
  id,
  placeholder = 'Darajani tanlang',
  clearable = false,
}: DifficultySelectProps) {
  return (
    <Select
      value={value ?? (clearable ? ALL : undefined)}
      onValueChange={(next) => onChange(next === ALL ? null : (next as Difficulty))}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {clearable && <SelectItem value={ALL}>Barcha darajalar</SelectItem>}
        {DIFFICULTIES.map((difficulty) => (
          <SelectItem key={difficulty} value={difficulty}>
            {DIFFICULTY_LABELS[difficulty]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
