import { Injectable, OnModuleInit } from '@nestjs/common';
import { LogsService } from '../logs.service';
import { CreateLogDto } from '../dto';
import { LogEntity } from '../entities/log.entity';
import { AmqpService } from '../services/amqp.service';
import { ConfigService } from '../../../config/config.service';

@Injectable()
export class LogsProcessor implements OnModuleInit {
  constructor(
    private readonly logsService: LogsService,
    private readonly amqpService: AmqpService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    // Start consuming messages from the queue
    await this.amqpService.consumeMessages(
      this.configService.queue.amqp.queueName,
      this.handleMessage.bind(this)
    );
  }

  private async handleMessage(message: any): Promise<void> {
    try {
      const { type, data } = JSON.parse(message.content.toString());

      switch (type) {
        case 'CREATE_LOG':
          await this.handleProcessLog(data);
          break;
        case 'CREATE_MANY_LOGS':
          await this.handleProcessBatch(data);
          break;
        case 'CLEANUP_OLD_LOGS':
          await this.handleCleanupOldLogs(data.daysOld);
          break;
        case 'EXPORT_LOGS':
          await this.handleExportLogs(data);
          break;
        default:
          console.warn(`Unknown message type: ${type}`);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      throw error;
    }
  }

  private async handleProcessLog(createLogDto: CreateLogDto): Promise<void> {
    try {
      await this.logsService.createLogSync(createLogDto);
      console.log(`Log processed successfully: ${createLogDto.message?.substring(0, 100)}...`);
    } catch (error) {
      console.error('Error processing single log:', error);
      throw error;
    }
  }

  private async handleProcessBatch(createLogDtos: CreateLogDto[]): Promise<void> {
    try {
      for (const createLogDto of createLogDtos) {
        await this.logsService.createLogSync(createLogDto);
      }
      console.log(`Batch of ${createLogDtos.length} logs processed successfully`);
    } catch (error) {
      console.error('Error processing batch logs:', error);
      throw error;
    }
  }

  private async handleCleanupOldLogs(daysOld: number): Promise<void> {
    try {
      // This would call the actual cleanup logic
      // For now, we'll just log it
      console.log(`Cleanup old logs job received for logs older than ${daysOld} days`);
      // await this.logsService.cleanupOldLogs(daysOld);
    } catch (error) {
      console.error('Error handling cleanup old logs:', error);
      throw error;
    }
  }

  private async handleExportLogs(data: { sessionId?: string; startDate?: Date; endDate?: Date }): Promise<void> {
    try {
      const { sessionId, startDate, endDate } = data;
      console.log(`Export logs job received for session: ${sessionId}, start: ${startDate}, end: ${endDate}`);
      
      let logs: LogEntity[] = [];
      if (sessionId) {
        logs = await this.logsService.getSessionLogs(sessionId);
      } else if (startDate && endDate) {
        logs = await this.logsService.findLogsByTimeRange(startDate, endDate);
      } else {
        logs = await this.logsService.findAll();
      }
      
      console.log(`Export completed: ${logs.length} logs exported`);
      // Here you would typically save to file, send to external service, etc.
    } catch (error) {
      console.error('Error handling export logs:', error);
      throw error;
    }
  }
} 