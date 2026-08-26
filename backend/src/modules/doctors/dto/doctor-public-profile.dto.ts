import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  CertificateStatus,
  QualificationLevel,
} from 'src/generated/prisma/enums';

class PublicSpecialtyDto {
  @ApiProperty({ example: 3 })
  id: number;

  @ApiProperty({ example: 'Kardiolog' })
  name: string;
}

class PublicCertificateDto {
  @ApiProperty({ example: 'DOC-2026-000123' })
  certificateId: string;

  @ApiProperty({ example: 'Kardiologiya — asosiy malaka imtihoni' })
  examTitle: string;

  @ApiProperty({ enum: QualificationLevel })
  qualification: QualificationLevel;

  @ApiProperty({ example: 92 })
  score: number;

  @ApiProperty({ enum: CertificateStatus })
  status: CertificateStatus;

  @ApiProperty({ example: '2026-01-01T10:00:00.000Z' })
  issuedAt: Date;

  @ApiProperty({ example: '2027-01-01T10:00:00.000Z' })
  expiresAt: Date;
}

class PublicRankingDto {
  @ApiPropertyOptional({ nullable: true, example: 7 })
  position: number | null;

  @ApiProperty({ example: 128 })
  totalDoctors: number;

  @ApiPropertyOptional({ nullable: true, example: 86.4 })
  score: number | null;
}

/**
 * Ommaviy profil — reyting va qidiruvdan ochiladi. Aloqa ma'lumotlari
 * (email, telefon) bu yerga hech qachon kirmaydi.
 */
export class DoctorPublicProfileDto {
  @ApiProperty({ example: 12, description: 'Shifokor profili identifikatori' })
  id: number;

  @ApiProperty({ example: 'Karimova Nilufar Baxtiyorovna' })
  fullname: string;

  @ApiPropertyOptional({ nullable: true, example: '/uploads/avatars/3f2b.jpg' })
  avatarUrl: string | null;

  @ApiProperty({ type: PublicSpecialtyDto, nullable: true })
  specialty: PublicSpecialtyDto | null;

  @ApiPropertyOptional({ nullable: true, example: '1-sonli shifoxona' })
  workplace: string | null;

  @ApiPropertyOptional({ nullable: true, example: 8 })
  experienceYears: number | null;

  @ApiProperty({ example: '2026-01-01T10:00:00.000Z' })
  joinedAt: Date;

  @ApiProperty({ example: 14 })
  completedAttempts: number;

  @ApiProperty({ example: 11 })
  passedAttempts: number;

  @ApiPropertyOptional({ nullable: true, example: 88 })
  averageScore: number | null;

  @ApiPropertyOptional({ nullable: true, example: 96 })
  bestScore: number | null;

  @ApiPropertyOptional({
    enum: QualificationLevel,
    nullable: true,
    description: 'Oxirgi yakunlangan urinishdan olinadi',
  })
  currentQualification: QualificationLevel | null;

  @ApiProperty({ type: PublicRankingDto })
  ranking: PublicRankingDto;

  @ApiProperty({
    type: [PublicCertificateDto],
    description: 'Faqat bekor qilinmagan sertifikatlar',
  })
  certificates: PublicCertificateDto[];
}
