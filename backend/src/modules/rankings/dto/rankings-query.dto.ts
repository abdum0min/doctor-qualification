import { ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';

import { PageQueryDto } from 'src/common/dto/pagination-query.dto';

export enum RankingPeriod {
  AllTime = 'all',
  Month = 'month',
  Quarter = 'quarter',
  Year = 'year',
}

export class RankingsQueryDto extends PickType(PageQueryDto, [
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

  @ApiPropertyOptional({
    enum: RankingPeriod,
    default: RankingPeriod.AllTime,
    description: 'Tanlangan oraliqda imtihon topshirganlar bilan cheklaydi',
  })
  @IsOptional()
  @IsEnum(RankingPeriod)
  period: RankingPeriod = RankingPeriod.AllTime;
}
