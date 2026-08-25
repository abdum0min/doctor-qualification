import { Module } from '@nestjs/common';

import { SpecialtiesModule } from 'src/modules/specialties/specialties.module';

import { ExamsController } from './exams.controller';
import { ExamsService } from './exams.service';

@Module({
  imports: [SpecialtiesModule],
  controllers: [ExamsController],
  providers: [ExamsService],
  exports: [ExamsService],
})
export class ExamsModule {}
