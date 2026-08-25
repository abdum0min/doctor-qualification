import { ApiProperty } from '@nestjs/swagger';

import { QualificationLevel } from 'src/generated/prisma/enums';

export class RankingRowDto {
  @ApiProperty({ example: 1, description: 'Reytingdagi o`rin' })
  position: number;

  @ApiProperty({ example: 4 })
  doctorId: number;

  @ApiProperty({ example: 'Abdullayev Anvar Anvarovich' })
  fullname: string;

  @ApiProperty({ example: 'Kardiolog', nullable: true })
  specialtyName: string | null;

  @ApiProperty({ example: '1-sonli shahar shifoxonasi', nullable: true })
  workplace: string | null;

  @ApiProperty({ enum: QualificationLevel, nullable: true })
  qualification: QualificationLevel | null;

  @ApiProperty({ example: 6 })
  attemptCount: number;

  @ApiProperty({ example: 4 })
  passedCount: number;

  @ApiProperty({ example: 87 })
  averageScore: number;

  @ApiProperty({ example: 96 })
  bestScore: number;

  @ApiProperty({ example: 2 })
  certificatesCount: number;

  @ApiProperty({ example: 88.4, description: 'Vaznli reyting bali' })
  score: number;

  @ApiProperty({ example: '2026-08-25T10:22:00.000Z', nullable: true })
  lastAttemptAt: Date | null;
}

export class MyRankingDto {
  @ApiProperty({ example: 12, nullable: true })
  position: number | null;

  @ApiProperty({ example: 240 })
  totalDoctors: number;

  @ApiProperty({ type: RankingRowDto, nullable: true })
  row: RankingRowDto | null;
}
