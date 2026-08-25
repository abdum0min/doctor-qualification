import { ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';

import { PageQueryDto } from 'src/common/dto/pagination-query.dto';
import { AttemptStatus } from 'src/generated/prisma/enums';

export class AdminAttemptQueryDto extends PickType(PageQueryDto, [
  'page',
  'limit',
  'search',
] as const) {
  @ApiPropertyOptional({ enum: AttemptStatus })
  @IsOptional()
  @IsEnum(AttemptStatus)
  status?: AttemptStatus;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  examId?: number;

  @ApiPropertyOptional({
    example: 4,
    description: 'DoctorProfile identifikatori',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  doctorId?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  specialtyId?: number;
}
