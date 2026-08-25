import { AttemptStatus, QualificationLevel } from 'src/generated/prisma/enums';

import { AttemptEvaluator, type AttemptSnapshot } from './attempt-evaluator';

function snapshot(
  selections: (boolean | null)[],
  passingScore = 70,
): AttemptSnapshot {
  return {
    passingScore,
    questions: selections.map((isCorrect, index) => ({
      id: index + 1,
      selectedOption:
        isCorrect === null ? null : { id: index + 100, isCorrect },
    })),
  };
}

describe('AttemptEvaluator', () => {
  const evaluator = new AttemptEvaluator();

  it('counts correct and incorrect answers', () => {
    const result = evaluator.evaluate(
      snapshot([true, true, false, false, true]),
      false,
    );

    expect(result.totalCount).toBe(5);
    expect(result.correctCount).toBe(3);
    expect(result.incorrectCount).toBe(2);
    expect(result.score).toBe(60);
  });

  it('treats unanswered questions as incorrect', () => {
    const result = evaluator.evaluate(
      snapshot([true, null, null, null]),
      false,
    );

    expect(result.correctCount).toBe(1);
    expect(result.incorrectCount).toBe(3);
    expect(result.score).toBe(25);
  });

  it('passes only when the score reaches the exam threshold', () => {
    expect(
      evaluator.evaluate(snapshot([true, true, true, false], 70), false).passed,
    ).toBe(true);
    expect(
      evaluator.evaluate(snapshot([true, true, false, false], 70), false)
        .passed,
    ).toBe(false);
  });

  it('treats the threshold itself as a pass', () => {
    const result = evaluator.evaluate(snapshot([true, false], 50), false);

    expect(result.score).toBe(50);
    expect(result.passed).toBe(true);
  });

  it('assigns the qualification band from the score', () => {
    const result = evaluator.evaluate(
      snapshot([true, true, true, true, false]),
      false,
    );

    expect(result.score).toBe(80);
    expect(result.qualification).toBe(QualificationLevel.GOOD);
  });

  it('marks an expired attempt as failed even with a passing score', () => {
    const result = evaluator.evaluate(
      snapshot([true, true, true, true], 70),
      true,
    );

    expect(result.status).toBe(AttemptStatus.EXPIRED);
    expect(result.score).toBe(100);
    expect(result.qualification).toBe(QualificationLevel.EXPERT);
    expect(result.passed).toBe(false);
  });

  it('reports per-question grades for persistence', () => {
    const result = evaluator.evaluate(snapshot([true, false, null]), false);

    expect(result.gradedQuestions).toEqual([
      { id: 1, isCorrect: true },
      { id: 2, isCorrect: false },
      { id: 3, isCorrect: false },
    ]);
  });

  it('never derives the result from a client-supplied value', () => {
    const forged = {
      ...snapshot([false, false]),
      score: 100,
      passed: true,
    } as AttemptSnapshot;

    const result = evaluator.evaluate(forged, false);

    expect(result.score).toBe(0);
    expect(result.passed).toBe(false);
  });
});
