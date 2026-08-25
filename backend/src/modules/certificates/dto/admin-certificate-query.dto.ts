import { ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { CursorQueryDto } from 'src/common/dto/pagination-query.dto';
import { CertificateStatus } from 'src/generated/prisma/enums';

export class AdminCertificateQueryDto extends PickType(CursorQueryDto, [
  'limit',
  'search',
  'cursor',
] as const) {
  @ApiPropertyOptional({ enum: CertificateStatus })
  @IsOptional()
  @IsEnum(CertificateStatus)
  status?: CertificateStatus;
}
