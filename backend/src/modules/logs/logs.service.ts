import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { LogsRepository } from './repositories/logs.repository';
import { CreateLogDto, UpdateLogDto, GetLogsDto } from './dto';
import { LogEntity } from './entities/log.entity';
import { AmqpService } from './services/amqp.service';

@Injectable()
export class LogsService {
  constructor(
    private readonly logsRepository: LogsRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly amqpService: AmqpService,
  ) {}

  async createLog(createLogDto: CreateLogDto): Promise<LogEntity> {
    // Publish to AMQP queue for async processing
    await this.amqpService.publishMessage({
      type: 'CREATE_LOG',
      data: createLogDto,
    });

    // Return a temporary response
    return {
      _id: 'processing',
      ...createLogDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as LogEntity;
  }

  async createLogSync(createLogDto: CreateLogDto): Promise<LogEntity> {
    return this.logsRepository.create(createLogDto);
  }

  async createManyLogs(createLogDtos: CreateLogDto[]): Promise<LogEntity[]> {
    // Publish batch to AMQP queue
    await this.amqpService.publishMessage({
      type: 'CREATE_MANY_LOGS',
      data: createLogDtos,
    });

    // Return temporary responses
    return createLogDtos.map((dto, index) => ({
      _id: `processing-${index}`,
      ...dto,
      createdAt: new Date(),
      updatedAt: new Date(),
    })) as LogEntity[];
  }

  async findById(id: string): Promise<LogEntity | null> {
    const cached = await this.cacheManager.get<LogEntity>(`log:${id}`);
    if (cached) {
      return cached;
    }

    const log = await this.logsRepository.findById(id);
    if (log) {
      await this.cacheManager.set(`log:${id}`, log, 300000); // 5 minutes
    }

    return log;
  }

  async findBySessionId(sessionId: string): Promise<LogEntity[]> {
    const cached = await this.cacheManager.get<LogEntity[]>(`session-logs:${sessionId}`);
    if (cached) {
      return cached;
    }

    const logs = await this.logsRepository.findBySessionId(sessionId);
    await this.cacheManager.set(`session-logs:${sessionId}`, logs, 300000); // 5 minutes

    return logs;
  }

  async findByUserId(userId: string): Promise<LogEntity[]> {
    const cached = await this.cacheManager.get<LogEntity[]>(`user-logs:${userId}`);
    if (cached) {
      return cached;
    }

    const logs = await this.logsRepository.findByUserId(userId);
    await this.cacheManager.set(`user-logs:${userId}`, logs, 300000); // 5 minutes

    return logs;
  }

  async findByLevel(level: string): Promise<LogEntity[]> {
    return this.logsRepository.findByLevel(level);
  }

  async findBySource(source: string): Promise<LogEntity[]> {
    return this.logsRepository.findBySource(source);
  }

  async findLogsByTimeRange(startDate: Date, endDate: Date): Promise<LogEntity[]> {
    return this.logsRepository.findLogsByTimeRange(startDate, endDate);
  }

  async findErrorLogs(): Promise<LogEntity[]> {
    return this.logsRepository.findErrorLogs();
  }

  async update(id: string, updateLogDto: UpdateLogDto): Promise<LogEntity | null> {
    const updatedLog = await this.logsRepository.update(id, updateLogDto);
    
    if (updatedLog) {
      // Invalidate cache
      await this.cacheManager.del(`log:${id}`);
    }

    return updatedLog;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.logsRepository.delete(id);
    
    if (deleted) {
      // Invalidate cache
      await this.cacheManager.del(`log:${id}`);
    }

    return deleted;
  }

  async getLogsWithPagination(
    getLogsDto: GetLogsDto,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ logs: LogEntity[]; total: number; page: number; limit: number }> {
    return this.logsRepository.getLogsWithPagination(getLogsDto, page, limit);
  }

  async getLogs(getLogsDto: GetLogsDto): Promise<LogEntity[]> {
    return this.logsRepository.findLogs(getLogsDto);
  }

  async getSessionLogs(sessionId: string): Promise<LogEntity[]> {
    return this.logsRepository.findSessionLogs(sessionId);
  }

  async findAll(): Promise<LogEntity[]> {
    return this.logsRepository.findLogs({});
  }

  async getLogStats(): Promise<{ total: number; byLevel: Record<string, number>; bySource: Record<string, number> }> {
    const cached = await this.cacheManager.get<{ total: number; byLevel: Record<string, number>; bySource: Record<string, number> }>('log-stats');
    if (cached) {
      return cached;
    }

    const stats = await this.logsRepository.getLogStats();
    await this.cacheManager.set('log-stats', stats, 600000); // 10 minutes

    return stats;
  }

  async cleanupOldLogs(daysOld: number = 30): Promise<number> {
    // Publish cleanup job to AMQP queue
    await this.amqpService.publishMessage({
      type: 'CLEANUP_OLD_LOGS',
      data: { daysOld },
    });

    return 0; // Return 0 as actual cleanup will happen asynchronously
  }

  async exportLogs(sessionId?: string, startDate?: Date, endDate?: Date): Promise<LogEntity[]> {
    // Publish export job to AMQP queue
    await this.amqpService.publishMessage({
      type: 'EXPORT_LOGS',
      data: { sessionId, startDate, endDate },
    });

    return []; // Return empty array as export will happen asynchronously
  }
} 