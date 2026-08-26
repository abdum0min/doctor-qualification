import { Module } from '@nestjs/common';

import { NotificationsModule } from 'src/modules/notifications/notifications.module';
import { SpecialtiesModule } from 'src/modules/specialties/specialties.module';

import { ExamsController } from './exams.controller';
import { ExamsService } from './exams.service';

@Module({
  imports: [SpecialtiesModule, NotificationsModule],
  controllers: [ExamsController],
  providers: [ExamsService],
  exports: [ExamsService],
})
export class ExamsModule {}
