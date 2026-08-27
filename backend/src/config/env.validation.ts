import { plainToInstance, Type } from 'class-transformer';
import {
  IsBoolean,
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

  /**
   * Swagger hujjatlari. Bo'sh qoldirilsa productionda o'chirilgan, qolgan
   * muhitlarda yoqilgan — qiymati `validateEnv` ichida hisoblanadi.
   */
  @IsBoolean()
  SWAGGER_ENABLED: boolean = true;

  /** Vergul bilan ajratilgan ro'yxat: `https://app.com,https://admin.app.com` */
  @IsString()
  @IsNotEmpty()
  CORS_ORIGIN!: string;

  /** Sertifikat QR kodi shu manzilga ishora qiladi. */
  @IsString()
  @IsNotEmpty()
  PUBLIC_APP_URL: string = 'http://localhost:5173';

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

  /** Yuklangan fayllar saqlanadigan papka (loyiha ildiziga nisbatan). */
  @IsString()
  @IsNotEmpty()
  UPLOAD_DIR: string = 'uploads';

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  MAX_UPLOAD_SIZE_MB: number = 5;
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

  /*
   * Mantiqiy bayroqni `@Transform` bilan hal qilib bo'lmaydi:
   * `enableImplicitConversion` yoqilgani uchun `'false'` satri
   * `Boolean('false') === true` ga aylanadi, umuman berilmagan maydonga esa
   * class-transformer tegmaydi va sinf standarti qolib ketadi.
   */
  validated.SWAGGER_ENABLED = parseFlag(
    config.SWAGGER_ENABLED,
    !isProductionEnv(validated.NODE_ENV),
  );

  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    const details = errors
      .map((error) => Object.values(error.constraints ?? {}).join(', '))
      .join('\n  - ');

    throw new Error(`Invalid environment variables:\n  - ${details}`);
  }

  return validated;
}

/** `'true'` / `'false'` satrini o'qiydi; bo'sh bo'lsa standart qiymat. */
function parseFlag(value: unknown, fallback: boolean): boolean {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  return value === true || value === 'true';
}
