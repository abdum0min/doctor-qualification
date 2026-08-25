import type { Difficulty } from '@/features/questions'

export const QUALIFICATION_LEVELS = [
  'BEGINNER',
  'INTERMEDIATE',
  'GOOD',
  'HIGH',
  'EXPERT',
] as const

export type QualificationLevel = (typeof QUALIFICATION_LEVELS)[number]

export const QUALIFICATION_LABELS: Record<QualificationLevel, string> = {
  BEGINNER: "Boshlang'ich",
  INTERMEDIATE: "O'rta",
  GOOD: 'Yaxshi',
  HIGH: 'Yuqori',
  EXPERT: 'Ekspert',
}

export type AttemptStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED'

export interface AttemptOption {
  id: number
  text: string
  /** Faqat yakunlangan urinishda keladi. */
  isCorrect?: boolean
}

export interface AttemptQuestion {
  id: number
  position: number
  questionText: string
  difficulty: Difficulty
  selectedOptionId: number | null
  isCorrect?: boolean | null
  options: AttemptOption[]
}

export interface Attempt {
  id: number
  status: AttemptStatus
  exam: { id: number; title: string; specialty: { id: number; name: string } }
  questionCount: number
  timeLimitMinutes: number
  passingScore: number
  startedAt: string
  deadlineAt: string
  completedAt: string | null
  remainingSeconds: number
  answeredCount: number
  correctCount: number | null
  score: number | null
  qualification: QualificationLevel | null
  passed: boolean | null
  questions: AttemptQuestion[]
}

export interface AttemptSummary {
  id: number
  status: AttemptStatus
  exam: { id: number; title: string; specialty: { id: number; name: string } }
  questionCount: number
  passingScore: number
  startedAt: string
  completedAt: string | null
  correctCount: number | null
  score: number | null
  qualification: QualificationLevel | null
  passed: boolean | null
}
