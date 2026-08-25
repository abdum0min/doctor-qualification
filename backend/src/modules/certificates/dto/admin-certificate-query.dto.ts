import { ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { PageQueryDto } from 'src/common/dto/pagination-query.dto';
import { CertificateStatus } from 'src/generated/prisma/enums';

export class AdminCertificateQueryDto extends PickType(PageQueryDto, [
  'page',
  'limit',
  'search',
] as const) {
  @ApiPropertyOptional({ enum: CertificateStatus })
  @IsOptional()
  @IsEnum(CertificateStatus)
  status?: CertificateStatus;
}
