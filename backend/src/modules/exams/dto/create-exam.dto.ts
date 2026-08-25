import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

import { EXAM_LIMITS } from '../exam.config';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateExamDto {
  @ApiProperty({ example: 3 })
  @IsInt()
  @IsPositive()
  specialtyId: number;

  @ApiProperty({ example: 'Kardiologiya — asosiy malaka imtihoni' })
  @IsString()
  @MinLength(5)
  @MaxLength(160)
  @Transform(trim)
  title: string;

  @ApiPropertyOptional({
    example: 'Yurak-qon tomir kasalliklari bo`yicha baholash',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(trim)
  description?: string | null;

  @ApiProperty({
    example: 20,
    minimum: EXAM_LIMITS.questionCount.min,
    maximum: EXAM_LIMITS.questionCount.max,
  })
  @IsInt()
  @Min(EXAM_LIMITS.questionCount.min)
  @Max(EXAM_LIMITS.questionCount.max)
  questionCount: number;

  @ApiProperty({
    example: 30,
    minimum: EXAM_LIMITS.timeLimitMinutes.min,
    maximum: EXAM_LIMITS.timeLimitMinutes.max,
  })
  @IsInt()
  @Min(EXAM_LIMITS.timeLimitMinutes.min)
  @Max(EXAM_LIMITS.timeLimitMinutes.max)
  timeLimitMinutes: number;

  @ApiProperty({
    example: 70,
    minimum: EXAM_LIMITS.passingScore.min,
    maximum: EXAM_LIMITS.passingScore.max,
    description: 'Sertifikat berilishi uchun kerakli foiz',
  })
  @IsInt()
  @Min(EXAM_LIMITS.passingScore.min)
  @Max(EXAM_LIMITS.passingScore.max)
  passingScore: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
