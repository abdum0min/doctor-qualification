import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { useActiveSpecialties } from '../api/specialties-queries'

interface SpecialtySelectProps {
  value?: number | null
  onChange: (specialtyId: number | null) => void
  id?: string
  placeholder?: string
  /** Tanlovni bekor qilish imkonini beradi. */
  clearable?: boolean
  'aria-invalid'?: boolean
}

const NONE = 'none'

export function SpecialtySelect({
  value,
  onChange,
  id,
  placeholder = 'Mutaxassislikni tanlang',
  clearable = false,
  ...rest
}: SpecialtySelectProps) {
  const { data: specialties, isLoading } = useActiveSpecialties()

  return (
    <Select
      value={value ? String(value) : clearable ? NONE : undefined}
      onValueChange={(next) => onChange(next === NONE ? null : Number(next))}
      disabled={isLoading}
    >
      <SelectTrigger id={id} className="w-full" {...rest}>
        <SelectValue placeholder={isLoading ? 'Yuklanmoqda...' : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {clearable && <SelectItem value={NONE}>Tanlanmagan</SelectItem>}
        {specialties?.map((specialty) => (
          <SelectItem key={specialty.id} value={String(specialty.id)}>
            {specialty.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
