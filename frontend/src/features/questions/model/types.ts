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

export type QuestionStatus = 'active' | 'inactive'

export interface QuestionOption {
  id: number
  text: string
  isCorrect: boolean
}

export interface Question {
  id: number
  examId: number
  text: string
  difficulty: Difficulty
  position: number
  isActive: boolean
  options: QuestionOption[]
  createdAt: string
  updatedAt: string
}

export interface QuestionFilters {
  search?: string
  difficulty?: Difficulty
  status?: QuestionStatus
}
