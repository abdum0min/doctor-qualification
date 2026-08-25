import { Injectable, NotFoundException } from '@nestjs/common';

import { CursorPaginated } from 'src/common/interfaces/api-response.interface';
import { decodeCursor } from 'src/common/utils/cursor.util';
import { buildCursorPaginated } from 'src/common/utils/pagination.util';
import { Prisma } from 'src/generated/prisma/client';
import {
  AttemptStatus,
  CertificateStatus,
  QualificationLevel,
  UserRole,
} from 'src/generated/prisma/enums';
import { PrismaService } from 'src/modules/prisma/prisma.service';

import {
  AdminDoctorQueryDto,
  DoctorAccountStatus,
} from './dto/admin-doctor-query.dto';
import { UpdateDoctorStatusDto } from './dto/update-doctor-status.dto';

export interface AdminDoctorRow {
  id: number;
  userId: number;
  fullname: string;
  email: string;
  isActive: boolean;
  specialtyName: string | null;
  attemptsCount: number;
  certificatesCount: number;
  bestScore: number | null;
  createdAt: Date;
}

export interface AdminDoctorDetail extends AdminDoctorRow {
  phone: string | null;
  workplace: string | null;
  experienceYears: number | null;
  attempts: {
    id: number;
    examTitle: string;
    status: AttemptStatus;
    score: number | null;
    qualification: QualificationLevel | null;
    passed: boolean | null;
    startedAt: Date;
    completedAt: Date | null;
  }[];
  certificates: {
    certificateId: string;
    status: CertificateStatus;
    score: number;
    qualification: QualificationLevel;
    issuedAt: Date;
    expiresAt: Date;
  }[];
}

const listSelect = {
  id: true,
  userId: true,
  createdAt: true,
  user: { select: { fullname: true, email: true, isActive: true } },
  specialty: { select: { name: true } },
  _count: { select: { attempts: true, certificates: true } },
} satisfies Prisma.DoctorProfileSelect;

type ListRow = Prisma.DoctorProfileGetPayload<{ select: typeof listSelect }>;

@Injectable()
export class AdminDoctorsService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(
    query: AdminDoctorQueryDto,
  ): Promise<CursorPaginated<AdminDoctorRow>> {
    const cursor = decodeCursor(query.cursor);

    const rows = await this.prisma.doctorProfile.findMany({
      where: buildWhere(query),
      select: listSelect,
      take: query.limit + 1,
      ...(cursor ? { cursor: { id: cursor.id }, skip: 1 } : {}),
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });

    const bestScores = await this.bestScoresFor(rows.map((row) => row.id));

    return buildCursorPaginated(
      rows.map((row) => toRow(row, bestScores.get(row.id) ?? null)),
      query.limit,
      'createdAt',
    );
  }

  async findOne(id: number): Promise<AdminDoctorDetail> {
    const profile = await this.prisma.doctorProfile.findUnique({
      where: { id },
      select: {
        ...listSelect,
        phone: true,
        workplace: true,
        experienceYears: true,
        attempts: {
          select: {
            id: true,
            status: true,
            score: true,
            qualification: true,
            passed: true,
            startedAt: true,
            completedAt: true,
            exam: { select: { title: true } },
          },
          orderBy: [{ startedAt: 'desc' }],
        },
        certificates: {
          select: {
            certificateId: true,
            status: true,
            score: true,
            qualification: true,
            issuedAt: true,
            expiresAt: true,
          },
          orderBy: [{ issuedAt: 'desc' }],
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Doctor not found');
    }

    const bestScores = await this.bestScoresFor([profile.id]);

    return {
      ...toRow(profile, bestScores.get(profile.id) ?? null),
      phone: profile.phone,
      workplace: profile.workplace,
      experienceYears: profile.experienceYears,
      attempts: profile.attempts.map(({ exam, ...attempt }) => ({
        ...attempt,
        examTitle: exam.title,
      })),
      certificates: profile.certificates,
    };
  }

  /** Hisobni bloklash — yozuvlar saqlanadi, faqat kirish to'xtatiladi. */
  async updateStatus(
    id: number,
    dto: UpdateDoctorStatusDto,
  ): Promise<AdminDoctorRow> {
    const profile = await this.prisma.doctorProfile.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!profile) {
      throw new NotFoundException('Doctor not found');
    }

    await this.prisma.user.update({
      where: { id: profile.userId },
      data: { isActive: dto.isActive },
    });

    const updated = await this.prisma.doctorProfile.findUniqueOrThrow({
      where: { id },
      select: listSelect,
    });

    const bestScores = await this.bestScoresFor([id]);

    return toRow(updated, bestScores.get(id) ?? null);
  }

  private async bestScoresFor(
    doctorProfileIds: number[],
  ): Promise<Map<number, number | null>> {
    if (doctorProfileIds.length === 0) {
      return new Map();
    }

    const grouped = await this.prisma.examAttempt.groupBy({
      by: ['doctorProfileId'],
      where: { doctorProfileId: { in: doctorProfileIds } },
      _max: { score: true },
    });

    return new Map(grouped.map((row) => [row.doctorProfileId, row._max.score]));
  }
}

function buildWhere(
  query: AdminDoctorQueryDto,
): Prisma.DoctorProfileWhereInput {
  return {
    user: {
      role: UserRole.DOCTOR,
      ...(query.status
        ? { isActive: query.status === DoctorAccountStatus.Active }
        : {}),
      ...(query.search
        ? {
            OR: [
              { fullname: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    ...(query.specialtyId ? { specialtyId: query.specialtyId } : {}),
  };
}

function toRow(row: ListRow, bestScore: number | null): AdminDoctorRow {
  return {
    id: row.id,
    userId: row.userId,
    fullname: row.user.fullname,
    email: row.user.email,
    isActive: row.user.isActive,
    specialtyName: row.specialty?.name ?? null,
    attemptsCount: row._count.attempts,
    certificatesCount: row._count.certificates,
    bestScore,
    createdAt: row.createdAt,
  };
}
