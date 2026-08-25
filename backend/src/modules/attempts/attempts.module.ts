import { Module } from '@nestjs/common';

import { CertificatesModule } from 'src/modules/certificates/certificates.module';

import { AdminAttemptsController } from './admin-attempts.controller';
import { AdminAttemptsService } from './admin-attempts.service';
import { AttemptEvaluator } from './attempt-evaluator';
import { AttemptsController } from './attempts.controller';
import { AttemptsService } from './attempts.service';

@Module({
  imports: [CertificatesModule],
  controllers: [AttemptsController, AdminAttemptsController],
  providers: [AttemptsService, AdminAttemptsService, AttemptEvaluator],
  exports: [AttemptsService],
})
export class AttemptsModule {}
