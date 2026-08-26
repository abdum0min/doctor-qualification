import { z } from 'zod'

import type { PlatformSettings, SettingsPayload } from './types'

/** Raqamli maydonlar formada matn bo'lib turadi — `<input>` doim string qaytaradi. */
function wholeField({ min, max }: { min: number; max: number }) {
  return z
    .string()
    .trim()
    .refine((value) => /^\d+$/.test(value), 'Butun son kiriting')
    .refine(
      (value) => Number(value) >= min && Number(value) <= max,
      `${min}–${max} oralig\`ida bo\`lsin`,
    )
}

const weightField = z
  .string()
  .trim()
  .refine((value) => /^\d+([.,]\d+)?$/.test(value), 'Son kiriting')
  .refine(
    (value) => toWeight(value) >= 0 && toWeight(value) <= 1,
    'Vazn 0 va 1 oralig`ida bo`lsin',
  )

/** Vergul bilan ham yozish mumkin — klaviaturaga qarab har xil bo'ladi. */
function toWeight(value: string | undefined): number {
  return Number((value ?? '0').replace(',', '.')) || 0
}

export const settingsSchema = z
  .object({
    averageScoreWeight: weightField,
    bestScoreWeight: weightField,
    volumeWeight: weightField,
    passRateWeight: weightField,
    volumeTargetAttempts: wholeField({ min: 1, max: 100 }),
    certificateValidityMonths: wholeField({ min: 1, max: 120 }),
    defaultQuestionCount: wholeField({ min: 1, max: 200 }),
    defaultTimeLimitMinutes: wholeField({ min: 5, max: 300 }),
    defaultPassingScore: wholeField({ min: 1, max: 100 }),
  })
  .refine((values) => sumWeights(values) > 0, {
    message: 'Kamida bitta vazn noldan katta bo`lishi kerak',
    path: ['averageScoreWeight'],
  })

export type SettingsValues = z.infer<typeof settingsSchema>

/** Forma to'ldirilayotganda maydonlar hali bo'sh bo'lishi mumkin. */
interface WeightFields {
  averageScoreWeight?: string
  bestScoreWeight?: string
  volumeWeight?: string
  passRateWeight?: string
}

export function weightSum(values: WeightFields): number {
  return sumWeights(values)
}

function sumWeights(values: WeightFields): number {
  return (
    toWeight(values.averageScoreWeight) +
    toWeight(values.bestScoreWeight) +
    toWeight(values.volumeWeight) +
    toWeight(values.passRateWeight)
  )
}

export function toSettingsPayload(values: SettingsValues): SettingsPayload {
  return {
    averageScoreWeight: toWeight(values.averageScoreWeight),
    bestScoreWeight: toWeight(values.bestScoreWeight),
    volumeWeight: toWeight(values.volumeWeight),
    passRateWeight: toWeight(values.passRateWeight),
    volumeTargetAttempts: Number(values.volumeTargetAttempts),
    certificateValidityMonths: Number(values.certificateValidityMonths),
    defaultQuestionCount: Number(values.defaultQuestionCount),
    defaultTimeLimitMinutes: Number(values.defaultTimeLimitMinutes),
    defaultPassingScore: Number(values.defaultPassingScore),
  }
}

export function toSettingsValues(settings: PlatformSettings): SettingsValues {
  return {
    averageScoreWeight: String(settings.averageScoreWeight),
    bestScoreWeight: String(settings.bestScoreWeight),
    volumeWeight: String(settings.volumeWeight),
    passRateWeight: String(settings.passRateWeight),
    volumeTargetAttempts: String(settings.volumeTargetAttempts),
    certificateValidityMonths: String(settings.certificateValidityMonths),
    defaultQuestionCount: String(settings.defaultQuestionCount),
    defaultTimeLimitMinutes: String(settings.defaultTimeLimitMinutes),
    defaultPassingScore: String(settings.defaultPassingScore),
  }
}

/** Backend'dagi standart qiymatlar — "tiklash" tugmasi shularni qaytaradi. */
export const FACTORY_SETTINGS: SettingsValues = {
  averageScoreWeight: '0.5',
  bestScoreWeight: '0.2',
  volumeWeight: '0.2',
  passRateWeight: '0.1',
  volumeTargetAttempts: '5',
  certificateValidityMonths: '12',
  defaultQuestionCount: '10',
  defaultTimeLimitMinutes: '20',
  defaultPassingScore: '60',
}
