import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from 'src/generated/prisma/client';
import { NotificationType } from 'src/generated/prisma/enums';
import { NotificationsService } from 'src/modules/notifications/notifications.service';
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
  isActive: boolean;
  specialty: { id: number; name: string };
}

export interface AdminExamView extends ExamView {
  /** Imtihonga biriktirilgan faol savollar soni. */
  availableQuestions: number;
  attemptsCount: number;
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
  isActive: true,
  specialty: { select: { id: true, name: true } },
} satisfies Prisma.ExamSelect;

@Injectable()
export class ExamsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly specialtiesService: SpecialtiesService,
    private readonly notifications: NotificationsService,
  ) {}

  /** Savoli yetmaydigan imtihon shifokorga ko'rsatilmaydi. */
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
    const exams = await this.prisma.exam.findMany({
      where: {
        ...(query.specialtyId ? { specialtyId: query.specialtyId } : {}),
        ...(query.status
          ? { isActive: query.status === ExamStatus.Active }
          : {}),
      },
      select: {
        ...examSelect,
        createdAt: true,
        updatedAt: true,
        _count: { select: { questions: true, attempts: true } },
      },
      orderBy: [{ specialtyId: 'asc' }, { title: 'asc' }],
    });

    return exams.map(({ _count, ...exam }) => ({
      ...exam,
      availableQuestions: _count.questions,
      attemptsCount: _count.attempts,
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

  /**
   * Yangi imtihon savolsiz yaratiladi — admin uni ochib savollarni biriktiradi.
   * Shuning uchun bu yerda savollar soni tekshirilmaydi.
   */
  async create(dto: CreateExamDto): Promise<ExamView> {
    await this.specialtiesService.ensureActive(dto.specialtyId);

    const exam = await this.prisma.exam.create({
      data: { ...dto, isActive: dto.isActive ?? false },
      select: examSelect,
    });

    if (exam.isActive) {
      await this.announceExam(exam);
    }

    return exam;
  }

  async update(id: number, dto: UpdateExamDto): Promise<ExamView> {
    const current = await this.prisma.exam.findUnique({
      where: { id },
      select: { specialtyId: true, questionCount: true, isActive: true },
    });

    if (!current) {
      throw new NotFoundException('Exam not found');
    }

    if (dto.specialtyId) {
      await this.specialtiesService.ensureActive(dto.specialtyId);
    }

    const questionCount = dto.questionCount ?? current.questionCount;
    const willBeActive = dto.isActive ?? current.isActive;

    // Faol imtihon o'z savollaridan ko'p savol so'ray olmaydi.
    if (willBeActive) {
      await this.ensureEnoughQuestions(id, questionCount);
    }

    const exam = await this.prisma.exam.update({
      where: { id },
      data: dto,
      select: examSelect,
    });

    // Xabar faqat nofaoldan faolga o'tishda ketadi — har tahrirda emas.
    if (!current.isActive && exam.isActive) {
      await this.announceExam(exam);
    }

    return exam;
  }

  /** Imtihon nashr qilinganda shu yo'nalishdagi shifokorlarga xabar beriladi. */
  private async announceExam(exam: ExamView): Promise<void> {
    const userIds = await this.notifications.activeUserIdsBySpecialty(
      exam.specialty.id,
    );

    await this.notifications.notifyMany(userIds, {
      type: NotificationType.EXAM_PUBLISHED,
      title: `Yangi imtihon: ${exam.title}`,
      body: `${exam.specialty.name} yo'nalishida yangi imtihon ochildi — ${exam.questionCount} ta savol, ${exam.timeLimitMinutes} daqiqa.`,
      link: '/exams',
    });
  }

  countQuestions(examId: number): Promise<number> {
    return this.prisma.question.count({ where: { examId, isActive: true } });
  }

  private async ensureEnoughQuestions(
    examId: number,
    questionCount: number,
  ): Promise<void> {
    const available = await this.countQuestions(examId);

    if (available < questionCount) {
      throw new BadRequestException(
        `This exam has ${available} active questions but needs ${questionCount} — add questions or lower the count`,
      );
    }
  }
}
