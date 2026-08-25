import { PickType } from '@nestjs/swagger';

import { CursorQueryDto } from 'src/common/dto/pagination-query.dto';

export class CertificateQueryDto extends PickType(CursorQueryDto, [
  'limit',
  'cursor',
] as const) {}
