import { Injectable } from '@nestjs/common';

import {
  AttemptStatus,
  CertificateStatus,
  UserRole,
} from 'src/generated/prisma/enums';
import { PrismaService } from 'src/modules/prisma/prisma.service';

export interface PlatformOverview {
  totalDoctors: number;
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
    ]);

    const completedAttempts = completedAggregate._count._all;

    return {
      totalDoctors,
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
