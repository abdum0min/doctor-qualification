import { randomBytes } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import {
  BadRequestException,
  Injectable,
  Logger,
  PayloadTooLargeException,
  ServiceUnavailableException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { EnvironmentVariables } from 'src/config/env.validation';
import { IS_SERVERLESS } from 'src/config/runtime';

import { ALLOWED_IMAGE_TYPES, UploadTarget } from './upload-target';

const PUBLIC_PREFIX = '/uploads';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private readonly rootDir: string;
  private readonly maxBytes: number;

  constructor(config: ConfigService<EnvironmentVariables, true>) {
    this.rootDir = resolve(
      process.cwd(),
      config.get('UPLOAD_DIR', { infer: true }),
    );
    this.maxBytes =
      config.get('MAX_UPLOAD_SIZE_MB', { infer: true }) * 1024 * 1024;
  }

  get storageRoot(): string {
    return this.rootDir;
  }

  get publicPrefix(): string {
    return PUBLIC_PREFIX;
  }

  /** Serverless'da doimiy fayl tizimi yo'q — yuklash o'chirilgan bo'ladi. */
  get isEnabled(): boolean {
    return !IS_SERVERLESS;
  }

  /**
   * Fayl nomi hech qachon mijozdan olinmaydi — tasodifiy nom va MIME turidan
   * kelib chiqqan kengaytma ishlatiladi. Shuning uchun `..` yoki bajariladigan
   * kengaytma orqali papkadan chiqib ketib bo'lmaydi.
   */
  async saveImage(
    target: UploadTarget,
    file: Express.Multer.File | undefined,
  ): Promise<string> {
    // Serverless fayl tizimi vaqtinchalik — yozilgan rasm keyingi so'rovda
    // yo'qoladi. Buni jimgina qabul qilgandan ko'ra ochiq aytgan ma'qul.
    if (!this.isEnabled) {
      throw new ServiceUnavailableException(
        'File uploads need persistent storage and are disabled in this deployment',
      );
    }

    if (!file?.buffer?.length) {
      throw new BadRequestException('File is empty');
    }

    if (file.size > this.maxBytes) {
      throw new PayloadTooLargeException(
        `File exceeds the ${Math.round(this.maxBytes / 1024 / 1024)}MB limit`,
      );
    }

    const extension = ALLOWED_IMAGE_TYPES[file.mimetype];

    if (!extension) {
      throw new UnsupportedMediaTypeException(
        'Only JPEG, PNG and WebP images are allowed',
      );
    }

    const directory = join(this.rootDir, target);
    const filename = `${randomBytes(16).toString('hex')}${extension}`;

    await mkdir(directory, { recursive: true });
    await writeFile(join(directory, filename), file.buffer);

    return `${PUBLIC_PREFIX}/${target}/${filename}`;
  }

  /**
   * Almashtirilgan rasmni diskdan olib tashlaydi. Yo'l saqlash papkasidan
   * tashqariga chiqsa yoki fayl topilmasa jimgina e'tiborsiz qoldiriladi —
   * bu asosiy amaliyotni (profil yangilash) to'xtatmasligi kerak.
   */
  async removeByUrl(url: string | null | undefined): Promise<void> {
    if (!this.isEnabled || !url?.startsWith(`${PUBLIC_PREFIX}/`)) {
      return;
    }

    const absolute = resolve(this.rootDir, url.slice(PUBLIC_PREFIX.length + 1));

    if (!absolute.startsWith(this.rootDir)) {
      return;
    }

    await unlink(absolute).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== 'ENOENT') {
        this.logger.warn(`Could not remove upload ${url}: ${error.message}`);
      }
    });
  }
}
