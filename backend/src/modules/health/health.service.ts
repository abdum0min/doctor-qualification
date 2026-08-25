import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from 'src/modules/prisma/prisma.service';

export interface HealthReport {
  status: 'ok' | 'degraded';
  database: 'up' | 'down';
  uptime: number;
  timestamp: string;
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly prisma: PrismaService) {}

  async check(): Promise<HealthReport> {
    const database = await this.pingDatabase();

    return {
      status: database === 'up' ? 'ok' : 'degraded',
      database,
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }

  private async pingDatabase(): Promise<'up' | 'down'> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return 'up';
    } catch (error) {
      this.logger.error(
        'Health check: database ping failed',
        error instanceof Error ? error.message : String(error),
      );
      return 'down';
    }
  }
}
