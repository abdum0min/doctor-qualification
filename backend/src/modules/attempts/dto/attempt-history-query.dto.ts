import { ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';

import { PageQueryDto } from 'src/common/dto/pagination-query.dto';
import { AttemptStatus } from 'src/generated/prisma/enums';

export class AttemptHistoryQueryDto extends PickType(PageQueryDto, [
  'page',
  'limit',
] as const) {
  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  examId?: number;

  @ApiPropertyOptional({ enum: AttemptStatus })
  @IsOptional()
  @IsEnum(AttemptStatus)
  status?: AttemptStatus;
}
