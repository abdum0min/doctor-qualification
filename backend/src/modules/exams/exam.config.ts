/**
 * Imtihon konfiguratsiyasining chegaralari — bitta joyda, DTO va servis
 * ikkalasi ham shu qiymatlarga tayanadi.
 */
export const EXAM_LIMITS = {
  questionCount: { min: 5, max: 100 },
  timeLimitMinutes: { min: 5, max: 240 },
  passingScore: { min: 1, max: 100 },
} as const;
