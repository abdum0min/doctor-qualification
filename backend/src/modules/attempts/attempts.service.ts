import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CursorPaginated } from 'src/common/interfaces/api-response.interface';
import { decodeCursor } from 'src/common/utils/cursor.util';
import { buildCursorPaginated } from 'src/common/utils/pagination.util';
import { Prisma } from 'src/generated/prisma/client';
import {
  AttemptStatus,
  Difficulty,
  QualificationLevel,
} from 'src/generated/prisma/enums';
import { CertificatesService } from 'src/modules/certificates/certificates.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';

import { AttemptEvaluator } from './attempt-evaluator';
import { AttemptHistoryQueryDto } from './dto/attempt-history-query.dto';
import { SaveAnswerDto } from './dto/save-answer.dto';

export interface AttemptOptionView {
  id: number;
  text: string;
  /** Faqat yakunlangan urinishda qaytadi. */
  isCorrect?: boolean;
}

export interface AttemptQuestionView {
  id: number;
  position: number;
  questionText: string;
  difficulty: Difficulty;
  selectedOptionId: number | null;
  isCorrect?: boolean | null;
  options: AttemptOptionView[];
}

export interface AttemptSummaryView {
  id: number;
  status: AttemptStatus;
  exam: { id: number; title: string; specialty: { id: number; name: string } };
  questionCount: number;
  timeLimitMinutes: number;
  passingScore: number;
  startedAt: Date;
  deadlineAt: Date;
  completedAt: Date | null;
  correctCount: number | null;
  score: number | null;
  qualification: QualificationLevel | null;
  passed: boolean | null;
}

export interface AttemptView extends AttemptSummaryView {
  /** Server hisoblagan qolgan vaqt — mijoz taymeri faqat ko'rsatish uchun. */
  remainingSeconds: number;
  answeredCount: number;
  questions: AttemptQuestionView[];
}

const summarySelect = {
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
} satisfies Prisma.ExamAttemptSelect;

/** Imtihon davomida: `isCorrect` bu tanlovda umuman yo'q. */
const inProgressSelect = {
  ...summarySelect,
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

/** Yakunlangandan keyin to'g'ri javoblar ochiladi — xatolarni tahlil qilish uchun. */
const reviewSelect = {
  ...summarySelect,
  questions: {
    select: {
      id: true,
      position: true,
      questionText: true,
      difficulty: true,
      selectedOptionId: true,
      isCorrect: true,
      options: {
        select: { id: true, text: true, isCorrect: true },
        orderBy: { position: 'asc' },
      },
    },
    orderBy: { position: 'asc' },
  },
} satisfies Prisma.ExamAttemptSelect;

type SummaryRow = Prisma.ExamAttemptGetPayload<{
  select: typeof summarySelect;
}>;
type InProgressRow = Prisma.ExamAttemptGetPayload<{
  select: typeof inProgressSelect;
}>;
type ReviewRow = Prisma.ExamAttemptGetPayload<{ select: typeof reviewSelect }>;

@Injectable()
export class AttemptsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly evaluator: AttemptEvaluator,
    private readonly certificatesService: CertificatesService,
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

    const questions = await this.sampleQuestions(
      exam.specialtyId,
      exam.difficulty,
      exam.questionCount,
    );

    const now = new Date();
    const attempt = await this.prisma.examAttempt.create({
      data: {
        examId: exam.id,
        doctorProfileId: doctorProfile.id,
        questionCount: questions.length,
        timeLimitMinutes: exam.timeLimitMinutes,
        passingScore: exam.passingScore,
        startedAt: now,
        deadlineAt: new Date(now.getTime() + exam.timeLimitMinutes * 60_000),
        questions: {
          create: questions.map((question, position) => ({
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
      select: inProgressSelect,
    });

    return toView(attempt);
  }

  async findOne(userId: number, attemptId: number): Promise<AttemptView> {
    const doctorProfile = await this.requireDoctorProfile(userId);
    const attempt = await this.requireOwnAttempt(doctorProfile.id, attemptId);

    if (isPastDeadline(attempt)) {
      return this.finalize(attempt.id, true);
    }

    if (attempt.status !== AttemptStatus.IN_PROGRESS) {
      return this.loadReview(attemptId);
    }

    const inProgress = await this.prisma.examAttempt.findUniqueOrThrow({
      where: { id: attemptId },
      select: inProgressSelect,
    });

    return toView(inProgress);
  }

  async findHistory(
    userId: number,
    query: AttemptHistoryQueryDto,
  ): Promise<CursorPaginated<AttemptSummaryView>> {
    const doctorProfile = await this.requireDoctorProfile(userId);
    const cursor = decodeCursor(query.cursor);

    const rows = await this.prisma.examAttempt.findMany({
      where: {
        doctorProfileId: doctorProfile.id,
        ...(query.examId ? { examId: query.examId } : {}),
      },
      select: summarySelect,
      take: query.limit + 1,
      ...(cursor ? { cursor: { id: cursor.id }, skip: 1 } : {}),
      orderBy: [{ startedAt: 'desc' }, { id: 'desc' }],
    });

    return buildCursorPaginated(rows, query.limit, 'startedAt');
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
    const question = await this.prisma.attemptQuestion.findFirst({
      where: { id: dto.attemptQuestionId, attemptId },
      select: { id: true, options: { select: { id: true } } },
    });

    if (!question) {
      throw new NotFoundException('Question does not belong to this attempt');
    }

    if (
      dto.attemptOptionId !== null &&
      !question.options.some((option) => option.id === dto.attemptOptionId)
    ) {
      throw new BadRequestException('Option does not belong to this question');
    }

    return this.prisma.attemptQuestion.update({
      where: { id: question.id },
      data: { selectedOptionId: dto.attemptOptionId },
      select: inProgressSelect.questions.select,
    });
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
    await this.prisma.$transaction(async (tx) => {
      const snapshot = await tx.examAttempt.findUniqueOrThrow({
        where: { id: attemptId },
        select: {
          doctorProfileId: true,
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

      const graded = await tx.examAttempt.update({
        where: { id: attemptId },
        data: {
          status: result.status,
          completedAt: new Date(),
          correctCount: result.correctCount,
          score: result.score,
          qualification: result.qualification,
          passed: result.passed,
        },
        select: {
          id: true,
          doctorProfileId: true,
          score: true,
          qualification: true,
          passed: true,
        },
      });

      // Natija va sertifikat birgalikda yoziladi — biri yozilib, ikkinchisi
      // yozilmay qolgan holat bo'lmasligi kerak.
      await this.certificatesService.issueForAttempt(tx, graded);
    });

    return this.loadReview(attemptId);
  }

  private async loadReview(attemptId: number): Promise<AttemptView> {
    const attempt = await this.prisma.examAttempt.findUniqueOrThrow({
      where: { id: attemptId },
      select: reviewSelect,
    });

    return toView(attempt);
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

  private async sampleQuestions(
    specialtyId: number,
    difficulty: Difficulty | null,
    count: number,
  ) {
    const candidates = await this.prisma.question.findMany({
      where: {
        specialtyId,
        isActive: true,
        ...(difficulty ? { difficulty } : {}),
      },
      select: {
        id: true,
        text: true,
        difficulty: true,
        options: {
          select: { text: true, isCorrect: true },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (candidates.length < count) {
      throw new BadRequestException(
        `This exam needs ${count} questions but only ${candidates.length} are available`,
      );
    }

    return shuffle(candidates).slice(0, count);
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
  ): Promise<SummaryRow> {
    const attempt = await this.prisma.examAttempt.findFirst({
      where: { id: attemptId, doctorProfileId },
      select: summarySelect,
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

function toView(attempt: InProgressRow | ReviewRow): AttemptView {
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
