import { ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive } from 'class-validator';

import { CursorQueryDto } from 'src/common/dto/pagination-query.dto';

export class AttemptHistoryQueryDto extends PickType(CursorQueryDto, [
  'limit',
  'cursor',
] as const) {
  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  examId?: number;
}
