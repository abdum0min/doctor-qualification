import { Module } from '@nestjs/common';

import { AdminAnnouncementsController } from './admin-announcements.controller';
import { AnnouncementsService } from './announcements.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  controllers: [NotificationsController, AdminAnnouncementsController],
  providers: [NotificationsService, AnnouncementsService],
  // Imtihonlar va sertifikatlar moduli xabar yozishi uchun eksport qilinadi.
  exports: [NotificationsService],
})
export class NotificationsModule {}
