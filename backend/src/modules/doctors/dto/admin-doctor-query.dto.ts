import { ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';

import { PageQueryDto } from 'src/common/dto/pagination-query.dto';

export enum DoctorAccountStatus {
  Active = 'active',
  Blocked = 'blocked',
}

export class AdminDoctorQueryDto extends PickType(PageQueryDto, [
  'page',
  'limit',
  'search',
] as const) {
  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  specialtyId?: number;

  @ApiPropertyOptional({ enum: DoctorAccountStatus })
  @IsOptional()
  @IsEnum(DoctorAccountStatus)
  status?: DoctorAccountStatus;
}
