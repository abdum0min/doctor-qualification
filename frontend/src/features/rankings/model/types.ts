import type { QualificationLevel } from '@/features/attempts'
import type { PaginationParams } from '@/shared/api'

export const RANKING_PERIODS = ['all', 'month', 'quarter', 'year'] as const

export type RankingPeriod = (typeof RANKING_PERIODS)[number]

export const RANKING_PERIOD_LABELS: Record<RankingPeriod, string> = {
  all: 'Butun davr',
  month: "So'nggi oy",
  quarter: "So'nggi chorak",
  year: "So'nggi yil",
}

export interface RankingRow {
  position: number
  doctorId: number
  fullname: string
  specialtyName: string | null
  workplace: string | null
  qualification: QualificationLevel | null
  attemptCount: number
  passedCount: number
  averageScore: number
  bestScore: number
  certificatesCount: number
  score: number
  lastAttemptAt: string | null
}

export interface MyRanking {
  position: number | null
  totalDoctors: number
  row: RankingRow | null
}

export type RankingParams = PaginationParams & {
  specialtyId?: number
  period?: RankingPeriod
}
