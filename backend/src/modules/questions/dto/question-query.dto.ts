import { ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';

import { CursorQueryDto } from 'src/common/dto/pagination-query.dto';
import { Difficulty } from 'src/generated/prisma/enums';

/**
 * Query string'da boolean ishonchsiz: `enableImplicitConversion` `'false'` ni
 * `true` ga aylantiradi. Shuning uchun uch holatli enum ishlatiladi —
 * qiymat berilmasa barcha savollar qaytadi.
 */
export enum QuestionStatus {
  Active = 'active',
  Inactive = 'inactive',
}

export class QuestionQueryDto extends PickType(CursorQueryDto, [
  'limit',
  'search',
  'cursor',
] as const) {
  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  specialtyId?: number;

  @ApiPropertyOptional({ enum: Difficulty })
  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @ApiPropertyOptional({ enum: QuestionStatus })
  @IsOptional()
  @IsEnum(QuestionStatus)
  status?: QuestionStatus;
}
