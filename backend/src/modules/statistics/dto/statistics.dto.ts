import { ApiProperty } from '@nestjs/swagger';

export class PlatformOverviewDto {
  @ApiProperty({ example: 2458 })
  totalDoctors: number;

  @ApiProperty({ example: 2401 })
  activeDoctors: number;

  @ApiProperty({ example: 1856 })
  doctorsWithAttempts: number;

  @ApiProperty({ example: 2103 })
  totalAttempts: number;

  @ApiProperty({ example: 1856 })
  completedAttempts: number;

  @ApiProperty({ example: 1248 })
  passedAttempts: number;

  @ApiProperty({ example: 608 })
  failedAttempts: number;

  @ApiProperty({ example: 1248 })
  certificatesIssued: number;

  @ApiProperty({ example: 1240 })
  activeCertificates: number;

  @ApiProperty({ example: 8 })
  revokedCertificates: number;

  @ApiProperty({ example: 85, nullable: true })
  averageScore: number | null;

  @ApiProperty({ example: 100, nullable: true })
  highestScore: number | null;
}

export class SpecialtyStatisticsDto {
  @ApiProperty({ example: 2 })
  specialtyId: number;

  @ApiProperty({ example: 'Kardiolog' })
  name: string;

  @ApiProperty({ example: 542 })
  doctorsCount: number;

  @ApiProperty({ example: 40 })
  questionsCount: number;

  @ApiProperty({ example: 2 })
  examsCount: number;

  @ApiProperty({ example: 318 })
  attemptsCount: number;

  @ApiProperty({ example: 240 })
  passedCount: number;

  @ApiProperty({ example: 82, nullable: true })
  averageScore: number | null;
}

class TopSpecialtyDto {
  @ApiProperty({ example: 'Kardiolog' })
  name: string;

  @ApiProperty({ example: 542 })
  doctorsCount: number;
}

export class PublicStatisticsDto {
  @ApiProperty({ example: 2458 })
  totalDoctors: number;

  @ApiProperty({ example: 1856 })
  completedAttempts: number;

  @ApiProperty({ example: 1248 })
  certificatesIssued: number;

  @ApiProperty({ example: 85, nullable: true })
  averageScore: number | null;

  @ApiProperty({ type: [TopSpecialtyDto] })
  topSpecialties: TopSpecialtyDto[];
}
