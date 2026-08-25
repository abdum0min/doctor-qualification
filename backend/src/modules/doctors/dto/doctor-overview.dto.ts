import { ApiProperty } from '@nestjs/swagger';

import { QualificationLevel } from 'src/generated/prisma/enums';

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
}

export class DoctorOverviewDto {
  @ApiProperty({ type: DoctorProfileDto })
  profile: DoctorProfileDto;

  @ApiProperty({ type: DoctorStatsDto })
  stats: DoctorStatsDto;
}
