/**
 * Reyting bali — to'rtta ko'rsatkichning vaznli o'rtachasi. Har biri 0..100
 * shkalasida, shuning uchun ularni bevosita qo'shish mumkin.
 *
 * Faqat o'rtacha ball bilan tartiblash adolatsiz bo'lardi: bitta imtihonni
 * 100% ga topshirgan shifokor o'nta imtihonni 95% ga topshirgandan yuqori
 * turib qolardi. Shuning uchun urinishlar hajmi ham ulush oladi.
 */
export interface RankingWeights {
  averageScore: number;
  bestScore: number;
  volume: number;
  passRate: number;
}

/** Sozlamalar o'zgartirilmagan holatdagi qiymatlar. */
export const RANKING_WEIGHTS: RankingWeights = {
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

export interface RankingConfig {
  weights: RankingWeights;
  volumeTargetAttempts: number;
}

export const DEFAULT_RANKING_CONFIG: RankingConfig = {
  weights: RANKING_WEIGHTS,
  volumeTargetAttempts: VOLUME_TARGET_ATTEMPTS,
};

export function calculateRankingScore(
  metrics: RankingMetrics,
  config: RankingConfig = DEFAULT_RANKING_CONFIG,
): number {
  if (metrics.attemptCount === 0) {
    return 0;
  }

  const { weights } = config;
  const target = Math.max(config.volumeTargetAttempts, 1);

  const volume = Math.min(metrics.attemptCount / target, 1) * 100;
  const passRate = (metrics.passedCount / metrics.attemptCount) * 100;

  const weighted =
    metrics.averageScore * weights.averageScore +
    metrics.bestScore * weights.bestScore +
    volume * weights.volume +
    passRate * weights.passRate;

  const totalWeight =
    weights.averageScore +
    weights.bestScore +
    weights.volume +
    weights.passRate;

  // Vaznlar yig'indisi 1 dan farq qilsa ham ball 0..100 shkalasida qoladi.
  return Math.round((weighted / totalWeight) * 10) / 10;
}

/**
 * Teng ballda tartib tasodifiy bo'lmasligi kerak — aks holda bir xil so'rov
 * har safar boshqa ketma-ketlik qaytaradi va sahifalash buziladi.
 */
export function compareRanked<T extends RankingMetrics & { doctorId: number }>(
  first: T,
  second: T,
  config: RankingConfig = DEFAULT_RANKING_CONFIG,
): number {
  return (
    calculateRankingScore(second, config) -
      calculateRankingScore(first, config) ||
    second.averageScore - first.averageScore ||
    second.bestScore - first.bestScore ||
    second.attemptCount - first.attemptCount ||
    first.doctorId - second.doctorId
  );
}
