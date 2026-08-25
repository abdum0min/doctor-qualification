import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';

import { ApiErrorResponseDto } from './api-response.dto';

interface DataResponseOptions {
  status?: number;
  description?: string;
  /** `true` bo'lsa `data` massiv sifatida hujjatlashtiriladi. */
  isArray?: boolean;
}

/**
 * `ResponseInterceptor` har bir javobni bir xil konvertga o'raydi, lekin Swagger
 * buni bilmaydi — u faqat controller qaytargan tipni ko'radi. Quyidagi
 * dekoratorlar hujjatdagi sxemani haqiqiy javobga moslashtiradi.
 *
 * @example
 * ```ts
 * @Get(':id')
 * @ApiDataResponse(UserDto, { description: 'Bitta foydalanuvchi' })
 * findOne(@Param('id') id: number) { ... }
 * ```
 */
export function ApiDataResponse<TModel extends Type<unknown>>(
  model: TModel,
  { status = 200, description, isArray = false }: DataResponseOptions = {},
): MethodDecorator & ClassDecorator {
  const data = isArray
    ? { type: 'array', items: { $ref: getSchemaPath(model) } }
    : { $ref: getSchemaPath(model) };

  return applyDecorators(
    ApiExtraModels(model),
    ApiResponse({
      status,
      description,
      schema: {
        allOf: [{ $ref: '#/components/schemas/ApiSuccessEnvelope' }],
        properties: { data },
      },
    }),
  );
}

/**
 * Kursorli paginatsiya bilan qaytadigan ro'yxat javoblari uchun.
 * `data` — elementlar massivi, `meta` — `{ limit, nextCursor, hasMore }`.
 */
export function ApiPaginatedResponse<TModel extends Type<unknown>>(
  model: TModel,
  description?: string,
): MethodDecorator & ClassDecorator {
  return applyDecorators(
    ApiExtraModels(model),
    ApiResponse({
      status: 200,
      description,
      schema: {
        allOf: [{ $ref: '#/components/schemas/ApiSuccessEnvelope' }],
        properties: {
          data: { type: 'array', items: { $ref: getSchemaPath(model) } },
          meta: { $ref: '#/components/schemas/CursorPaginationMetaDto' },
        },
      },
    }),
  );
}

/** Controller yoki metodga standart xato javoblarini biriktiradi. */
export function ApiErrorResponses(
  ...statuses: Array<400 | 401 | 403 | 404 | 409 | 422 | 429 | 500>
): MethodDecorator & ClassDecorator {
  const descriptions: Record<number, string> = {
    400: 'Validatsiya yoki so`rov xatosi',
    401: 'Token yo`q yoki yaroqsiz',
    403: 'Ruxsat yetarli emas',
    404: 'Topilmadi',
    409: 'Konflikt (masalan, email band)',
    422: 'Ma`lumot qayta ishlanmadi',
    429: 'Juda ko`p so`rov yuborildi',
    500: 'Server xatosi',
  };

  return applyDecorators(
    ApiExtraModels(ApiErrorResponseDto),
    ...statuses.map((status) =>
      ApiResponse({
        status,
        description: descriptions[status],
        type: ApiErrorResponseDto,
      }),
    ),
  );
}
