import { ApiProperty } from '@nestjs/swagger';

import {
  AttemptStatus,
  Difficulty,
  QualificationLevel,
} from 'src/generated/prisma/enums';

class AttemptSpecialtyDto {
  @ApiProperty({ example: 3 })
  id: number;

  @ApiProperty({ example: 'Kardiolog' })
  name: string;
}

class AttemptExamDto {
  @ApiProperty({ example: 5 })
  id: number;

  @ApiProperty({ example: 'Kardiologiya — asosiy malaka imtihoni' })
  title: string;

  @ApiProperty({ type: AttemptSpecialtyDto })
  specialty: AttemptSpecialtyDto;
}

export class AttemptOptionDto {
  @ApiProperty({ example: 168 })
  id: number;

  @ApiProperty({ example: 'Ko`krak qafasi orqasidagi siquvchi og`riq' })
  text: string;
}

export class AttemptQuestionDto {
  @ApiProperty({ example: 42 })
  id: number;

  @ApiProperty({ example: 0 })
  position: number;

  @ApiProperty({ example: 'Miokard infarktining asosiy belgisi qaysi?' })
  questionText: string;

  @ApiProperty({ enum: Difficulty })
  difficulty: Difficulty;

  @ApiProperty({ example: 168, nullable: true })
  selectedOptionId: number | null;

  @ApiProperty({ type: [AttemptOptionDto] })
  options: AttemptOptionDto[];
}

export class AttemptDto {
  @ApiProperty({ example: 12 })
  id: number;

  @ApiProperty({ enum: AttemptStatus })
  status: AttemptStatus;

  @ApiProperty({ type: AttemptExamDto })
  exam: AttemptExamDto;

  @ApiProperty({ example: 20 })
  questionCount: number;

  @ApiProperty({ example: 30 })
  timeLimitMinutes: number;

  @ApiProperty({ example: 70 })
  passingScore: number;

  @ApiProperty({ example: '2026-08-25T10:00:00.000Z' })
  startedAt: Date;

  @ApiProperty({ example: '2026-08-25T10:30:00.000Z' })
  deadlineAt: Date;

  @ApiProperty({ example: '2026-08-25T10:22:00.000Z', nullable: true })
  completedAt: Date | null;

  @ApiProperty({ example: 480, description: 'Server hisoblagan qolgan vaqt' })
  remainingSeconds: number;

  @ApiProperty({ example: 14 })
  answeredCount: number;

  @ApiProperty({ example: 17, nullable: true })
  correctCount: number | null;

  @ApiProperty({ example: 85, nullable: true })
  score: number | null;

  @ApiProperty({ enum: QualificationLevel, nullable: true })
  qualification: QualificationLevel | null;

  @ApiProperty({ example: true, nullable: true })
  passed: boolean | null;

  @ApiProperty({ type: [AttemptQuestionDto] })
  questions: AttemptQuestionDto[];
}
