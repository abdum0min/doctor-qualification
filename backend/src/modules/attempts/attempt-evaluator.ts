import { Injectable } from '@nestjs/common';

import {
  calculateScore,
  qualificationForScore,
} from 'src/domain/qualification';
import { AttemptStatus, QualificationLevel } from 'src/generated/prisma/enums';

export interface GradedQuestion {
  id: number;
  isCorrect: boolean;
}

export interface AttemptSnapshot {
  passingScore: number;
  questions: {
    id: number;
    selectedOption: { id: number; isCorrect: boolean } | null;
  }[];
}

export interface AttemptResult {
  status: AttemptStatus;
  totalCount: number;
  correctCount: number;
  incorrectCount: number;
  score: number;
  qualification: QualificationLevel;
  passed: boolean;
  gradedQuestions: GradedQuestion[];
}

/**
 * Yagona baholash nuqtasi. Mijoz yuborgan hech qanday ball ishlatilmaydi —
 * natija faqat urinish nusxasidagi `isCorrect` qiymatlaridan hisoblanadi.
 */
@Injectable()
export class AttemptEvaluator {
  evaluate(attempt: AttemptSnapshot, expired: boolean): AttemptResult {
    const gradedQuestions = attempt.questions.map((question) => ({
      id: question.id,
      isCorrect: question.selectedOption?.isCorrect === true,
    }));

    const totalCount = gradedQuestions.length;
    const correctCount = gradedQuestions.filter(
      (item) => item.isCorrect,
    ).length;
    const score = calculateScore(correctCount, totalCount);

    return {
      status: expired ? AttemptStatus.EXPIRED : AttemptStatus.SUBMITTED,
      totalCount,
      correctCount,
      incorrectCount: totalCount - correctCount,
      score,
      qualification: qualificationForScore(score),
      // Vaqtida yakunlanmagan urinish sertifikat bermaydi (talab 15-band).
      passed: !expired && score >= attempt.passingScore,
      gradedQuestions,
    };
  }
}
