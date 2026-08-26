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
      metrics({
        attemptCount: 1,
        passedCount: 1,
        averageScore: 90,
        bestScore: 90,
      }),
    );
    const regular = calculateRankingScore(
      metrics({
        attemptCount: 5,
        passedCount: 5,
        averageScore: 90,
        bestScore: 90,
      }),
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
    const build = () => [doctor(9, {}), doctor(3, {}), doctor(7, {})];

    const first = build()
      .sort(compareRanked)
      .map((row) => row.doctorId);
    const second = build()
      .sort(compareRanked)
      .map((row) => row.doctorId);

    expect(first).toEqual(second);
    expect(first).toEqual([3, 7, 9]);
  });
});

describe('configurable weights', () => {
  const onlyAverage = {
    weights: { averageScore: 1, bestScore: 0, volume: 0, passRate: 0 },
    volumeTargetAttempts: 5,
  };

  it('follows the configured weights instead of the defaults', () => {
    // Faqat o'rtacha ball hisobga olinsa, bitta urinishdagi 90% ham 90 ball.
    const score = calculateRankingScore(
      metrics({
        attemptCount: 1,
        passedCount: 0,
        averageScore: 90,
        bestScore: 90,
      }),
      onlyAverage,
    );

    expect(score).toBe(90);
  });

  it('keeps the score on a 0..100 scale when weights do not sum to one', () => {
    const doubled = {
      weights: { averageScore: 1, bestScore: 1, volume: 1, passRate: 1 },
      volumeTargetAttempts: 5,
    };

    const score = calculateRankingScore(
      metrics({
        attemptCount: 10,
        passedCount: 10,
        averageScore: 100,
        bestScore: 100,
      }),
      doubled,
    );

    expect(score).toBe(100);
  });

  it('reaches the full volume score at the configured target', () => {
    const onlyVolume = {
      weights: { averageScore: 0, bestScore: 0, volume: 1, passRate: 0 },
      volumeTargetAttempts: 3,
    };

    expect(
      calculateRankingScore(metrics({ attemptCount: 3 }), onlyVolume),
    ).toBe(100);
    expect(
      calculateRankingScore(metrics({ attemptCount: 1 }), onlyVolume),
    ).toBeCloseTo(33.3, 1);
  });

  it('sorts by the configured weights', () => {
    const doctor = (id: number, partial: Partial<RankingMetrics>) => ({
      doctorId: id,
      ...metrics(partial),
    });

    const many = doctor(1, {
      attemptCount: 10,
      passedCount: 10,
      averageScore: 85,
      bestScore: 85,
    });
    const one = doctor(2, {
      attemptCount: 1,
      passedCount: 1,
      averageScore: 95,
      bestScore: 95,
    });

    // Standart vaznlarda hajm muhim — ko'p topshirgan oldinda.
    expect([many, one].sort(compareRanked).map((row) => row.doctorId)).toEqual([
      1, 2,
    ]);

    // Faqat o'rtacha ballga o'tsak — tartib teskarisiga o'zgaradi.
    expect(
      [many, one]
        .sort((first, second) => compareRanked(first, second, onlyAverage))
        .map((row) => row.doctorId),
    ).toEqual([2, 1]);
  });
});
