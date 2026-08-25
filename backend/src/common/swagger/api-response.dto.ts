import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Swagger uchun hujjat modellari. Ular runtime'da ishlatilmaydi —
 * haqiqiy konvertni `ResponseInterceptor` va `AllExceptionsFilter` yasaydi.
 * Bu yerda ular faqat `/api/docs` sahifasi to'g'ri ko'rinishi uchun turadi.
 */

export class CursorPaginationMetaDto {
  @ApiProperty({ example: 10, description: 'So`ralgan sahifa hajmi' })
  limit: number;

  @ApiProperty({
    example: 'eyJpZCI6MTIsInNvcnQiOiIyMDI2LTAxLTAxIn0',
    nullable: true,
    description: 'Keyingi sahifani olish uchun `?cursor=` qiymati',
  })
  nextCursor: string | null;

  @ApiProperty({ example: true })
  hasMore: boolean;
}

/** Barcha muvaffaqiyatli javoblarning umumiy qismi. */
export class ApiSuccessEnvelope {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Success' })
  message: string;

  @ApiProperty({
    description: 'Endpoint qaytargan foydali yuk',
    additionalProperties: true,
  })
  data: unknown;

  @ApiPropertyOptional({ type: CursorPaginationMetaDto })
  meta?: CursorPaginationMetaDto;

  @ApiProperty({ example: '2026-01-01T10:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: '/api/auth/me' })
  path: string;
}

/** Barcha xato javoblarining yagona formati. */
export class ApiErrorResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Validation failed' })
  message: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['email must be an email'],
    description: 'Faqat validatsiya xatolarida qaytadi',
  })
  errors?: string[];

  @ApiProperty({ example: '2026-01-01T10:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: '/api/auth/login' })
  path: string;
}
