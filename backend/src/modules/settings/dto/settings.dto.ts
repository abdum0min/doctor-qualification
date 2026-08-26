import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, Max, Min } from 'class-validator';

export class PlatformSettingsDto {
  @ApiProperty({ example: 0.5, description: "O'rtacha natija vazni" })
  averageScoreWeight: number;

  @ApiProperty({ example: 0.2, description: 'Eng yuqori natija vazni' })
  bestScoreWeight: number;

  @ApiProperty({ example: 0.2, description: 'Urinishlar hajmi vazni' })
  volumeWeight: number;

  @ApiProperty({ example: 0.1, description: "O'tish ulushi vazni" })
  passRateWeight: number;

  @ApiProperty({
    example: 5,
    description: 'Hajm ko`rsatkichi to`liq ballga yetadigan urinishlar soni',
  })
  volumeTargetAttempts: number;

  @ApiProperty({
    example: 12,
    description: 'Yangi sertifikatlar amal qilish muddati (oy)',
  })
  certificateValidityMonths: number;

  @ApiProperty({ example: 10 })
  defaultQuestionCount: number;

  @ApiProperty({ example: 20 })
  defaultTimeLimitMinutes: number;

  @ApiProperty({ example: 60 })
  defaultPassingScore: number;

  @ApiProperty({ example: '2026-08-26T10:00:00.000Z' })
  updatedAt: Date;
}

class SettingsInputDto {
  @ApiProperty({ minimum: 0, maximum: 1, example: 0.5 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  averageScoreWeight: number;

  @ApiProperty({ minimum: 0, maximum: 1, example: 0.2 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  bestScoreWeight: number;

  @ApiProperty({ minimum: 0, maximum: 1, example: 0.2 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  volumeWeight: number;

  @ApiProperty({ minimum: 0, maximum: 1, example: 0.1 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  passRateWeight: number;

  @ApiProperty({ minimum: 1, maximum: 100, example: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  volumeTargetAttempts: number;

  @ApiProperty({ minimum: 1, maximum: 120, example: 12 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(120)
  certificateValidityMonths: number;

  @ApiProperty({ minimum: 1, maximum: 200, example: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  defaultQuestionCount: number;

  @ApiProperty({ minimum: 5, maximum: 300, example: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(5)
  @Max(300)
  defaultTimeLimitMinutes: number;

  @ApiProperty({ minimum: 1, maximum: 100, example: 60 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  defaultPassingScore: number;
}

/** Har bir maydon ixtiyoriy — forma faqat o'zgarganini yuboradi. */
export class UpdateSettingsDto extends PartialType(SettingsInputDto) {}

export class ExamDefaultsDto {
  @ApiPropertyOptional({ example: 10 })
  questionCount: number;

  @ApiPropertyOptional({ example: 20 })
  timeLimitMinutes: number;

  @ApiPropertyOptional({ example: 60 })
  passingScore: number;
}
