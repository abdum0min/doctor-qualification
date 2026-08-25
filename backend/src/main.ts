import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app.module';
import {
  ApiErrorResponseDto,
  ApiSuccessEnvelope,
  PaginationMetaDto,
} from './common/swagger/api-response.dto';
import { EnvironmentVariables, isProductionEnv } from './config/env.validation';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService<EnvironmentVariables, true>);

  const apiPrefix = config.get('API_PREFIX', { infer: true });
  const appName = config.get('APP_NAME', { infer: true });
  const port = config.get('PORT', { infer: true });
  const isProduction = isProductionEnv(config.get('NODE_ENV', { infer: true }));

  app.setGlobalPrefix(apiPrefix);

  // Swagger UI inline skript/stil ishlatadi — shuning uchun CSP o'chirilgan.
  app.use(helmet({ contentSecurityPolicy: false }));

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

  app.enableShutdownHooks();

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

  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`${appName} (${isProduction ? 'production' : 'development'})`);
  logger.log(`API      -> http://localhost:${port}/${apiPrefix}`);
  logger.log(`Swagger  -> http://localhost:${port}/${apiPrefix}/docs`);
  logger.log(`Health   -> http://localhost:${port}/${apiPrefix}/health`);
}

void bootstrap();
