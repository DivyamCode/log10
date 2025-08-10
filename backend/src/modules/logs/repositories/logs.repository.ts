import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LogEntity, LogDocument, LogLevel } from '../entities/log.entity';
import { CreateLogDto, UpdateLogDto, GetLogsDto } from './dto';

@Injectable()
export class LogsRepository {
  constructor(
    @InjectModel(LogEntity.name)
    private readonly logModel: Model<LogDocument>,
  ) {}

  async create(createLogDto: CreateLogDto): Promise<LogEntity> {
    const log = new this.logModel(createLogDto);
    const savedLog = await log.save();
    return savedLog.toObject();
  }

  async createMany(createLogDtos: CreateLogDto[]): Promise<LogEntity[]> {
    const logs = await this.logModel.insertMany(createLogDtos);
    return logs.map(log => log.toObject());
  }

  async findById(id: string): Promise<LogEntity | null> {
    const log = await this.logModel.findById(id).exec();
    return log ? log.toObject() : null;
  }

  async findBySessionId(sessionId: string): Promise<LogEntity[]> {
    const logs = await this.logModel.find({ sessionId }).sort({ createdAt: -1 }).exec();
    return logs.map(log => log.toObject());
  }

  async findByUserId(userId: string): Promise<LogEntity[]> {
    const logs = await this.logModel.find({ userId }).sort({ createdAt: -1 }).exec();
    return logs.map(log => log.toObject());
  }

  async findByLevel(level: LogLevel): Promise<LogEntity[]> {
    const logs = await this.logModel.find({ level }).sort({ createdAt: -1 }).exec();
    return logs.map(log => log.toObject());
  }

  async findBySource(source: string): Promise<LogEntity[]> {
    const logs = await this.logModel.find({ source }).sort({ createdAt: -1 }).exec();
    return logs.map(log => log.toObject());
  }

  async findLogsByTimeRange(startDate: Date, endDate: Date): Promise<LogEntity[]> {
    const logs = await this.logModel
      .find({
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .sort({ createdAt: -1 })
      .exec();
    return logs.map(log => log.toObject());
  }

  async findErrorLogs(): Promise<LogEntity[]> {
    const logs = await this.logModel
      .find({ level: LogLevel.ERROR })
      .sort({ createdAt: -1 })
      .exec();
    return logs.map(log => log.toObject());
  }

  async update(id: string, updateLogDto: UpdateLogDto): Promise<LogEntity | null> {
    const log = await this.logModel
      .findByIdAndUpdate(id, updateLogDto, { new: true })
      .exec();
    return log ? log.toObject() : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.logModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async deleteOldLogs(daysOld: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.logModel
      .deleteMany({ createdAt: { $lt: cutoffDate } })
      .exec();
    
    return result.deletedCount || 0;
  }

  async getLogsWithPagination(
    page: number = 1,
    limit: number = 10,
    filters?: Partial<GetLogsDto>,
  ): Promise<{ logs: LogEntity[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    
    const query = this.logModel.find();
    
    if (filters) {
      if (filters.level) query.where('level', filters.level);
      if (filters.sessionId) query.where('sessionId', filters.sessionId);
      if (filters.extensionId) query.where('extensionId', filters.extensionId);
      if (filters.pageUrl) query.where('pageUrl', new RegExp(filters.pageUrl, 'i'));
    }

    const [logs, total] = await Promise.all([
      query.skip(skip).limit(limit).sort({ createdAt: -1 }).exec(),
      this.logModel.countDocuments(filters || {}).exec(),
    ]);

    return {
      logs: logs.map(log => log.toObject()),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getLogStats(): Promise<{
    total: number;
    byLevel: Record<LogLevel, number>;
    byExtension: Record<string, number>;
    bySession: Record<string, number>;
  }> {
    const [total, byLevel, byExtension, bySession] = await Promise.all([
      this.logModel.countDocuments().exec(),
      this.logModel.aggregate([
        { $group: { _id: '$level', count: { $sum: 1 } } },
      ]).exec(),
      this.logModel.aggregate([
        { $group: { _id: '$extensionId', count: { $sum: 1 } } },
      ]).exec(),
      this.logModel.aggregate([
        { $group: { _id: '$sessionId', count: { $sum: 1 } } },
      ]).exec(),
    ]);

    const levelStats = byLevel.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {} as Record<LogLevel, number>);

    const extensionStats = byExtension.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {} as Record<string, number>);

    const sessionStats = bySession.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      byLevel: levelStats,
      byExtension: extensionStats,
      bySession: sessionStats,
    };
  }

  async getLogsForSession(sessionId: string): Promise<LogEntity[]> {
    const logs = await this.logModel
      .find({ sessionId })
      .sort({ createdAt: -1 })
      .exec();
    return logs.map(log => log.toObject());
  }

  async getLogsForUser(userId: string): Promise<LogEntity[]> {
    const logs = await this.logModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .exec();
    return logs.map(log => log.toObject());
  }

  async findLogs(filters: {
    limit?: number;
    level?: string;
    sessionId?: string;
    pageUrl?: string;
    extensionId?: string;
  }): Promise<[LogEntity[], number]> {
    const { limit = 100, level, sessionId, pageUrl, extensionId } = filters;
    
    const query = this.logModel.find();
    
    if (level) query.where('level', level);
    if (sessionId) query.where('sessionId', sessionId);
    if (pageUrl) query.where('pageUrl', new RegExp(pageUrl, 'i'));
    if (extensionId) query.where('extensionId', extensionId);

    const [logs, total] = await Promise.all([
      query.limit(limit).sort({ createdAt: -1 }).exec(),
      this.logModel.countDocuments(query.getQuery()).exec(),
    ]);

    return [logs.map(log => log.toObject()), total];
  }

  async findSessionLogs(sessionId: string): Promise<LogEntity[]> {
    const logs = await this.logModel
      .find({ sessionId })
      .sort({ timestamp: 1 })
      .exec();
    return logs.map(log => log.toObject());
  }
} 