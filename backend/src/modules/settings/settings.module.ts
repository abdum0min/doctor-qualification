import { Global, Module } from '@nestjs/common';

import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

/**
 * Reyting, sertifikat va imtihon modullari sozlamalarni o'qiydi — shuning
 * uchun global qilingan, har birida alohida import takrorlanmasin.
 */
@Global()
@Module({
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
