import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Swagger uchun hujjat modellari. Ular runtime'da ishlatilmaydi —
 * haqiqiy konvertni `ResponseInterceptor` va `AllExceptionsFilter` yasaydi.
 * Bu yerda ular faqat `/api/docs` sahifasi to'g'ri ko'rinishi uchun turadi.
 */

export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 128, description: 'Filtrga mos jami yozuvlar soni' })
  total: number;

  @ApiProperty({ example: 13 })
  totalPages: number;
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

  @ApiPropertyOptional({ type: PaginationMetaDto })
  meta?: PaginationMetaDto;

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
