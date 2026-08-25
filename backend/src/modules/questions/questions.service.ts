import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Paginated } from 'src/common/interfaces/api-response.interface';
import { buildPaginated, toSkipTake } from 'src/common/utils/pagination.util';
import { Prisma } from 'src/generated/prisma/client';
import { Difficulty } from 'src/generated/prisma/enums';
import { PrismaService } from 'src/modules/prisma/prisma.service';

import {
  CreateQuestionDto,
  QuestionOptionInput,
} from './dto/create-question.dto';
import { QuestionQueryDto, QuestionStatus } from './dto/question-query.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

export interface QuestionOptionView {
  id: number;
  text: string;
  isCorrect: boolean;
}

export interface QuestionView {
  id: number;
  examId: number;
  text: string;
  difficulty: Difficulty;
  position: number;
  isActive: boolean;
  options: QuestionOptionView[];
  createdAt: Date;
  updatedAt: Date;
}

/** Admin ko'rinishida to'g'ri javob ochib beriladi — global `omit` bekor qilinadi. */
const adminSelect = {
  id: true,
  examId: true,
  text: true,
  difficulty: true,
  position: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  options: {
    select: { id: true, text: true, isCorrect: true },
    orderBy: { position: 'asc' },
  },
} satisfies Prisma.QuestionSelect;

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(
    examId: number,
    query: QuestionQueryDto,
  ): Promise<Paginated<QuestionView>> {
    await this.ensureExamExists(examId);

    const where = buildWhere(examId, query);

    const [rows, total] = await Promise.all([
      this.prisma.question.findMany({
        where,
        select: adminSelect,
        ...toSkipTake(query),
        orderBy: { position: 'asc' },
      }),
      this.prisma.question.count({ where }),
    ]);

    return buildPaginated(rows, total, query);
  }

  async findOne(examId: number, id: number): Promise<QuestionView> {
    const question = await this.prisma.question.findFirst({
      where: { id, examId },
      select: adminSelect,
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return question;
  }

  async create(examId: number, dto: CreateQuestionDto): Promise<QuestionView> {
    await this.ensureExamExists(examId);

    const last = await this.prisma.question.findFirst({
      where: { examId },
      select: { position: true },
      orderBy: { position: 'desc' },
    });

    return this.prisma.question.create({
      data: {
        examId,
        text: dto.text,
        difficulty: dto.difficulty,
        isActive: dto.isActive ?? true,
        position: (last?.position ?? -1) + 1,
        options: { create: toOptionRows(dto.options) },
      },
      select: adminSelect,
    });
  }

  /**
   * Variantlar to'liq almashtiriladi — qisman yangilash tartib va
   * "aynan bitta to'g'ri javob" qoidasini buzishi mumkin.
   */
  async update(
    examId: number,
    id: number,
    dto: UpdateQuestionDto,
  ): Promise<QuestionView> {
    const { options, ...fields } = dto;
    const current = await this.findOne(examId, id);

    if (current.isActive && fields.isActive === false) {
      await this.ensureExamStaysSatisfiable(examId);
    }

    return this.prisma.$transaction(async (tx) => {
      if (options) {
        await tx.questionOption.deleteMany({ where: { questionId: id } });
      }

      return tx.question.update({
        where: { id },
        data: {
          ...fields,
          ...(options ? { options: { create: toOptionRows(options) } } : {}),
        },
        select: adminSelect,
      });
    });
  }

  async remove(examId: number, id: number): Promise<null> {
    const question = await this.findOne(examId, id);

    if (question.isActive) {
      await this.ensureExamStaysSatisfiable(examId);
    }

    await this.prisma.question.delete({ where: { id } });

    return null;
  }

  /**
   * Faol savolni olib tashlash imtihonni ishga tushib bo'lmaydigan holatga
   * keltirmasligi kerak — sozlama va savollar soni doim mos turadi.
   */
  private async ensureExamStaysSatisfiable(examId: number): Promise<void> {
    const exam = await this.prisma.exam.findUniqueOrThrow({
      where: { id: examId },
      select: { title: true, questionCount: true, isActive: true },
    });

    if (!exam.isActive) {
      return;
    }

    const remaining =
      (await this.prisma.question.count({
        where: { examId, isActive: true },
      })) - 1;

    if (remaining < exam.questionCount) {
      throw new BadRequestException(
        `"${exam.title}" needs ${exam.questionCount} questions — lower the question count or deactivate the exam first`,
      );
    }
  }

  private async ensureExamExists(examId: number): Promise<void> {
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
      select: { id: true },
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }
  }
}

function toOptionRows(options: QuestionOptionInput[]) {
  return options.map((option, index) => ({
    text: option.text,
    isCorrect: option.isCorrect,
    position: index,
  }));
}

function buildWhere(
  examId: number,
  query: QuestionQueryDto,
): Prisma.QuestionWhereInput {
  return {
    examId,
    ...(query.difficulty ? { difficulty: query.difficulty } : {}),
    ...(query.status
      ? { isActive: query.status === QuestionStatus.Active }
      : {}),
    ...(query.search
      ? { text: { contains: query.search, mode: 'insensitive' as const } }
      : {}),
  };
}
