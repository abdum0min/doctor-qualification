import { QualificationLevel } from 'src/generated/prisma/enums';

export interface QualificationBand {
  /** Shu darajaga yetish uchun kerakli minimal foiz (chegara qo'shiladi). */
  minScore: number;
  level: QualificationLevel;
}

/**
 * Malaka darajasi chegaralari — platformaning yagona manbasi.
 * Yuqoridan pastga tekshiriladi, shuning uchun tartib muhim.
 */
export const QUALIFICATION_BANDS: readonly QualificationBand[] = [
  { minScore: 95, level: QualificationLevel.EXPERT },
  { minScore: 85, level: QualificationLevel.HIGH },
  { minScore: 70, level: QualificationLevel.GOOD },
  { minScore: 50, level: QualificationLevel.INTERMEDIATE },
  { minScore: 0, level: QualificationLevel.BEGINNER },
];

export function qualificationForScore(score: number): QualificationLevel {
  const band = QUALIFICATION_BANDS.find((item) => score >= item.minScore);

  return band?.level ?? QualificationLevel.BEGINNER;
}

/** Foizni butun songa yaxlitlaydi — baholash va ko'rsatish bir xil bo'lishi uchun. */
export function calculateScore(
  correctCount: number,
  totalCount: number,
): number {
  if (totalCount <= 0) {
    return 0;
  }

  return Math.round((correctCount / totalCount) * 100);
}
