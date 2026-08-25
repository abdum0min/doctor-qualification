import { ApiProperty } from '@nestjs/swagger';

import {
  AttemptStatus,
  CertificateStatus,
  QualificationLevel,
} from 'src/generated/prisma/enums';

export class AdminDoctorDto {
  @ApiProperty({ example: 4 })
  id: number;

  @ApiProperty({ example: 12 })
  userId: number;

  @ApiProperty({ example: 'Abdullayev Anvar Anvarovich' })
  fullname: string;

  @ApiProperty({ example: 'anvar@mail.com' })
  email: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: 'Kardiolog', nullable: true })
  specialtyName: string | null;

  @ApiProperty({ example: 3 })
  attemptsCount: number;

  @ApiProperty({ example: 1 })
  certificatesCount: number;

  @ApiProperty({ example: 91, nullable: true })
  bestScore: number | null;

  @ApiProperty({ example: '2026-01-01T10:00:00.000Z' })
  createdAt: Date;
}

class AdminDoctorAttemptDto {
  @ApiProperty({ example: 12 })
  id: number;

  @ApiProperty({ example: 'Kardiologiya — asosiy malaka imtihoni' })
  examTitle: string;

  @ApiProperty({ enum: AttemptStatus })
  status: AttemptStatus;

  @ApiProperty({ example: 91, nullable: true })
  score: number | null;

  @ApiProperty({ enum: QualificationLevel, nullable: true })
  qualification: QualificationLevel | null;

  @ApiProperty({ example: true, nullable: true })
  passed: boolean | null;

  @ApiProperty({ example: '2026-08-25T10:00:00.000Z' })
  startedAt: Date;

  @ApiProperty({ example: '2026-08-25T10:22:00.000Z', nullable: true })
  completedAt: Date | null;
}

class AdminDoctorCertificateDto {
  @ApiProperty({ example: 'DOC-2026-000123' })
  certificateId: string;

  @ApiProperty({ enum: CertificateStatus })
  status: CertificateStatus;

  @ApiProperty({ example: 91 })
  score: number;

  @ApiProperty({ enum: QualificationLevel })
  qualification: QualificationLevel;

  @ApiProperty({ example: '2026-08-25T10:22:00.000Z' })
  issuedAt: Date;

  @ApiProperty({ example: '2027-08-25T10:22:00.000Z' })
  expiresAt: Date;
}

export class AdminDoctorDetailDto extends AdminDoctorDto {
  @ApiProperty({ example: '+998901234567', nullable: true })
  phone: string | null;

  @ApiProperty({ example: '1-sonli shahar shifoxonasi', nullable: true })
  workplace: string | null;

  @ApiProperty({ example: 8, nullable: true })
  experienceYears: number | null;

  @ApiProperty({ type: [AdminDoctorAttemptDto] })
  attempts: AdminDoctorAttemptDto[];

  @ApiProperty({ type: [AdminDoctorCertificateDto] })
  certificates: AdminDoctorCertificateDto[];
}
