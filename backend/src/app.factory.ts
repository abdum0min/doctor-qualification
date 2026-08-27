import type { ServerResponse } from 'node:http';

import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app.module';
import {
  ApiErrorResponseDto,
  ApiSuccessEnvelope,
  PaginationMetaDto,
} from './common/swagger/api-response.dto';
import { EnvironmentVariables, isProductionEnv } from './config/env.validation';
import { IS_SERVERLESS } from './config/runtime';
import { UploadsService } from './modules/uploads/uploads.service';

/**
 * Ilovani yig'ish `main.ts` (lokal server) va `api/index.js` (Vercel
 * serverless) uchun bitta joyda — ikkalasi bir xil konfiguratsiya bilan
 * ishga tushadi.
 */
export async function createNestApp(): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // Serverless'da xato `process.exit()` ga olib kelmasligi kerak —
    // handler uni ushlab, tushunarli javob qaytaradi.
    abortOnError: false,
  });

  const config = app.get(ConfigService<EnvironmentVariables, true>);

  const apiPrefix = config.get('API_PREFIX', { infer: true });
  const appName = config.get('APP_NAME', { infer: true });
  const isProduction = isProductionEnv(config.get('NODE_ENV', { infer: true }));

  app.setGlobalPrefix(apiPrefix);

  // Swagger UI inline skript/stil ishlatadi — shuning uchun CSP o'chirilgan.
  // Rasmlar boshqa domendagi frontendga berilishi kerak, shuning uchun CORP ochiq.
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // Serverless'da fayl tizimi vaqtinchalik — yuklangan rasmlar u yerda
  // saqlanmaydi, shuning uchun statik papka faqat oddiy serverda ulanadi.
  if (!IS_SERVERLESS) {
    const uploads = app.get(UploadsService);

    app.useStaticAssets(uploads.storageRoot, {
      prefix: uploads.publicPrefix,
      index: false,
      // Brauzer fayl turini o'zi taxmin qilib, uni skript sifatida ishga
      // tushirmasligi uchun.
      setHeaders: (response: ServerResponse) =>
        response.setHeader('X-Content-Type-Options', 'nosniff'),
    });
  }

  const allowedOrigins = config
    .get('CORS_ORIGIN', { infer: true })
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    // Development'da Vite portni almashtirishi mumkin (5173 band bo'lsa 5174),
    // shuning uchun har qanday localhost portiga ruxsat. Productionda faqat ro'yxat.
    origin: isProduction
      ? allowedOrigins
      : [...allowedOrigins, /^http:\/\/localhost:\d+$/],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Serverless instansiyasi signal bilan to'xtamaydi — ilgaklar faqat
  // uzoq ishlaydigan serverda kerak.
  if (!IS_SERVERLESS) {
    app.enableShutdownHooks();
  }

  if (config.get('SWAGGER_ENABLED', { infer: true })) {
    setupSwagger(app, apiPrefix, appName);
  }

  return app;
}

function setupSwagger(
  app: NestExpressApplication,
  apiPrefix: string,
  appName: string,
): void {
  const swaggerConfig = new DocumentBuilder()
    .setTitle(appName)
    .setDescription(
      'REST API. Barcha javoblar bir xil konvertda qaytadi: ' +
        '`{ success, statusCode, message, data, meta?, timestamp, path }`.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    extraModels: [ApiSuccessEnvelope, ApiErrorResponseDto, PaginationMetaDto],
  });

  SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: `${appName} — Docs`,
  });
}
