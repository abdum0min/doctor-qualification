import { Injectable, NotFoundException } from '@nestjs/common';

import { CursorPaginated } from 'src/common/interfaces/api-response.interface';
import { decodeCursor } from 'src/common/utils/cursor.util';
import { buildCursorPaginated } from 'src/common/utils/pagination.util';
import { Prisma } from 'src/generated/prisma/client';
import { Difficulty } from 'src/generated/prisma/enums';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { SpecialtiesService } from 'src/modules/specialties/specialties.service';

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
  text: string;
  difficulty: Difficulty;
  isActive: boolean;
  specialty: { id: number; name: string };
  options: QuestionOptionView[];
  createdAt: Date;
  updatedAt: Date;
}

/** Admin ko'rinishida to'g'ri javob ochib beriladi — global `omit` bekor qilinadi. */
const adminSelect = {
  id: true,
  text: true,
  difficulty: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  specialty: { select: { id: true, name: true } },
  options: {
    select: { id: true, text: true, isCorrect: true },
    orderBy: { position: 'asc' },
  },
} satisfies Prisma.QuestionSelect;

@Injectable()
export class QuestionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly specialtiesService: SpecialtiesService,
  ) {}

  async findMany(
    query: QuestionQueryDto,
  ): Promise<CursorPaginated<QuestionView>> {
    const cursor = decodeCursor(query.cursor);

    const rows = await this.prisma.question.findMany({
      where: buildWhere(query),
      select: adminSelect,
      take: query.limit + 1,
      ...(cursor ? { cursor: { id: cursor.id }, skip: 1 } : {}),
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });

    return buildCursorPaginated(rows, query.limit, 'createdAt');
  }

  async findOne(id: number): Promise<QuestionView> {
    const question = await this.prisma.question.findUnique({
      where: { id },
      select: adminSelect,
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return question;
  }

  async create(dto: CreateQuestionDto): Promise<QuestionView> {
    await this.specialtiesService.ensureActive(dto.specialtyId);

    return this.prisma.question.create({
      data: {
        specialtyId: dto.specialtyId,
        text: dto.text,
        difficulty: dto.difficulty,
        isActive: dto.isActive ?? true,
        options: { create: toOptionRows(dto.options) },
      },
      select: adminSelect,
    });
  }

  /**
   * Variantlar to'liq almashtiriladi — qisman yangilash tartib va
   * "aynan bitta to'g'ri javob" qoidasini buzishi mumkin.
   */
  async update(id: number, dto: UpdateQuestionDto): Promise<QuestionView> {
    const { options, specialtyId, ...fields } = dto;

    if (specialtyId) {
      await this.specialtiesService.ensureActive(specialtyId);
    }

    await this.ensureExists(id);

    return this.prisma.$transaction(async (tx) => {
      if (options) {
        await tx.questionOption.deleteMany({ where: { questionId: id } });
      }

      return tx.question.update({
        where: { id },
        data: {
          ...fields,
          ...(specialtyId ? { specialtyId } : {}),
          ...(options ? { options: { create: toOptionRows(options) } } : {}),
        },
        select: adminSelect,
      });
    });
  }

  async remove(id: number): Promise<null> {
    await this.ensureExists(id);
    await this.prisma.question.delete({ where: { id } });

    return null;
  }

  private async ensureExists(id: number): Promise<void> {
    const exists = await this.prisma.question.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!exists) {
      throw new NotFoundException('Question not found');
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

function buildWhere(query: QuestionQueryDto): Prisma.QuestionWhereInput {
  return {
    ...(query.specialtyId ? { specialtyId: query.specialtyId } : {}),
    ...(query.difficulty ? { difficulty: query.difficulty } : {}),
    ...(query.status
      ? { isActive: query.status === QuestionStatus.Active }
      : {}),
    ...(query.search
      ? { text: { contains: query.search, mode: 'insensitive' as const } }
      : {}),
  };
}
