import { Injectable } from '@nestjs/common';

import {
  AttemptStatus,
  CertificateStatus,
  UserRole,
} from 'src/generated/prisma/enums';
import { PrismaService } from 'src/modules/prisma/prisma.service';

export interface PlatformOverview {
  totalDoctors: number;
  specialtiesCount: number;
  examsCount: number;
  questionsCount: number;
  attemptsToday: number;
  activeDoctors: number;
  doctorsWithAttempts: number;
  totalAttempts: number;
  completedAttempts: number;
  passedAttempts: number;
  failedAttempts: number;
  certificatesIssued: number;
  activeCertificates: number;
  revokedCertificates: number;
  averageScore: number | null;
  highestScore: number | null;
}

export interface SpecialtyStatistics {
  specialtyId: number;
  name: string;
  doctorsCount: number;
  questionsCount: number;
  examsCount: number;
  attemptsCount: number;
  passedCount: number;
  averageScore: number | null;
}

/** Grafiklar uchun bitta nuqta: davr yorlig'i va qiymati. */
export interface TimePoint {
  period: string;
  value: number;
}

export interface PlatformTrends {
  /** So'nggi 30 kun: kuniga nechta urinish yakunlangan. */
  attemptsPerDay: TimePoint[];
  /** So'nggi 12 oy: oylik o'rtacha natija. */
  averageScoreTrend: TimePoint[];
  /** So'nggi 12 oy: oyiga nechta shifokor ro'yxatdan o'tgan. */
  doctorGrowth: TimePoint[];
}

export interface PublicStatistics {
  totalDoctors: number;
  completedAttempts: number;
  certificatesIssued: number;
  averageScore: number | null;
  topSpecialties: { name: string; doctorsCount: number }[];
}

/** Yakunlangan urinishlar — baholangan, ya'ni statistikaga kiradi. */
const COMPLETED_STATUSES = [AttemptStatus.SUBMITTED, AttemptStatus.EXPIRED];
const COMPLETED = { status: { in: COMPLETED_STATUSES } };

const TOP_SPECIALTY_LIMIT = 5;

const TREND_DAYS = 30;
const TREND_MONTHS = 12;

@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(): Promise<PlatformOverview> {
    const [
      totalDoctors,
      activeDoctors,
      doctorsWithAttempts,
      totalAttempts,
      completedAggregate,
      passedAttempts,
      certificatesIssued,
      revokedCertificates,
      specialtiesCount,
      examsCount,
      questionsCount,
      attemptsToday,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: UserRole.DOCTOR } }),
      this.prisma.user.count({
        where: { role: UserRole.DOCTOR, isActive: true },
      }),
      this.prisma.doctorProfile.count({ where: { attempts: { some: {} } } }),
      this.prisma.examAttempt.count(),
      this.prisma.examAttempt.aggregate({
        where: COMPLETED,
        _count: { _all: true },
        _avg: { score: true },
        _max: { score: true },
      }),
      this.prisma.examAttempt.count({ where: { passed: true } }),
      this.prisma.certificate.count(),
      this.prisma.certificate.count({
        where: { status: CertificateStatus.REVOKED },
      }),
      this.prisma.specialty.count(),
      this.prisma.exam.count(),
      this.prisma.question.count(),
      this.prisma.examAttempt.count({
        where: { ...COMPLETED, completedAt: { gte: startOfToday() } },
      }),
    ]);

    const completedAttempts = completedAggregate._count._all;

    return {
      totalDoctors,
      specialtiesCount,
      examsCount,
      questionsCount,
      attemptsToday,
      activeDoctors,
      doctorsWithAttempts,
      totalAttempts,
      completedAttempts,
      passedAttempts,
      failedAttempts: completedAttempts - passedAttempts,
      certificatesIssued,
      activeCertificates: certificatesIssued - revokedCertificates,
      revokedCertificates,
      averageScore: roundOrNull(completedAggregate._avg.score),
      highestScore: completedAggregate._max.score,
    };
  }

  /**
   * Har bir mutaxassislik uchun bitta so'rov o'rniga bir nechta guruhlangan
   * so'rov — mutaxassisliklar soni ortganda ham N+1 bo'lmaydi.
   */
  async bySpecialty(): Promise<SpecialtyStatistics[]> {
    const [specialties, exams, attempts] = await Promise.all([
      this.prisma.specialty.findMany({
        select: {
          id: true,
          name: true,
          _count: { select: { doctorProfiles: true } },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.exam.findMany({
        where: { isActive: true },
        select: {
          specialtyId: true,
          _count: { select: { questions: true } },
        },
      }),
      this.prisma.examAttempt.findMany({
        where: COMPLETED,
        select: {
          score: true,
          passed: true,
          exam: { select: { specialtyId: true } },
        },
      }),
    ]);

    return specialties.map((specialty) => {
      const own = attempts.filter(
        (attempt) => attempt.exam.specialtyId === specialty.id,
      );
      const scores = own
        .map((attempt) => attempt.score)
        .filter((score): score is number => score !== null);

      return {
        specialtyId: specialty.id,
        name: specialty.name,
        doctorsCount: specialty._count.doctorProfiles,
        questionsCount: examsOf(exams, specialty.id).reduce(
          (total, exam) => total + exam._count.questions,
          0,
        ),
        examsCount: examsOf(exams, specialty.id).length,
        attemptsCount: own.length,
        passedCount: own.filter((attempt) => attempt.passed).length,
        averageScore: scores.length
          ? Math.round(
              scores.reduce((sum, score) => sum + score, 0) / scores.length,
            )
          : null,
      };
    });
  }

  async publicSummary(): Promise<PublicStatistics> {
    const completedAggregate = await this.prisma.examAttempt.aggregate({
      where: COMPLETED,
      _count: { _all: true },
      _avg: { score: true },
    });

    const [totalDoctors, certificatesIssued, specialties] = await Promise.all([
      this.prisma.user.count({
        where: { role: UserRole.DOCTOR, isActive: true },
      }),
      this.prisma.certificate.count({
        where: { status: CertificateStatus.ACTIVE },
      }),
      this.prisma.specialty.findMany({
        where: { isActive: true },
        select: {
          name: true,
          _count: { select: { doctorProfiles: true } },
        },
      }),
    ]);

    return {
      totalDoctors,
      completedAttempts: completedAggregate._count._all,
      certificatesIssued,
      averageScore: roundOrNull(completedAggregate._avg.score),
      topSpecialties: specialties
        .map((specialty) => ({
          name: specialty.name,
          doctorsCount: specialty._count.doctorProfiles,
        }))
        .sort((a, b) => b.doctorsCount - a.doctorsCount)
        .slice(0, TOP_SPECIALTY_LIMIT),
    };
  }
  /**
   * Grafiklar uchun vaqt qatorlari. Bo'sh kunlar/oylar ham nol qiymat bilan
   * qaytariladi — aks holda grafikda uzilishlar paydo bo'ladi.
   */
  async trends(): Promise<PlatformTrends> {
    const since30Days = daysAgo(TREND_DAYS - 1);
    const since12Months = monthsAgo(TREND_MONTHS - 1);

    const [dailyAttempts, monthlyAttempts, registrations] = await Promise.all([
      this.prisma.examAttempt.findMany({
        where: { ...COMPLETED, completedAt: { gte: since30Days } },
        select: { completedAt: true },
      }),
      this.prisma.examAttempt.findMany({
        where: {
          ...COMPLETED,
          completedAt: { gte: since12Months },
          score: { not: null },
        },
        select: { completedAt: true, score: true },
      }),
      this.prisma.user.findMany({
        where: { role: UserRole.DOCTOR, createdAt: { gte: since12Months } },
        select: { createdAt: true },
      }),
    ]);

    return {
      attemptsPerDay: countByPeriod(
        dailyAttempts.map((attempt) => attempt.completedAt),
        lastDays(TREND_DAYS),
        toDayKey,
      ),
      averageScoreTrend: averageByPeriod(
        monthlyAttempts,
        lastMonths(TREND_MONTHS),
      ),
      doctorGrowth: countByPeriod(
        registrations.map((user) => user.createdAt),
        lastMonths(TREND_MONTHS),
        toMonthKey,
      ),
    };
  }
}

function examsOf<T extends { specialtyId: number }>(
  exams: T[],
  specialtyId: number,
): T[] {
  return exams.filter((exam) => exam.specialtyId === specialtyId);
}

function roundOrNull(value: number | null): number | null {
  return value === null ? null : Math.round(value);
}

function startOfToday(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);

  return date;
}

function daysAgo(days: number): Date {
  const date = startOfToday();
  date.setDate(date.getDate() - days);

  return date;
}

function monthsAgo(months: number): Date {
  const date = startOfToday();
  date.setDate(1);
  date.setMonth(date.getMonth() - months);

  return date;
}

/**
 * Kalitlar mahalliy vaqt bo'yicha quriladi. `toISOString()` UTC ga o'tkazadi,
 * shuning uchun UTC+5 da bugungi kun kechagi kalitga tushib qolardi.
 */
function toDayKey(date: Date): string {
  return `${toMonthKey(date)}-${pad(date.getDate())}`;
}

function toMonthKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/** Oxirgi `count` kun kalitlari, eng eskisidan boshlab. */
function lastDays(count: number): string[] {
  return Array.from({ length: count }, (_, index) =>
    toDayKey(daysAgo(count - 1 - index)),
  );
}

function lastMonths(count: number): string[] {
  return Array.from({ length: count }, (_, index) =>
    toMonthKey(monthsAgo(count - 1 - index)),
  );
}

function countByPeriod(
  dates: (Date | null)[],
  periods: string[],
  toKey: (date: Date) => string,
): TimePoint[] {
  const counts = new Map(periods.map((period) => [period, 0]));

  for (const date of dates) {
    if (!date) continue;

    const key = toKey(date);
    const current = counts.get(key);

    if (current !== undefined) {
      counts.set(key, current + 1);
    }
  }

  return periods.map((period) => ({ period, value: counts.get(period) ?? 0 }));
}

function averageByPeriod(
  attempts: { completedAt: Date | null; score: number | null }[],
  periods: string[],
): TimePoint[] {
  const totals = new Map(
    periods.map((period) => [period, { sum: 0, count: 0 }]),
  );

  for (const attempt of attempts) {
    if (!attempt.completedAt || attempt.score === null) continue;

    const bucket = totals.get(toMonthKey(attempt.completedAt));

    if (bucket) {
      bucket.sum += attempt.score;
      bucket.count += 1;
    }
  }

  return periods.map((period) => {
    const bucket = totals.get(period);

    return {
      period,
      value:
        bucket && bucket.count > 0 ? Math.round(bucket.sum / bucket.count) : 0,
    };
  });
}
