import { ApiProperty } from '@nestjs/swagger';

import { Difficulty } from 'src/generated/prisma/enums';

class QuestionOptionDto {
  @ApiProperty({ example: 41 })
  id: number;

  @ApiProperty({ example: 'Ko`krak qafasidagi siquvchi og`riq' })
  text: string;

  @ApiProperty({
    example: true,
    description: 'Faqat admin javoblarida qaytadi',
  })
  isCorrect: boolean;
}

export class QuestionDto {
  @ApiProperty({ example: 17 })
  id: number;

  @ApiProperty({ example: 5 })
  examId: number;

  @ApiProperty({ example: 'Miokard infarktining asosiy belgisi qaysi?' })
  text: string;

  @ApiProperty({ enum: Difficulty, example: Difficulty.INTERMEDIATE })
  difficulty: Difficulty;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: 0, description: 'Imtihon ichidagi tartib raqami' })
  position: number;

  @ApiProperty({ type: [QuestionOptionDto] })
  options: QuestionOptionDto[];

  @ApiProperty({ example: '2026-01-01T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-01-01T10:00:00.000Z' })
  updatedAt: Date;
}
