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
}

export interface DoctorOverviewView {
  profile: DoctorProfileView;
  stats: DoctorStatsView;
}

const profileSelect = {
  id: true,
  userId: true,
  phone: true,
  workplace: true,
  experienceYears: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { fullname: true, email: true } },
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
  user: { fullname: string; email: string };
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
        user: { select: { fullname: true } },
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
      latest,
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
      this.prisma.examAttempt.findFirst({
        where: completedWhere,
        orderBy: [{ completedAt: 'desc' }, { id: 'desc' }],
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

    return {
      totalAttempts,
      completedAttempts: completedAggregate._count._all,
      passedAttempts,
      bestScore: completedAggregate._max.score,
      averageScore:
        completedAggregate._avg.score === null
          ? null
          : Math.round(completedAggregate._avg.score),
      currentQualification: latest?.qualification ?? null,
      latestAttempt: latest
        ? {
            id: latest.id,
            examTitle: latest.exam.title,
            specialtyName: latest.exam.specialty.name,
            score: latest.score ?? 0,
            qualification: latest.qualification ?? QualificationLevel.BEGINNER,
            passed: latest.passed ?? false,
            completedAt: latest.completedAt,
          }
        : null,
      certificatesCount,
      latestCertificate,
    };
  }
}

function specialtyRelation(specialtyId: number | null) {
  return specialtyId === null
    ? { disconnect: true }
    : { connect: { id: specialtyId } };
}

function toView({ user, ...rest }: ProfileRow): DoctorProfileView {
  return { ...rest, fullname: user.fullname, email: user.email };
}
