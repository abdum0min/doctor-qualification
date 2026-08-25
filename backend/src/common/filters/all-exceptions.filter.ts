import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

import {
  EnvironmentVariables,
  isProductionEnv,
} from '../../config/env.validation';
import { Prisma } from '../../generated/prisma/client';
import { ApiErrorResponse } from '../interfaces/api-response.interface';

interface NormalizedError {
  statusCode: number;
  message: string;
  errors?: string[];
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables, true>,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { statusCode, message, errors } = this.normalize(exception);

    const body: ApiErrorResponse = {
      success: false,
      statusCode,
      message,
      ...(errors?.length ? { errors } : {}),
      timestamp: new Date().toISOString(),
      path: request.originalUrl,
    };

    this.logException(exception, request, statusCode, message);

    response.status(statusCode).json(body);
  }

  private normalize(exception: unknown): NormalizedError {
    if (exception instanceof HttpException) {
      return this.fromHttpException(exception);
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.fromPrismaKnownError(exception);
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid data provided for the database operation',
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message:
        this.isProduction() || !(exception instanceof Error)
          ? 'Internal server error'
          : exception.message,
    };
  }

  private fromHttpException(exception: HttpException): NormalizedError {
    const statusCode = exception.getStatus();
    const payload = exception.getResponse();

    if (typeof payload === 'string') {
      return { statusCode, message: payload };
    }

    const { message } = payload as { message?: string | string[] };

    if (Array.isArray(message)) {
      return { statusCode, message: 'Validation failed', errors: message };
    }

    return { statusCode, message: message ?? exception.message };
  }

  private fromPrismaKnownError(
    exception: Prisma.PrismaClientKnownRequestError,
  ): NormalizedError {
    const meta = exception.meta ?? {};

    switch (exception.code) {
      case 'P2002': {
        const target: unknown = meta.target;
        let fields = 'field';

        if (Array.isArray(target)) {
          fields = target.map(String).join(', ');
        } else if (typeof target === 'string') {
          fields = target;
        }

        return {
          statusCode: HttpStatus.CONFLICT,
          message: `A record with this ${fields} already exists`,
        };
      }

      case 'P2025':
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message:
            typeof meta.cause === 'string' ? meta.cause : 'Record not found',
        };

      case 'P2003':
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Related record does not exist',
        };

      case 'P2014':
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message:
            'The change would violate a required relation between records',
        };

      case 'P2000':
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'The provided value is too long for one of the fields',
        };

      default:
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Database request failed (${exception.code})`,
        };
    }
  }

  private logException(
    exception: unknown,
    request: Request,
    statusCode: number,
    message: string,
  ): void {
    const context = `${request.method} ${request.originalUrl} -> ${statusCode} ${message}`;

    if (statusCode >= 500) {
      this.logger.error(
        context,
        exception instanceof Error ? exception.stack : undefined,
      );
      return;
    }

    this.logger.warn(context);
  }

  private isProduction(): boolean {
    return isProductionEnv(this.configService.get('NODE_ENV', { infer: true }));
  }
}
