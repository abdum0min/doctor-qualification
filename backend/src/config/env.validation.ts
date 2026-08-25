import { plainToInstance, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

/**
 * Ilova ishga tushishidan oldin tekshiriladigan barcha environment o'zgaruvchilar.
 * Yangi ENV kerak bo'lsa: avval shu klassga, keyin `.env.example`ga qo'shing.
 * Xato yoki yetishmayotgan qiymat bo'lsa ilova umuman ko'tarilmaydi.
 */
export class EnvironmentVariables {
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv = NodeEnv.Development;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 3000;

  @IsString()
  @IsNotEmpty()
  API_PREFIX: string = 'api';

  /** Swagger sarlavhasi va loglarda ko'rinadigan nom. */
  @IsString()
  @IsNotEmpty()
  APP_NAME: string = 'Doctor Qualification API';

  /** Vergul bilan ajratilgan ro'yxat: `https://app.com,https://admin.app.com` */
  @IsString()
  @IsNotEmpty()
  CORS_ORIGIN!: string;

  /** Runtime ulanishi — Neon/Supabase'da pooled URL (`-pooler`) bo'lishi kerak. */
  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsString()
  @MinLength(32, { message: 'JWT_SECRET must be at least 32 characters long' })
  JWT_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  JWT_EXPIRES_IN: string = '1d';

  /** Rate limit oynasi (millisekund). */
  @Type(() => Number)
  @IsInt()
  @Min(1_000)
  THROTTLE_TTL: number = 60_000;

  /** Bitta IP shu oyna ichida yubora oladigan so'rovlar soni. */
  @Type(() => Number)
  @IsInt()
  @Min(1)
  THROTTLE_LIMIT: number = 120;
}

export function isProductionEnv(nodeEnv: NodeEnv): boolean {
  return nodeEnv === NodeEnv.Production;
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
    excludeExtraneousValues: false,
  });

  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    const details = errors
      .map((error) => Object.values(error.constraints ?? {}).join(', '))
      .join('\n  - ');

    throw new Error(`Invalid environment variables:\n  - ${details}`);
  }

  return validated;
}
