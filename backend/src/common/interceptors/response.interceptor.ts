import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import { map, Observable } from 'rxjs';

import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';
import {
  ApiSuccessResponse,
  isPaginated,
} from '../interfaces/api-response.interface';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiSuccessResponse<unknown>
> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiSuccessResponse<unknown>> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    const message =
      this.reflector.getAllAndOverride<string>(RESPONSE_MESSAGE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? 'Success';

    return next.handle().pipe(
      map((payload) => ({
        success: true as const,
        statusCode: response.statusCode,
        message,
        data: isPaginated(payload) ? payload.items : (payload ?? null),
        ...(isPaginated(payload) ? { meta: payload.meta } : {}),
        timestamp: new Date().toISOString(),
        path: request.originalUrl,
      })),
    );
  }
}
