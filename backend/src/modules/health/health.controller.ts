import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({
    summary: 'Health check',
    description: 'Comprehensive health check for the application',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['healthy', 'unhealthy', 'degraded'] },
        timestamp: { type: 'string', format: 'date-time' },
        uptime: { type: 'number' },
        memory: { type: 'object' },
        database: { type: 'object' },
        redis: { type: 'object' },
        system: { type: 'object' },
        services: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Application is unhealthy',
  })
  async check() {
    return await this.healthService.checkHealth();
  }

  @Get('detailed')
  @ApiOperation({
    summary: 'Detailed health check',
    description: 'Detailed health check with additional system information',
  })
  @ApiResponse({
    status: 200,
    description: 'Detailed health information',
  })
  async getDetailedHealth() {
    return await this.healthService.getDetailedHealth();
  }

  @Get('metrics')
  @ApiOperation({
    summary: 'Application metrics',
    description: 'Get application performance metrics',
  })
  @ApiResponse({
    status: 200,
    description: 'Application metrics',
  })
  async getMetrics() {
    return await this.healthService.getMetrics();
  }

  @Get('ready')
  @ApiOperation({
    summary: 'Readiness check',
    description: 'Check if the application is ready to receive traffic',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is ready',
  })
  @ApiResponse({
    status: 503,
    description: 'Application is not ready',
  })
  async ready() {
    const health = await this.healthService.checkHealth();
    return {
      status: health.status === 'healthy' ? 'ready' : 'not_ready',
      timestamp: health.timestamp,
      checks: {
        database: health.database.status,
        redis: health.redis.status,
        services: health.services,
      },
    };
  }

  @Get('live')
  @ApiOperation({
    summary: 'Liveness check',
    description: 'Check if the application is alive',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is alive',
  })
  live() {
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
} 