/**
 * Reyting bali — to'rtta ko'rsatkichning vaznli o'rtachasi. Har biri 0..100
 * shkalasida, shuning uchun ularni bevosita qo'shish mumkin.
 *
 * Faqat o'rtacha ball bilan tartiblash adolatsiz bo'lardi: bitta imtihonni
 * 100% ga topshirgan shifokor o'nta imtihonni 95% ga topshirgandan yuqori
 * turib qolardi. Shuning uchun urinishlar hajmi ham ulush oladi.
 */
export const RANKING_WEIGHTS = {
  averageScore: 0.5,
  bestScore: 0.2,
  volume: 0.2,
  passRate: 0.1,
} as const;

/** Shuncha yakunlangan urinishda hajm ko'rsatkichi to'liq ballga yetadi. */
export const VOLUME_TARGET_ATTEMPTS = 5;

export interface RankingMetrics {
  attemptCount: number;
  passedCount: number;
  averageScore: number;
  bestScore: number;
}

export function calculateRankingScore(metrics: RankingMetrics): number {
  if (metrics.attemptCount === 0) {
    return 0;
  }

  const volume =
    Math.min(metrics.attemptCount / VOLUME_TARGET_ATTEMPTS, 1) * 100;
  const passRate = (metrics.passedCount / metrics.attemptCount) * 100;

  const weighted =
    metrics.averageScore * RANKING_WEIGHTS.averageScore +
    metrics.bestScore * RANKING_WEIGHTS.bestScore +
    volume * RANKING_WEIGHTS.volume +
    passRate * RANKING_WEIGHTS.passRate;

  return Math.round(weighted * 10) / 10;
}

/**
 * Teng ballda tartib tasodifiy bo'lmasligi kerak — aks holda bir xil so'rov
 * har safar boshqa ketma-ketlik qaytaradi va sahifalash buziladi.
 */
export function compareRanked<T extends RankingMetrics & { doctorId: number }>(
  first: T,
  second: T,
): number {
  return (
    calculateRankingScore(second) - calculateRankingScore(first) ||
    second.averageScore - first.averageScore ||
    second.bestScore - first.bestScore ||
    second.attemptCount - first.attemptCount ||
    first.doctorId - second.doctorId
  );
}
