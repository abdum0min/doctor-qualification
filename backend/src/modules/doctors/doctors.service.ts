import { Injectable, NotFoundException } from '@nestjs/common';

import {
  AttemptStatus,
  CertificateStatus,
  QualificationLevel,
} from 'src/generated/prisma/enums';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { RankingPeriod } from 'src/modules/rankings/dto/rankings-query.dto';
import { RankingsService } from 'src/modules/rankings/rankings.service';
import { SpecialtiesService } from 'src/modules/specialties/specialties.service';

import { DoctorPublicProfileDto } from './dto/doctor-public-profile.dto';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';

export interface DoctorSpecialtyView {
  id: number;
  name: string;
}

export interface DoctorProfileView {
  id: number;
  userId: number;
  fullname: string;
  email: string;
  avatarUrl: string | null;
  specialty: DoctorSpecialtyView | null;
  phone: string | null;
  workplace: string | null;
  experienceYears: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DoctorLatestAttemptView {
  id: number;
  examTitle: string;
  specialtyName: string;
  score: number;
  qualification: QualificationLevel;
  passed: boolean;
  completedAt: Date | null;
}

export interface DoctorCertificateView {
  certificateId: string;
  status: CertificateStatus;
  issuedAt: Date;
  expiresAt: Date;
}

/** Boshqaruv panelidagi natija dinamikasi uchun bitta nuqta. */
export interface DoctorScorePoint {
  date: Date;
  score: number;
}

export interface DoctorStatsView {
  totalAttempts: number;
  completedAttempts: number;
  passedAttempts: number;
  bestScore: number | null;
  averageScore: number | null;
  /** Oxirgi yakunlangan urinishdan olinadi. */
  currentQualification: QualificationLevel | null;
  latestAttempt: DoctorLatestAttemptView | null;
  certificatesCount: number;
  latestCertificate: DoctorCertificateView | null;
  /** So'nggi urinishlar — eng yangisi birinchi. */
  recentAttempts: DoctorLatestAttemptView[];
  /** Grafik uchun: eskisidan yangisiga qarab tartiblangan natijalar. */
  scoreTrend: DoctorScorePoint[];
  /**
   * So'nggi uchta natijaning umumiy o'rtachadan farqi — shifokor o'sayaptimi
   * yoki pasayayaptimi, bir qarashda ko'rinishi uchun.
   */
  recentChange: number | null;
}

export interface DoctorOverviewView {
  profile: DoctorProfileView;
  stats: DoctorStatsView;
}

/** Grafik uchun olinadigan urinishlar soni. */
const TREND_ATTEMPTS = 12;
const RECENT_ATTEMPTS = 5;
const RECENT_CHANGE_ATTEMPTS = 3;

const profileSelect = {
  id: true,
  userId: true,
  phone: true,
  workplace: true,
  experienceYears: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { fullname: true, email: true, avatarUrl: true } },
  specialty: { select: { id: true, name: true } },
} as const;

interface ProfileRow {
  id: number;
  userId: number;
  phone: string | null;
  workplace: string | null;
  experienceYears: number | null;
  createdAt: Date;
  updatedAt: Date;
  user: { fullname: string; email: string; avatarUrl: string | null };
  specialty: DoctorSpecialtyView | null;
}

@Injectable()
export class DoctorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly specialtiesService: SpecialtiesService,
    private readonly rankings: RankingsService,
  ) {}

  /**
   * Reyting va qidiruvdan ochiladigan ommaviy profil. Email va telefon
   * qaytarilmaydi — bu ma'lumotlar faqat egasiga va administratorga ko'rinadi.
   */
  async findPublicProfile(
    doctorProfileId: number,
  ): Promise<DoctorPublicProfileDto> {
    const profile = await this.prisma.doctorProfile.findFirst({
      where: { id: doctorProfileId, user: { isActive: true } },
      select: {
        id: true,
        workplace: true,
        experienceYears: true,
        createdAt: true,
        user: { select: { fullname: true, avatarUrl: true } },
        specialty: { select: { id: true, name: true } },
      },
    });

    if (!profile) {
      throw new NotFoundException('Doctor not found');
    }

    const [attempts, certificates, ranking] = await Promise.all([
      this.prisma.examAttempt.findMany({
        where: {
          doctorProfileId,
          status: AttemptStatus.SUBMITTED,
          score: { not: null },
        },
        select: { score: true, passed: true, qualification: true },
        orderBy: { completedAt: 'desc' },
      }),

      this.prisma.certificate.findMany({
        where: { doctorProfileId, status: CertificateStatus.ACTIVE },
        select: {
          certificateId: true,
          examTitle: true,
          qualification: true,
          score: true,
          status: true,
          issuedAt: true,
          expiresAt: true,
        },
        orderBy: { issuedAt: 'desc' },
      }),

      this.rankings.findByDoctorId(doctorProfileId, {
        page: 1,
        limit: 1,
        period: RankingPeriod.AllTime,
      }),
    ]);

    const scores = attempts
      .map((attempt) => attempt.score)
      .filter((score): score is number => score !== null);

    return {
      id: profile.id,
      fullname: profile.user.fullname,
      avatarUrl: profile.user.avatarUrl,
      specialty: profile.specialty,
      workplace: profile.workplace,
      experienceYears: profile.experienceYears,
      joinedAt: profile.createdAt,
      completedAttempts: attempts.length,
      passedAttempts: attempts.filter((attempt) => attempt.passed).length,
      averageScore: scores.length
        ? Math.round(
            scores.reduce((sum, score) => sum + score, 0) / scores.length,
          )
        : null,
      bestScore: scores.length ? Math.max(...scores) : null,
      currentQualification: attempts[0]?.qualification ?? null,
      ranking: {
        position: ranking.position,
        totalDoctors: ranking.totalDoctors,
        score: ranking.row?.score ?? null,
      },
      certificates,
    };
  }

  async findOwnProfile(userId: number): Promise<DoctorProfileView> {
    const profile = await this.prisma.doctorProfile.findUnique({
      where: { userId },
      select: profileSelect,
    });

    if (!profile) {
      throw new NotFoundException('Doctor profile not found');
    }

    return toView(profile);
  }

  async findOwnOverview(userId: number): Promise<DoctorOverviewView> {
    const profile = await this.findOwnProfile(userId);

    return { profile, stats: await this.buildStats(profile.id) };
  }

  async updateOwnProfile(
    userId: number,
    dto: UpdateDoctorProfileDto,
  ): Promise<DoctorProfileView> {
    const { fullname, specialtyId, ...profileFields } = dto;

    if (specialtyId) {
      await this.specialtiesService.ensureActive(specialtyId);
    }

    const profile = await this.prisma.doctorProfile.update({
      where: { userId },
      data: {
        ...profileFields,
        ...(fullname ? { user: { update: { fullname } } } : {}),
        ...(specialtyId === undefined
          ? {}
          : { specialty: specialtyRelation(specialtyId) }),
      },
      select: profileSelect,
    });

    return toView(profile);
  }

  private async buildStats(doctorProfileId: number): Promise<DoctorStatsView> {
    const completedWhere = {
      doctorProfileId,
      status: { in: [AttemptStatus.SUBMITTED, AttemptStatus.EXPIRED] },
    };

    const [
      totalAttempts,
      completedAggregate,
      passedAttempts,
      recent,
      certificatesCount,
      latestCertificate,
    ] = await Promise.all([
      this.prisma.examAttempt.count({ where: { doctorProfileId } }),
      this.prisma.examAttempt.aggregate({
        where: completedWhere,
        _count: { _all: true },
        _max: { score: true },
        _avg: { score: true },
      }),
      this.prisma.examAttempt.count({
        where: { doctorProfileId, passed: true },
      }),
      this.prisma.examAttempt.findMany({
        where: completedWhere,
        orderBy: [{ completedAt: 'desc' }, { id: 'desc' }],
        take: TREND_ATTEMPTS,
        select: {
          id: true,
          score: true,
          qualification: true,
          passed: true,
          completedAt: true,
          exam: {
            select: { title: true, specialty: { select: { name: true } } },
          },
        },
      }),
      this.prisma.certificate.count({ where: { doctorProfileId } }),
      this.prisma.certificate.findFirst({
        where: { doctorProfileId },
        orderBy: [{ issuedAt: 'desc' }, { id: 'desc' }],
        select: {
          certificateId: true,
          status: true,
          issuedAt: true,
          expiresAt: true,
        },
      }),
    ]);

    const attempts = recent.map(toAttemptView);
    const [latest] = recent;
    const averageScore =
      completedAggregate._avg.score === null
        ? null
        : Math.round(completedAggregate._avg.score);

    return {
      totalAttempts,
      completedAttempts: completedAggregate._count._all,
      passedAttempts,
      bestScore: completedAggregate._max.score,
      averageScore,
      currentQualification: latest?.qualification ?? null,
      latestAttempt: attempts[0] ?? null,
      certificatesCount,
      latestCertificate,
      recentAttempts: attempts.slice(0, RECENT_ATTEMPTS),
      scoreTrend: recent
        .filter(
          (
            attempt,
          ): attempt is typeof attempt & { completedAt: Date; score: number } =>
            attempt.completedAt !== null && attempt.score !== null,
        )
        .map((attempt) => ({ date: attempt.completedAt, score: attempt.score }))
        .reverse(),
      recentChange: recentChange(attempts, averageScore),
    };
  }
}

function toAttemptView(attempt: {
  id: number;
  score: number | null;
  qualification: QualificationLevel | null;
  passed: boolean | null;
  completedAt: Date | null;
  exam: { title: string; specialty: { name: string } };
}): DoctorLatestAttemptView {
  return {
    id: attempt.id,
    examTitle: attempt.exam.title,
    specialtyName: attempt.exam.specialty.name,
    score: attempt.score ?? 0,
    qualification: attempt.qualification ?? QualificationLevel.BEGINNER,
    passed: attempt.passed ?? false,
    completedAt: attempt.completedAt,
  };
}

function recentChange(
  attempts: DoctorLatestAttemptView[],
  averageScore: number | null,
): number | null {
  if (averageScore === null || attempts.length < RECENT_CHANGE_ATTEMPTS) {
    return null;
  }

  const window = attempts.slice(0, RECENT_CHANGE_ATTEMPTS);
  const recentAverage =
    window.reduce((sum, attempt) => sum + attempt.score, 0) / window.length;

  return Math.round(recentAverage - averageScore);
}

function specialtyRelation(specialtyId: number | null) {
  return specialtyId === null
    ? { disconnect: true }
    : { connect: { id: specialtyId } };
}

function toView({ user, ...rest }: ProfileRow): DoctorProfileView {
  return {
    ...rest,
    fullname: user.fullname,
    email: user.email,
    avatarUrl: user.avatarUrl,
  };
}
