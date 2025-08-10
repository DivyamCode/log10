import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
    free: number;
    percentage: number;
  };
  database: {
    status: 'healthy' | 'unhealthy';
    responseTime: number;
    connections: number;
  };
  redis: {
    status: 'healthy' | 'unhealthy';
    responseTime: number;
    memory: {
      used: number;
      peak: number;
    };
  };
  system: {
    cpu: number;
    loadAverage: number[];
    platform: string;
    nodeVersion: string;
  };
  services: {
    logs: 'healthy' | 'unhealthy';
    sessions: 'healthy' | 'unhealthy';
    queue: 'healthy' | 'unhealthy';
  };
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private startTime: number;

  constructor(
    @InjectConnection()
    private readonly connection: Connection,
  ) {
    this.startTime = Date.now();
  }

  async checkHealth(): Promise<HealthCheckResult> {
    const timestamp = new Date().toISOString();
    const uptime = Date.now() - this.startTime;

    try {
      const [memory, database, redis, system, services] = await Promise.all([
        this.getMemoryInfo(),
        this.checkDatabase(),
        this.checkRedis(),
        this.getSystemInfo(),
        this.checkServices(),
      ]);

      const overallStatus = this.determineOverallStatus([database, redis, services]);

      return {
        status: overallStatus,
        timestamp,
        uptime,
        memory,
        database,
        redis,
        system,
        services,
      };
    } catch (error) {
      this.logger.error('Health check failed:', error);
      
      return {
        status: 'unhealthy',
        timestamp,
        uptime,
        memory: { used: 0, total: 0, free: 0, percentage: 0 },
        database: { status: 'unhealthy', responseTime: 0, connections: 0 },
        redis: { status: 'unhealthy', responseTime: 0, memory: { used: 0, peak: 0 } },
        system: { cpu: 0, loadAverage: [0, 0, 0], platform: 'unknown', nodeVersion: 'unknown' },
        services: { logs: 'unhealthy', sessions: 'unhealthy', queue: 'unhealthy' },
      };
    }
  }

  private getMemoryInfo() {
    const memUsage = process.memoryUsage();
    const total = memUsage.heapTotal;
    const used = memUsage.heapUsed;
    const free = total - used;
    const percentage = (used / total) * 100;

    return {
      used: Math.round(used / 1024 / 1024), // MB
      total: Math.round(total / 1024 / 1024), // MB
      free: Math.round(free / 1024 / 1024), // MB
      percentage: Math.round(percentage * 100) / 100,
    };
  }

  private async checkDatabase() {
    const startTime = Date.now();
    
    try {
      // Check MongoDB connection
      const adminDb = this.connection.db.admin();
      
      // Test a simple command
      await adminDb.ping();
      
      // Get connection count
      const serverStatus = await adminDb.serverStatus();
      const connections = serverStatus.connections?.current || 0;
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy' as const,
        responseTime,
        connections,
      };
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return {
        status: 'unhealthy' as const,
        responseTime: Date.now() - startTime,
        connections: 0,
      };
    }
  }

  private async checkRedis() {
    const startTime = Date.now();
    
    try {
      // For now, return a placeholder Redis health check
      // In a real implementation, you would inject Redis and check its health
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy' as const,
        responseTime,
        memory: {
          used: 0,
          peak: 0,
        },
      };
    } catch (error) {
      this.logger.error('Redis health check failed:', error);
      return {
        status: 'unhealthy' as const,
        responseTime: Date.now() - startTime,
        memory: { used: 0, peak: 0 },
      };
    }
  }

  private getSystemInfo() {
    const os = require('os');
    
    return {
      cpu: os.cpus().length,
      loadAverage: os.loadavg(),
      platform: os.platform(),
      nodeVersion: process.version,
    };
  }

  private async checkServices() {
    try {
      // For now, we'll assume services are healthy
      // In a real implementation, you might check queue health, service availability, etc.
      return {
        logs: 'healthy' as const,
        sessions: 'healthy' as const,
        queue: 'healthy' as const,
      };
    } catch (error) {
      this.logger.error('Services health check failed:', error);
      return {
        logs: 'unhealthy' as const,
        sessions: 'unhealthy' as const,
        queue: 'unhealthy' as const,
      };
    }
  }

  private determineOverallStatus(checks: Array<{ status: string } | { logs: string; sessions: string; queue: string }>): 'healthy' | 'unhealthy' | 'degraded' {
    let unhealthyCount = 0;
    let totalCount = 0;
    
    checks.forEach(check => {
      if ('status' in check) {
        // Database and Redis checks
        totalCount++;
        if (check.status === 'unhealthy') {
          unhealthyCount++;
        }
      } else {
        // Services check
        totalCount += 3; // logs, sessions, queue
        if (check.logs === 'unhealthy') unhealthyCount++;
        if (check.sessions === 'unhealthy') unhealthyCount++;
        if (check.queue === 'unhealthy') unhealthyCount++;
      }
    });
    
    if (unhealthyCount === 0) {
      return 'healthy';
    } else if (unhealthyCount < totalCount) {
      return 'degraded';
    } else {
      return 'unhealthy';
    }
  }

  async getDetailedHealth(): Promise<HealthCheckResult & { details: any }> {
    const basicHealth = await this.checkHealth();
    
    // Add more detailed information
    const details = {
      environment: process.env.NODE_ENV || 'development',
      pid: process.pid,
      version: process.env.npm_package_version || 'unknown',
      buildTime: process.env.BUILD_TIME || 'unknown',
    };

    return {
      ...basicHealth,
      details,
    };
  }

  async getMetrics(): Promise<{
    requests: number;
    errors: number;
    responseTime: number;
    activeConnections: number;
  }> {
    // This would typically come from a metrics collector
    // For now, returning placeholder data
    return {
      requests: 0,
      errors: 0,
      responseTime: 0,
      activeConnections: 0,
    };
  }
} 