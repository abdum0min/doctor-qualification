import { ApiProperty } from '@nestjs/swagger';

import {
  CertificateStatus,
  QualificationLevel,
} from 'src/generated/prisma/enums';

export class CertificateDto {
  @ApiProperty({ example: 7 })
  id: number;

  @ApiProperty({ example: 'DOC-2026-000123' })
  certificateId: string;

  @ApiProperty({ example: 12 })
  attemptId: number;

  @ApiProperty({ example: 'Abdullayev Anvar Anvarovich' })
  doctorFullname: string;

  @ApiProperty({ example: 'Kardiolog' })
  specialtyName: string;

  @ApiProperty({ example: 'Kardiologiya — asosiy malaka imtihoni' })
  examTitle: string;

  @ApiProperty({ example: 91 })
  score: number;

  @ApiProperty({ enum: QualificationLevel })
  qualification: QualificationLevel;

  @ApiProperty({ enum: CertificateStatus })
  status: CertificateStatus;

  @ApiProperty({ example: '2026-08-25T10:22:00.000Z' })
  issuedAt: Date;

  @ApiProperty({ example: '2027-08-25T10:22:00.000Z' })
  expiresAt: Date;

  @ApiProperty({ example: null, nullable: true })
  revokedAt: Date | null;

  @ApiProperty({ example: null, nullable: true })
  revokedReason: string | null;
}

class PublicCertificateDto {
  @ApiProperty({ example: 'DOC-2026-000123' })
  certificateId: string;

  @ApiProperty({ example: 'Abdullayev Anvar Anvarovich' })
  doctorFullname: string;

  @ApiProperty({ example: 'Kardiolog' })
  specialtyName: string;

  @ApiProperty({ example: 'Kardiologiya — asosiy malaka imtihoni' })
  examTitle: string;

  @ApiProperty({ example: 91 })
  score: number;

  @ApiProperty({ enum: QualificationLevel })
  qualification: QualificationLevel;

  @ApiProperty({ example: '2026-08-25T10:22:00.000Z' })
  issuedAt: Date;

  @ApiProperty({ example: '2027-08-25T10:22:00.000Z' })
  expiresAt: Date;

  @ApiProperty({ example: null, nullable: true })
  revokedAt: Date | null;
}

export class CertificateVerificationDto {
  @ApiProperty({ enum: ['VALID', 'EXPIRED', 'REVOKED', 'NOT_FOUND'] })
  status: string;

  @ApiProperty({
    type: PublicCertificateDto,
    nullable: true,
    description: 'Topilmagan holatda `null`',
  })
  certificate: PublicCertificateDto | null;
}
