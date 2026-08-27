import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { createNestApp } from './app.factory';
import { EnvironmentVariables, isProductionEnv } from './config/env.validation';

async function bootstrap(): Promise<void> {
  const app = await createNestApp();
  const config = app.get(ConfigService<EnvironmentVariables, true>);

  const apiPrefix = config.get('API_PREFIX', { infer: true });
  const appName = config.get('APP_NAME', { infer: true });
  const port = config.get('PORT', { infer: true });
  const isProduction = isProductionEnv(config.get('NODE_ENV', { infer: true }));

  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`${appName} (${isProduction ? 'production' : 'development'})`);
  logger.log(`API      -> http://localhost:${port}/${apiPrefix}`);
  logger.log(`Health   -> http://localhost:${port}/${apiPrefix}/health`);

  if (config.get('SWAGGER_ENABLED', { infer: true })) {
    logger.log(`Swagger  -> http://localhost:${port}/${apiPrefix}/docs`);
  }
}

void bootstrap().catch((error: unknown) => {
  console.error('Failed to start the API:', error);
  process.exit(1);
});
