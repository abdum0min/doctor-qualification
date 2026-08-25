import { ApiProperty } from '@nestjs/swagger';

class ExamSpecialtyDto {
  @ApiProperty({ example: 3 })
  id: number;

  @ApiProperty({ example: 'Kardiolog' })
  name: string;
}

export class ExamDto {
  @ApiProperty({ example: 5 })
  id: number;

  @ApiProperty({ example: 'Kardiologiya — asosiy malaka imtihoni' })
  title: string;

  @ApiProperty({ example: 'Yurak-qon tomir kasalliklari', nullable: true })
  description: string | null;

  @ApiProperty({ example: 20 })
  questionCount: number;

  @ApiProperty({ example: 30 })
  timeLimitMinutes: number;

  @ApiProperty({ example: 70 })
  passingScore: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ type: ExamSpecialtyDto })
  specialty: ExamSpecialtyDto;
}

export class AdminExamDto extends ExamDto {
  @ApiProperty({
    example: 38,
    description: 'Imtihonga biriktirilgan faol savollar',
  })
  availableQuestions: number;

  @ApiProperty({ example: 12 })
  attemptsCount: number;

  @ApiProperty({ example: '2026-01-01T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-01-01T10:00:00.000Z' })
  updatedAt: Date;
}
