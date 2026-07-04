import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  private readonly startedAt = Date.now();

  constructor(
    private readonly health: HealthCheckService,
    private readonly mongo: MongooseHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    const mongoResult = await this.health.check([
      () => this.mongo.pingCheck('mongo', { timeout: 1000 }) as Promise<HealthIndicatorResult>,
    ]);
    return {
      ...mongoResult,
      uptime: Math.floor((Date.now() - this.startedAt) / 1000),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  @HealthCheck()
  ready() {
    return this.health.check([
      () => this.mongo.pingCheck('mongo', { timeout: 1000 }) as Promise<HealthIndicatorResult>,
    ]);
  }

  @Get('live')
  live() {
    return { status: 'ok', uptime: Math.floor((Date.now() - this.startedAt) / 1000) };
  }
}
