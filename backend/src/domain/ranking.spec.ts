import {
  calculateRankingScore,
  compareRanked,
  VOLUME_TARGET_ATTEMPTS,
  type RankingMetrics,
} from './ranking';

function metrics(partial: Partial<RankingMetrics> = {}): RankingMetrics {
  return {
    attemptCount: 1,
    passedCount: 1,
    averageScore: 80,
    bestScore: 80,
    ...partial,
  };
}

describe('calculateRankingScore', () => {
  it('returns zero without attempts', () => {
    expect(calculateRankingScore(metrics({ attemptCount: 0 }))).toBe(0);
  });

  it('gives a perfect score to a consistently perfect doctor', () => {
    const score = calculateRankingScore(
      metrics({
        attemptCount: VOLUME_TARGET_ATTEMPTS,
        passedCount: VOLUME_TARGET_ATTEMPTS,
        averageScore: 100,
        bestScore: 100,
      }),
    );

    expect(score).toBe(100);
  });

  it('rewards volume — more attempts at the same average rank higher', () => {
    const rare = calculateRankingScore(
      metrics({ attemptCount: 1, passedCount: 1, averageScore: 90, bestScore: 90 }),
    );
    const regular = calculateRankingScore(
      metrics({ attemptCount: 5, passedCount: 5, averageScore: 90, bestScore: 90 }),
    );

    expect(regular).toBeGreaterThan(rare);
  });

  it('stops rewarding volume past the target', () => {
    const atTarget = calculateRankingScore(
      metrics({
        attemptCount: VOLUME_TARGET_ATTEMPTS,
        passedCount: VOLUME_TARGET_ATTEMPTS,
      }),
    );
    const wayPast = calculateRankingScore(
      metrics({ attemptCount: 50, passedCount: 50 }),
    );

    expect(wayPast).toBe(atTarget);
  });

  it('penalises failed attempts through the pass rate', () => {
    const allPassed = calculateRankingScore(
      metrics({ attemptCount: 4, passedCount: 4 }),
    );
    const halfPassed = calculateRankingScore(
      metrics({ attemptCount: 4, passedCount: 2 }),
    );

    expect(halfPassed).toBeLessThan(allPassed);
  });
});

describe('compareRanked', () => {
  const doctor = (id: number, partial: Partial<RankingMetrics>) => ({
    doctorId: id,
    ...metrics(partial),
  });

  it('orders by score, highest first', () => {
    const rows = [
      doctor(1, { averageScore: 70, bestScore: 70 }),
      doctor(2, { averageScore: 95, bestScore: 95 }),
      doctor(3, { averageScore: 85, bestScore: 85 }),
    ].sort(compareRanked);

    expect(rows.map((row) => row.doctorId)).toEqual([2, 3, 1]);
  });

  it('breaks ties deterministically so pagination stays stable', () => {
    const build = () => [
      doctor(9, {}),
      doctor(3, {}),
      doctor(7, {}),
    ];

    const first = build().sort(compareRanked).map((row) => row.doctorId);
    const second = build().sort(compareRanked).map((row) => row.doctorId);

    expect(first).toEqual(second);
    expect(first).toEqual([3, 7, 9]);
  });
});
