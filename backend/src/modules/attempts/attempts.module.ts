import { Module } from '@nestjs/common';

import { CertificatesModule } from 'src/modules/certificates/certificates.module';

import { AttemptEvaluator } from './attempt-evaluator';
import { AttemptsController } from './attempts.controller';
import { AttemptsService } from './attempts.service';

@Module({
  imports: [CertificatesModule],
  controllers: [AttemptsController],
  providers: [AttemptsService, AttemptEvaluator],
  exports: [AttemptsService],
})
export class AttemptsModule {}
