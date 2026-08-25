import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { ExactlyOneCorrect } from 'src/common/validators/exactly-one-correct.validator';
import { Difficulty } from 'src/generated/prisma/enums';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class QuestionOptionInput {
  @ApiProperty({ example: 'Yurak yetishmovchiligi', maxLength: 500 })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  @Transform(trim)
  text: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  isCorrect: boolean;
}

export class CreateQuestionDto {
  @ApiProperty({ example: 3 })
  @IsInt()
  @IsPositive()
  specialtyId: number;

  @ApiProperty({
    example: 'Miokard infarktining asosiy belgisi qaysi?',
    maxLength: 1000,
  })
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  @Transform(trim)
  text: string;

  @ApiProperty({ enum: Difficulty, example: Difficulty.INTERMEDIATE })
  @IsEnum(Difficulty)
  difficulty: Difficulty;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ type: [QuestionOptionInput], minItems: 2, maxItems: 6 })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(6)
  @ValidateNested({ each: true })
  @Type(() => QuestionOptionInput)
  @ExactlyOneCorrect()
  options: QuestionOptionInput[];
}
