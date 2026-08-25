import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from 'src/common/decorators/public.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';

import { HealthService, type HealthReport } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  @ResponseMessage('Service is healthy')
  @ApiOperation({
    summary: 'Servis holati',
    description:
      'Deploy platformalari (Render, Railway, Fly) uchun health probe. Bazaga ham ping yuboradi.',
  })
  check(): Promise<HealthReport> {
    return this.healthService.check();
  }
}
