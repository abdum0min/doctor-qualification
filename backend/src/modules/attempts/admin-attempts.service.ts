import { Injectable, NotFoundException } from '@nestjs/common';

import { CursorPaginated } from 'src/common/interfaces/api-response.interface';
import { decodeCursor } from 'src/common/utils/cursor.util';
import { buildCursorPaginated } from 'src/common/utils/pagination.util';
import { Prisma } from 'src/generated/prisma/client';
import { AttemptStatus, QualificationLevel } from 'src/generated/prisma/enums';
import { PrismaService } from 'src/modules/prisma/prisma.service';

import { AdminAttemptQueryDto } from './dto/admin-attempt-query.dto';

export interface AdminAttemptRow {
  id: number;
  doctorId: number;
  doctorFullname: string;
  examTitle: string;
  specialtyName: string;
  status: AttemptStatus;
  questionCount: number;
  correctCount: number | null;
  score: number | null;
  qualification: QualificationLevel | null;
  passed: boolean | null;
  startedAt: Date;
  completedAt: Date | null;
  certificateId: string | null;
}

export interface AdminAttemptDetail extends AdminAttemptRow {
  passingScore: number;
  timeLimitMinutes: number;
  questions: {
    id: number;
    position: number;
    questionText: string;
    isCorrect: boolean | null;
    selectedOptionId: number | null;
    options: { id: number; text: string; isCorrect: boolean }[];
  }[];
}

const rowSelect = {
  id: true,
  status: true,
  questionCount: true,
  correctCount: true,
  score: true,
  qualification: true,
  passed: true,
  startedAt: true,
  completedAt: true,
  doctorProfile: {
    select: { id: true, user: { select: { fullname: true } } },
  },
  exam: {
    select: { title: true, specialty: { select: { name: true } } },
  },
  certificate: { select: { certificateId: true } },
} satisfies Prisma.ExamAttemptSelect;

type Row = Prisma.ExamAttemptGetPayload<{ select: typeof rowSelect }>;

@Injectable()
export class AdminAttemptsService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(
    query: AdminAttemptQueryDto,
  ): Promise<CursorPaginated<AdminAttemptRow>> {
    const cursor = decodeCursor(query.cursor);

    const rows = await this.prisma.examAttempt.findMany({
      where: buildWhere(query),
      select: rowSelect,
      take: query.limit + 1,
      ...(cursor ? { cursor: { id: cursor.id }, skip: 1 } : {}),
      orderBy: [{ startedAt: 'desc' }, { id: 'desc' }],
    });

    return buildCursorPaginated(rows.map(toRow), query.limit, 'startedAt');
  }

  async findOne(id: number): Promise<AdminAttemptDetail> {
    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id },
      select: {
        ...rowSelect,
        passingScore: true,
        timeLimitMinutes: true,
        questions: {
          select: {
            id: true,
            position: true,
            questionText: true,
            isCorrect: true,
            selectedOptionId: true,
            options: {
              select: { id: true, text: true, isCorrect: true },
              orderBy: { position: 'asc' },
            },
          },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    return {
      ...toRow(attempt),
      passingScore: attempt.passingScore,
      timeLimitMinutes: attempt.timeLimitMinutes,
      questions: attempt.questions,
    };
  }
}

function buildWhere(query: AdminAttemptQueryDto): Prisma.ExamAttemptWhereInput {
  return {
    ...(query.status ? { status: query.status } : {}),
    ...(query.examId ? { examId: query.examId } : {}),
    ...(query.doctorId ? { doctorProfileId: query.doctorId } : {}),
    ...(query.specialtyId ? { exam: { specialtyId: query.specialtyId } } : {}),
    ...(query.search
      ? {
          doctorProfile: {
            user: {
              OR: [
                { fullname: { contains: query.search, mode: 'insensitive' } },
                { email: { contains: query.search, mode: 'insensitive' } },
              ],
            },
          },
        }
      : {}),
  };
}

function toRow(row: Row): AdminAttemptRow {
  return {
    id: row.id,
    doctorId: row.doctorProfile.id,
    doctorFullname: row.doctorProfile.user.fullname,
    examTitle: row.exam.title,
    specialtyName: row.exam.specialty.name,
    status: row.status,
    questionCount: row.questionCount,
    correctCount: row.correctCount,
    score: row.score,
    qualification: row.qualification,
    passed: row.passed,
    startedAt: row.startedAt,
    completedAt: row.completedAt,
    certificateId: row.certificate?.certificateId ?? null,
  };
}
