import { Module } from '@nestjs/common';

import { NotificationsModule } from 'src/modules/notifications/notifications.module';

import { CertificatePdfService } from './certificate-pdf.service';
import { CertificatesController } from './certificates.controller';
import { CertificatesService } from './certificates.service';

@Module({
  imports: [NotificationsModule],
  controllers: [CertificatesController],
  providers: [CertificatesService, CertificatePdfService],
  exports: [CertificatesService],
})
export class CertificatesModule {}
