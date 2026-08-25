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

  async findMany(query: QuestionQueryDto): Promise<Paginated<QuestionView>> {
    const where = buildWhere(query);

    const [rows, total] = await Promise.all([
      this.prisma.question.findMany({
        where,
        select: adminSelect,
        ...toSkipTake(query),
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      }),
      this.prisma.question.count({ where }),
    ]);

    return buildPaginated(rows, total, query);
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

    const current = await this.ensureExists(id);

    if (current.isActive && fields.isActive === false) {
      await this.ensureExamsStaySatisfiable(current);
    }

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
    const question = await this.ensureExists(id);

    if (question.isActive) {
      await this.ensureExamsStaySatisfiable(question);
    }

    await this.prisma.question.delete({ where: { id } });

    return null;
  }

  /**
   * Faol savolni olib tashlash mavjud imtihonni ishga tushib bo'lmaydigan
   * holatga keltirmasligi kerak — sozlama va savol bazasi doim mos turadi.
   */
  private async ensureExamsStaySatisfiable(question: {
    specialtyId: number;
    difficulty: Difficulty;
  }): Promise<void> {
    const exams = await this.prisma.exam.findMany({
      where: {
        specialtyId: question.specialtyId,
        isActive: true,
        OR: [{ difficulty: null }, { difficulty: question.difficulty }],
      },
      select: { title: true, questionCount: true, difficulty: true },
    });

    if (exams.length === 0) {
      return;
    }

    const blocked = await Promise.all(
      exams.map(async (exam) => {
        const remaining =
          (await this.prisma.question.count({
            where: {
              specialtyId: question.specialtyId,
              isActive: true,
              ...(exam.difficulty ? { difficulty: exam.difficulty } : {}),
            },
          })) - 1;

        return remaining < exam.questionCount ? exam : null;
      }),
    );

    const broken = blocked.find((exam) => exam !== null);

    if (broken) {
      throw new BadRequestException(
        `"${broken.title}" needs ${broken.questionCount} questions — deactivate that exam or add more questions first`,
      );
    }
  }

  private async ensureExists(id: number): Promise<{
    specialtyId: number;
    difficulty: Difficulty;
    isActive: boolean;
  }> {
    const exists = await this.prisma.question.findUnique({
      where: { id },
      select: { specialtyId: true, difficulty: true, isActive: true },
    });

    if (!exists) {
      throw new NotFoundException('Question not found');
    }

    return exists;
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
