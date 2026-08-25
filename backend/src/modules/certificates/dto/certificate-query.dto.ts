import { PickType } from '@nestjs/swagger';

import { PageQueryDto } from 'src/common/dto/pagination-query.dto';

export class CertificateQueryDto extends PickType(PageQueryDto, [
  'page',
  'limit',
] as const) {}
