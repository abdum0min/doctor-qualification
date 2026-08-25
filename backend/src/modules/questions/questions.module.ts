import { Module } from '@nestjs/common';

import { SpecialtiesModule } from 'src/modules/specialties/specialties.module';

import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';

@Module({
  imports: [SpecialtiesModule],
  controllers: [QuestionsController],
  providers: [QuestionsService],
  exports: [QuestionsService],
})
export class QuestionsModule {}
