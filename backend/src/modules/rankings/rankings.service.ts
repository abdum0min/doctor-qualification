import { Injectable, NotFoundException } from '@nestjs/common';

import { Paginated } from 'src/common/interfaces/api-response.interface';
import { buildPaginated } from 'src/common/utils/pagination.util';
import {
  calculateRankingScore,
  compareRanked,
  type RankingMetrics,
} from 'src/domain/ranking';
import { Prisma } from 'src/generated/prisma/client';
import { AttemptStatus, QualificationLevel } from 'src/generated/prisma/enums';
import { PrismaService } from 'src/modules/prisma/prisma.service';

import { RankingPeriod, RankingsQueryDto } from './dto/rankings-query.dto';

export interface RankingRow extends RankingMetrics {
  position: number;
  doctorId: number;
  fullname: string;
  specialtyName: string | null;
  workplace: string | null;
  qualification: QualificationLevel | null;
  certificatesCount: number;
  score: number;
  lastAttemptAt: Date | null;
}

export interface MyRanking {
  position: number | null;
  totalDoctors: number;
  row: RankingRow | null;
}

const COMPLETED = [AttemptStatus.SUBMITTED, AttemptStatus.EXPIRED];

/** Davr bo'yicha filtr — tanlangan oraliqda topshirilgan urinishlar. */
const PERIOD_MONTHS: Record<RankingPeriod, number | null> = {
  [RankingPeriod.AllTime]: null,
  [RankingPeriod.Month]: 1,
  [RankingPeriod.Quarter]: 3,
  [RankingPeriod.Year]: 12,
};

@Injectable()
export class RankingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: RankingsQueryDto): Promise<Paginated<RankingRow>> {
    const ranked = await this.buildRanking(query);
    const start = (query.page - 1) * query.limit;

    return buildPaginated(
      ranked.slice(start, start + query.limit),
      ranked.length,
      query,
    );
  }

  async findTop(query: RankingsQueryDto, limit: number): Promise<RankingRow[]> {
    const ranked = await this.buildRanking(query);

    return ranked.slice(0, limit);
  }

  async findOwn(userId: number, query: RankingsQueryDto): Promise<MyRanking> {
    const profile = await this.prisma.doctorProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Doctor profile not found');
    }

    const ranked = await this.buildRanking(query);
    const index = ranked.findIndex((row) => row.doctorId === profile.id);

    return {
      position: index === -1 ? null : index + 1,
      totalDoctors: ranked.length,
      row: index === -1 ? null : ranked[index],
    };
  }

  /**
   * Reyting yakunlangan urinishlardan har safar qayta hisoblanadi.
   * Shifokorlar soni o'n minglarga yetganda bu qiymatlarni materializatsiya
   * qilingan jadvalga ko'chirish kerak bo'ladi.
   */
  private async buildRanking(query: RankingsQueryDto): Promise<RankingRow[]> {
    const attempts = await this.prisma.examAttempt.findMany({
      where: buildWhere(query),
      select: {
        doctorProfileId: true,
        score: true,
        passed: true,
        qualification: true,
        completedAt: true,
      },
      orderBy: { completedAt: 'desc' },
    });

    if (attempts.length === 0) {
      return [];
    }

    const grouped = new Map<number, typeof attempts>();
    for (const attempt of attempts) {
      const bucket = grouped.get(attempt.doctorProfileId) ?? [];
      bucket.push(attempt);
      grouped.set(attempt.doctorProfileId, bucket);
    }

    const profiles = await this.prisma.doctorProfile.findMany({
      where: { id: { in: [...grouped.keys()] }, user: { isActive: true } },
      select: {
        id: true,
        workplace: true,
        user: { select: { fullname: true } },
        specialty: { select: { name: true } },
        _count: { select: { certificates: true } },
      },
    });

    const rows = profiles.map((profile) => {
      const own = grouped.get(profile.id) ?? [];
      const scores = own
        .map((attempt) => attempt.score)
        .filter((score): score is number => score !== null);

      const metrics: RankingMetrics = {
        attemptCount: own.length,
        passedCount: own.filter((attempt) => attempt.passed).length,
        averageScore: scores.length
          ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
          : 0,
        bestScore: scores.length ? Math.max(...scores) : 0,
      };

      return {
        ...metrics,
        position: 0,
        doctorId: profile.id,
        fullname: profile.user.fullname,
        specialtyName: profile.specialty?.name ?? null,
        workplace: profile.workplace,
        // Eng so'nggi urinish birinchi bo'lib keladi (`orderBy` yuqorida).
        qualification: own[0]?.qualification ?? null,
        certificatesCount: profile._count.certificates,
        score: calculateRankingScore(metrics),
        lastAttemptAt: own[0]?.completedAt ?? null,
      };
    });

    return rows
      .sort(compareRanked)
      .map((row, index) => ({ ...row, position: index + 1 }));
  }
}

function buildWhere(query: RankingsQueryDto): Prisma.ExamAttemptWhereInput {
  const months = PERIOD_MONTHS[query.period];
  const since = months === null ? null : monthsAgo(months);

  return {
    status: { in: COMPLETED },
    ...(since ? { completedAt: { gte: since } } : {}),
    ...(query.specialtyId
      ? { exam: { specialtyId: query.specialtyId } }
      : {}),
    ...(query.search
      ? {
          doctorProfile: {
            user: { fullname: { contains: query.search, mode: 'insensitive' } },
          },
        }
      : {}),
  };
}

function monthsAgo(months: number): Date {
  const date = new Date();
  date.setMonth(date.getMonth() - months);

  return date;
}
