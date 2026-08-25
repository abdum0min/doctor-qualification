import { ApiProperty } from '@nestjs/swagger';

import { AttemptStatus, QualificationLevel } from 'src/generated/prisma/enums';

export class AdminAttemptDto {
  @ApiProperty({ example: 12 })
  id: number;

  @ApiProperty({ example: 4 })
  doctorId: number;

  @ApiProperty({ example: 'Abdullayev Anvar Anvarovich' })
  doctorFullname: string;

  @ApiProperty({ example: 'Kardiologiya — asosiy malaka imtihoni' })
  examTitle: string;

  @ApiProperty({ example: 'Kardiolog' })
  specialtyName: string;

  @ApiProperty({ enum: AttemptStatus })
  status: AttemptStatus;

  @ApiProperty({ example: 20 })
  questionCount: number;

  @ApiProperty({ example: 17, nullable: true })
  correctCount: number | null;

  @ApiProperty({ example: 85, nullable: true })
  score: number | null;

  @ApiProperty({ enum: QualificationLevel, nullable: true })
  qualification: QualificationLevel | null;

  @ApiProperty({ example: true, nullable: true })
  passed: boolean | null;

  @ApiProperty({ example: '2026-08-25T10:00:00.000Z' })
  startedAt: Date;

  @ApiProperty({ example: '2026-08-25T10:22:00.000Z', nullable: true })
  completedAt: Date | null;

  @ApiProperty({ example: 'DOC-2026-000123', nullable: true })
  certificateId: string | null;
}

class AdminAttemptOptionDto {
  @ApiProperty({ example: 168 })
  id: number;

  @ApiProperty({ example: 'Ko`krak qafasi orqasidagi siquvchi og`riq' })
  text: string;

  @ApiProperty({ example: true })
  isCorrect: boolean;
}

class AdminAttemptQuestionDto {
  @ApiProperty({ example: 42 })
  id: number;

  @ApiProperty({ example: 0 })
  position: number;

  @ApiProperty({ example: 'Miokard infarktining asosiy belgisi qaysi?' })
  questionText: string;

  @ApiProperty({ example: true, nullable: true })
  isCorrect: boolean | null;

  @ApiProperty({ example: 168, nullable: true })
  selectedOptionId: number | null;

  @ApiProperty({ type: [AdminAttemptOptionDto] })
  options: AdminAttemptOptionDto[];
}

export class AdminAttemptDetailDto extends AdminAttemptDto {
  @ApiProperty({ example: 70 })
  passingScore: number;

  @ApiProperty({ example: 30 })
  timeLimitMinutes: number;

  @ApiProperty({ type: [AdminAttemptQuestionDto] })
  questions: AdminAttemptQuestionDto[];
}
