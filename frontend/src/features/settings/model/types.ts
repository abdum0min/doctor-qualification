export interface PlatformSettings {
  averageScoreWeight: number
  bestScoreWeight: number
  volumeWeight: number
  passRateWeight: number
  volumeTargetAttempts: number
  certificateValidityMonths: number
  defaultQuestionCount: number
  defaultTimeLimitMinutes: number
  defaultPassingScore: number
  updatedAt: string
}

export interface ExamDefaults {
  questionCount: number
  timeLimitMinutes: number
  passingScore: number
}

export type SettingsPayload = Partial<Omit<PlatformSettings, 'updatedAt'>>
