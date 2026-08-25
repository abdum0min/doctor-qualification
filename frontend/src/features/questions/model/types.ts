export const DIFFICULTIES = [
  'BEGINNER',
  'INTERMEDIATE',
  'ADVANCED',
  'EXPERT',
] as const

export type Difficulty = (typeof DIFFICULTIES)[number]

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  BEGINNER: "Boshlang'ich",
  INTERMEDIATE: "O'rta",
  ADVANCED: 'Yuqori',
  EXPERT: 'Ekspert',
}

export interface QuestionOption {
  id: number
  text: string
  isCorrect: boolean
}

export interface Question {
  id: number
  text: string
  difficulty: Difficulty
  isActive: boolean
  specialty: { id: number; name: string }
  options: QuestionOption[]
  createdAt: string
  updatedAt: string
}

export type QuestionStatus = 'active' | 'inactive'

export interface QuestionFilters {
  search?: string
  specialtyId?: number
  difficulty?: Difficulty
  status?: QuestionStatus
}
