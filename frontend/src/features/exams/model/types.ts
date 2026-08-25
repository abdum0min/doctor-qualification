import type { Difficulty } from '@/features/questions'

export interface Exam {
  id: number
  title: string
  description: string | null
  questionCount: number
  timeLimitMinutes: number
  passingScore: number
  difficulty: Difficulty | null
  isActive: boolean
  specialty: { id: number; name: string }
}

export interface AdminExam extends Exam {
  availableQuestions: number
  createdAt: string
  updatedAt: string
}

export type ExamStatus = 'active' | 'inactive'

export const EXAM_LIMITS = {
  questionCount: { min: 5, max: 100 },
  timeLimitMinutes: { min: 5, max: 240 },
  passingScore: { min: 1, max: 100 },
} as const
