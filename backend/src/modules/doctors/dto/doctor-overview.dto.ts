import { ApiProperty } from '@nestjs/swagger';

import {
  CertificateStatus,
  QualificationLevel,
} from 'src/generated/prisma/enums';

import { DoctorProfileDto } from './doctor-profile.dto';

class DoctorLatestAttemptDto {
  @ApiProperty({ example: 12 })
  id: number;

  @ApiProperty({ example: 'Kardiologiya — asosiy malaka imtihoni' })
  examTitle: string;

  @ApiProperty({ example: 'Kardiolog' })
  specialtyName: string;

  @ApiProperty({ example: 91 })
  score: number;

  @ApiProperty({ enum: QualificationLevel })
  qualification: QualificationLevel;

  @ApiProperty({ example: true })
  passed: boolean;

  @ApiProperty({ example: '2026-08-25T10:22:00.000Z', nullable: true })
  completedAt: Date | null;
}

class DoctorCertificateSummaryDto {
  @ApiProperty({ example: 'DOC-2026-000123' })
  certificateId: string;

  @ApiProperty({ enum: CertificateStatus })
  status: CertificateStatus;

  @ApiProperty({ example: '2026-08-25T10:22:00.000Z' })
  issuedAt: Date;

  @ApiProperty({ example: '2027-08-25T10:22:00.000Z' })
  expiresAt: Date;
}

class DoctorStatsDto {
  @ApiProperty({ example: 4 })
  totalAttempts: number;

  @ApiProperty({ example: 3 })
  completedAttempts: number;

  @ApiProperty({ example: 2 })
  passedAttempts: number;

  @ApiProperty({ example: 91, nullable: true })
  bestScore: number | null;

  @ApiProperty({ example: 78, nullable: true })
  averageScore: number | null;

  @ApiProperty({ enum: QualificationLevel, nullable: true })
  currentQualification: QualificationLevel | null;

  @ApiProperty({ type: DoctorLatestAttemptDto, nullable: true })
  latestAttempt: DoctorLatestAttemptDto | null;

  @ApiProperty({ example: 2 })
  certificatesCount: number;

  @ApiProperty({ type: DoctorCertificateSummaryDto, nullable: true })
  latestCertificate: DoctorCertificateSummaryDto | null;
}

export class DoctorOverviewDto {
  @ApiProperty({ type: DoctorProfileDto })
  profile: DoctorProfileDto;

  @ApiProperty({ type: DoctorStatsDto })
  stats: DoctorStatsDto;
}
