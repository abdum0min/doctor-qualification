import { Module } from '@nestjs/common';

import { AttemptEvaluator } from './attempt-evaluator';
import { AttemptsController } from './attempts.controller';
import { AttemptsService } from './attempts.service';

@Module({
  controllers: [AttemptsController],
  providers: [AttemptsService, AttemptEvaluator],
  exports: [AttemptsService],
})
export class AttemptsModule {}
