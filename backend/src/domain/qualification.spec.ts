import { QualificationLevel } from 'src/generated/prisma/enums';

import { calculateScore, qualificationForScore } from './qualification';

describe('calculateScore', () => {
  it('returns a rounded percentage', () => {
    expect(calculateScore(2, 3)).toBe(67);
    expect(calculateScore(1, 3)).toBe(33);
    expect(calculateScore(17, 20)).toBe(85);
  });

  it('handles the boundaries', () => {
    expect(calculateScore(0, 10)).toBe(0);
    expect(calculateScore(10, 10)).toBe(100);
  });

  it('returns zero when there are no questions', () => {
    expect(calculateScore(0, 0)).toBe(0);
  });
});

describe('qualificationForScore', () => {
  it.each([
    [0, QualificationLevel.BEGINNER],
    [49, QualificationLevel.BEGINNER],
    [50, QualificationLevel.INTERMEDIATE],
    [69, QualificationLevel.INTERMEDIATE],
    [70, QualificationLevel.GOOD],
    [84, QualificationLevel.GOOD],
    [85, QualificationLevel.HIGH],
    [94, QualificationLevel.HIGH],
    [95, QualificationLevel.EXPERT],
    [100, QualificationLevel.EXPERT],
  ])('maps %i%% to %s', (score, expected) => {
    expect(qualificationForScore(score)).toBe(expected);
  });
});
