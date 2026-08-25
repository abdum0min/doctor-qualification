import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from 'src/generated/prisma/client';
import {
  AttemptStatus,
  Difficulty,
  QualificationLevel,
} from 'src/generated/prisma/enums';
import { PrismaService } from 'src/modules/prisma/prisma.service';

import { AttemptEvaluator } from './attempt-evaluator';
import { SaveAnswerDto } from './dto/save-answer.dto';

export interface AttemptOptionView {
  id: number;
  text: string;
}

export interface AttemptQuestionView {
  id: number;
  position: number;
  questionText: string;
  difficulty: Difficulty;
  selectedOptionId: number | null;
  options: AttemptOptionView[];
}

export interface AttemptView {
  id: number;
  status: AttemptStatus;
  exam: { id: number; title: string; specialty: { id: number; name: string } };
  questionCount: number;
  timeLimitMinutes: number;
  passingScore: number;
  startedAt: Date;
  deadlineAt: Date;
  completedAt: Date | null;
  /** Server hisoblagan qolgan vaqt — mijoz taymeri faqat ko'rsatish uchun. */
  remainingSeconds: number;
  answeredCount: number;
  correctCount: number | null;
  score: number | null;
  qualification: QualificationLevel | null;
  passed: boolean | null;
  questions: AttemptQuestionView[];
}

/** `isCorrect` bu tanlovda umuman yo'q — imtihon davomida sizib chiqa olmaydi. */
const attemptSelect = {
  id: true,
  status: true,
  questionCount: true,
  timeLimitMinutes: true,
  passingScore: true,
  startedAt: true,
  deadlineAt: true,
  completedAt: true,
  correctCount: true,
  score: true,
  qualification: true,
  passed: true,
  exam: {
    select: {
      id: true,
      title: true,
      specialty: { select: { id: true, name: true } },
    },
  },
  questions: {
    select: {
      id: true,
      position: true,
      questionText: true,
      difficulty: true,
      selectedOptionId: true,
      options: {
        select: { id: true, text: true },
        orderBy: { position: 'asc' },
      },
    },
    orderBy: { position: 'asc' },
  },
} satisfies Prisma.ExamAttemptSelect;

type AttemptRow = Prisma.ExamAttemptGetPayload<{
  select: typeof attemptSelect;
}>;

@Injectable()
export class AttemptsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly evaluator: AttemptEvaluator,
  ) {}

  async start(userId: number, examId: number): Promise<AttemptView> {
    const doctorProfile = await this.requireDoctorProfile(userId);

    const exam = await this.prisma.exam.findFirst({
      where: { id: examId, isActive: true, specialty: { isActive: true } },
      select: {
        id: true,
        specialtyId: true,
        difficulty: true,
        questionCount: true,
        timeLimitMinutes: true,
        passingScore: true,
      },
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    await this.expireStaleAttempts(doctorProfile.id);

    const existing = await this.prisma.examAttempt.findFirst({
      where: {
        doctorProfileId: doctorProfile.id,
        status: AttemptStatus.IN_PROGRESS,
      },
      select: { id: true, examId: true },
    });

    if (existing) {
      if (existing.examId !== examId) {
        throw new ConflictException(
          'Finish or abandon your current attempt before starting a new one',
        );
      }

      return this.findOne(userId, existing.id);
    }

    const questionIds = await this.sampleQuestionIds(
      exam.specialtyId,
      exam.difficulty,
      exam.questionCount,
    );

    const questions = await this.prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: {
        id: true,
        text: true,
        difficulty: true,
        options: {
          select: { text: true, isCorrect: true, position: true },
          orderBy: { position: 'asc' },
        },
      },
    });

    const ordered = questionIds.map((id) =>
      questions.find((question) => question.id === id)!,
    );

    const now = new Date();
    const attempt = await this.prisma.examAttempt.create({
      data: {
        examId: exam.id,
        doctorProfileId: doctorProfile.id,
        questionCount: ordered.length,
        timeLimitMinutes: exam.timeLimitMinutes,
        passingScore: exam.passingScore,
        startedAt: now,
        deadlineAt: new Date(now.getTime() + exam.timeLimitMinutes * 60_000),
        questions: {
          create: ordered.map((question, position) => ({
            questionId: question.id,
            position,
            questionText: question.text,
            difficulty: question.difficulty,
            options: {
              create: shuffle(question.options).map(
                (option, optionPosition) => ({
                  position: optionPosition,
                  text: option.text,
                  isCorrect: option.isCorrect,
                }),
              ),
            },
          })),
        },
      },
      select: attemptSelect,
    });

    return toView(attempt);
  }

  async findOne(userId: number, attemptId: number): Promise<AttemptView> {
    const doctorProfile = await this.requireDoctorProfile(userId);
    const attempt = await this.requireOwnAttempt(doctorProfile.id, attemptId);

    if (isPastDeadline(attempt)) {
      return this.finalize(attempt.id, true);
    }

    return toView(attempt);
  }

  async saveAnswer(
    userId: number,
    attemptId: number,
    dto: SaveAnswerDto,
  ): Promise<AttemptQuestionView> {
    const doctorProfile = await this.requireDoctorProfile(userId);
    const attempt = await this.requireOwnAttempt(doctorProfile.id, attemptId);

    if (attempt.status !== AttemptStatus.IN_PROGRESS) {
      throw new ConflictException('This attempt is already closed');
    }

    if (isPastDeadline(attempt)) {
      await this.finalize(attempt.id, true);
      throw new ConflictException('Time is up — the attempt has been closed');
    }

    // Savol shu urinishga tegishli ekani tekshiriladi: begona `id` qabul qilinmaydi.
    const question = attempt.questions.find(
      (item) => item.id === dto.attemptQuestionId,
    );

    if (!question) {
      throw new NotFoundException('Question does not belong to this attempt');
    }

    if (
      dto.attemptOptionId !== null &&
      !question.options.some((option) => option.id === dto.attemptOptionId)
    ) {
      throw new BadRequestException('Option does not belong to this question');
    }

    const updated = await this.prisma.attemptQuestion.update({
      where: { id: question.id },
      data: { selectedOptionId: dto.attemptOptionId },
      select: attemptSelect.questions.select,
    });

    return updated;
  }

  async submit(userId: number, attemptId: number): Promise<AttemptView> {
    const doctorProfile = await this.requireDoctorProfile(userId);
    const attempt = await this.requireOwnAttempt(doctorProfile.id, attemptId);

    if (attempt.status !== AttemptStatus.IN_PROGRESS) {
      throw new ConflictException('This attempt is already closed');
    }

    return this.finalize(attempt.id, isPastDeadline(attempt));
  }

  /**
   * Baholash va yozib qo'yish bitta tranzaksiyada — natija yarim holatda
   * qolmasligi kerak.
   */
  private async finalize(
    attemptId: number,
    expired: boolean,
  ): Promise<AttemptView> {
    const graded = await this.prisma.$transaction(async (tx) => {
      const snapshot = await tx.examAttempt.findUniqueOrThrow({
        where: { id: attemptId },
        select: {
          passingScore: true,
          questions: {
            select: {
              id: true,
              selectedOption: { select: { id: true, isCorrect: true } },
            },
          },
        },
      });

      const result = this.evaluator.evaluate(snapshot, expired);

      await Promise.all(
        result.gradedQuestions.map((question) =>
          tx.attemptQuestion.update({
            where: { id: question.id },
            data: { isCorrect: question.isCorrect },
          }),
        ),
      );

      return tx.examAttempt.update({
        where: { id: attemptId },
        data: {
          status: result.status,
          completedAt: new Date(),
          correctCount: result.correctCount,
          score: result.score,
          qualification: result.qualification,
          passed: result.passed,
        },
        select: attemptSelect,
      });
    });

    return toView(graded);
  }

  /** Muddati o'tgan, ammo yakunlanmagan urinishlar avtomatik yopiladi. */
  private async expireStaleAttempts(doctorProfileId: number): Promise<void> {
    const stale = await this.prisma.examAttempt.findMany({
      where: {
        doctorProfileId,
        status: AttemptStatus.IN_PROGRESS,
        deadlineAt: { lt: new Date() },
      },
      select: { id: true },
    });

    for (const attempt of stale) {
      await this.finalize(attempt.id, true);
    }
  }

  private async sampleQuestionIds(
    specialtyId: number,
    difficulty: Difficulty | null,
    count: number,
  ): Promise<number[]> {
    const candidates = await this.prisma.question.findMany({
      where: {
        specialtyId,
        isActive: true,
        ...(difficulty ? { difficulty } : {}),
      },
      select: { id: true },
    });

    if (candidates.length < count) {
      throw new BadRequestException(
        `This exam needs ${count} questions but only ${candidates.length} are available`,
      );
    }

    return shuffle(candidates)
      .slice(0, count)
      .map((question) => question.id);
  }

  private async requireDoctorProfile(userId: number): Promise<{ id: number }> {
    const profile = await this.prisma.doctorProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Doctor profile not found');
    }

    return profile;
  }

  private async requireOwnAttempt(
    doctorProfileId: number,
    attemptId: number,
  ): Promise<AttemptRow> {
    const attempt = await this.prisma.examAttempt.findFirst({
      where: { id: attemptId, doctorProfileId },
      select: attemptSelect,
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    return attempt;
  }
}

function isPastDeadline(attempt: {
  status: AttemptStatus;
  deadlineAt: Date;
}): boolean {
  return (
    attempt.status === AttemptStatus.IN_PROGRESS &&
    attempt.deadlineAt.getTime() < Date.now()
  );
}

function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapWith = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapWith]] = [result[swapWith], result[index]];
  }

  return result;
}

function toView(attempt: AttemptRow): AttemptView {
  const remainingMs = attempt.deadlineAt.getTime() - Date.now();

  return {
    ...attempt,
    remainingSeconds:
      attempt.status === AttemptStatus.IN_PROGRESS
        ? Math.max(0, Math.floor(remainingMs / 1000))
        : 0,
    answeredCount: attempt.questions.filter(
      (question) => question.selectedOptionId !== null,
    ).length,
  };
}
