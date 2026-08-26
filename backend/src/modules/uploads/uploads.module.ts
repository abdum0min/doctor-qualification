import { Module } from '@nestjs/common';

import { AvatarsService } from './avatars.service';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

@Module({
  controllers: [UploadsController],
  providers: [UploadsService, AvatarsService],
  // `main.ts` static papkani shu servisdan oladi.
  exports: [UploadsService],
})
export class UploadsModule {}
