import { Module } from '@nestjs/common';

import { SpecialtiesModule } from 'src/modules/specialties/specialties.module';

import { QuestionsImportController } from './import/questions-import.controller';
import { QuestionsImportService } from './import/questions-import.service';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';

@Module({
  imports: [SpecialtiesModule],
  // Import controlleri savol controlleridan oldin turadi, aks holda
  // `POST /:examId/questions/import` `:id` parametriga tushib qoladi.
  controllers: [QuestionsImportController, QuestionsController],
  providers: [QuestionsService, QuestionsImportService],
  exports: [QuestionsService],
})
export class QuestionsModule {}
