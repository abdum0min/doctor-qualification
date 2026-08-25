import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from 'src/generated/prisma/client';
import { Difficulty } from 'src/generated/prisma/enums';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { SpecialtiesService } from 'src/modules/specialties/specialties.service';

import { CreateExamDto } from './dto/create-exam.dto';
import { ExamQueryDto, ExamStatus } from './dto/exam-query.dto';
import { UpdateExamDto } from './dto/update-exam.dto';

export interface ExamView {
  id: number;
  title: string;
  description: string | null;
  questionCount: number;
  timeLimitMinutes: number;
  passingScore: number;
  difficulty: Difficulty | null;
  isActive: boolean;
  specialty: { id: number; name: string };
}

export interface AdminExamView extends ExamView {
  /** Sozlamaga mos faol savollar soni — imkonsiz konfiguratsiyani ko'rsatadi. */
  availableQuestions: number;
  createdAt: Date;
  updatedAt: Date;
}

const examSelect = {
  id: true,
  title: true,
  description: true,
  questionCount: true,
  timeLimitMinutes: true,
  passingScore: true,
  difficulty: true,
  isActive: true,
  specialty: { select: { id: true, name: true } },
} satisfies Prisma.ExamSelect;

@Injectable()
export class ExamsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly specialtiesService: SpecialtiesService,
  ) {}

  findActive(query: ExamQueryDto): Promise<ExamView[]> {
    return this.prisma.exam.findMany({
      where: {
        isActive: true,
        specialty: { isActive: true },
        ...(query.specialtyId ? { specialtyId: query.specialtyId } : {}),
      },
      select: examSelect,
      orderBy: [{ specialtyId: 'asc' }, { title: 'asc' }],
    });
  }

  async findAll(query: ExamQueryDto): Promise<AdminExamView[]> {
    const [exams, questionCounts] = await Promise.all([
      this.prisma.exam.findMany({
        where: {
          ...(query.specialtyId ? { specialtyId: query.specialtyId } : {}),
          ...(query.status
            ? { isActive: query.status === ExamStatus.Active }
            : {}),
        },
        select: { ...examSelect, createdAt: true, updatedAt: true },
        orderBy: [{ specialtyId: 'asc' }, { title: 'asc' }],
      }),
      this.prisma.question.groupBy({
        by: ['specialtyId', 'difficulty'],
        where: { isActive: true },
        _count: { _all: true },
      }),
    ]);

    return exams.map((exam) => ({
      ...exam,
      availableQuestions: questionCounts
        .filter(
          (row) =>
            row.specialtyId === exam.specialty.id &&
            (exam.difficulty === null || row.difficulty === exam.difficulty),
        )
        .reduce((total, row) => total + row._count._all, 0),
    }));
  }

  async findOneActive(id: number): Promise<ExamView> {
    const exam = await this.prisma.exam.findFirst({
      where: { id, isActive: true, specialty: { isActive: true } },
      select: examSelect,
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    return exam;
  }

  async create(dto: CreateExamDto): Promise<ExamView> {
    await this.specialtiesService.ensureActive(dto.specialtyId);
    await this.ensureEnoughQuestions(
      dto.specialtyId,
      dto.difficulty ?? null,
      dto.questionCount,
    );

    return this.prisma.exam.create({
      data: { ...dto, isActive: dto.isActive ?? true },
      select: examSelect,
    });
  }

  async update(id: number, dto: UpdateExamDto): Promise<ExamView> {
    const current = await this.prisma.exam.findUnique({
      where: { id },
      select: { specialtyId: true, difficulty: true, questionCount: true },
    });

    if (!current) {
      throw new NotFoundException('Exam not found');
    }

    if (dto.specialtyId) {
      await this.specialtiesService.ensureActive(dto.specialtyId);
    }

    await this.ensureEnoughQuestions(
      dto.specialtyId ?? current.specialtyId,
      dto.difficulty === undefined ? current.difficulty : dto.difficulty,
      dto.questionCount ?? current.questionCount,
    );

    return this.prisma.exam.update({
      where: { id },
      data: dto,
      select: examSelect,
    });
  }

  countAvailableQuestions(
    specialtyId: number,
    difficulty: Difficulty | null,
  ): Promise<number> {
    return this.prisma.question.count({
      where: {
        specialtyId,
        isActive: true,
        ...(difficulty ? { difficulty } : {}),
      },
    });
  }

  /** Savollar yetmaydigan sozlama saqlanmaydi — imtihon boshlanmay qolmasin. */
  private async ensureEnoughQuestions(
    specialtyId: number,
    difficulty: Difficulty | null,
    questionCount: number,
  ): Promise<void> {
    const available = await this.countAvailableQuestions(
      specialtyId,
      difficulty,
    );

    if (available < questionCount) {
      throw new BadRequestException(
        `Only ${available} active questions match this configuration, but ${questionCount} are required`,
      );
    }
  }
}
