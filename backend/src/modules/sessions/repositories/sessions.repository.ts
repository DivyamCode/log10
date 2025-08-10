import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SessionEntity, SessionDocument } from '../entities/session.entity';
import { CreateSessionDto, UpdateSessionDto } from '../dto';

@Injectable()
export class SessionsRepository {
  constructor(
    @InjectModel(SessionEntity.name)
    private readonly sessionModel: Model<SessionDocument>,
  ) {}

  async create(createSessionDto: CreateSessionDto): Promise<SessionEntity> {
    const session = new this.sessionModel(createSessionDto);
    return await session.save();
  }

  async findById(id: string): Promise<SessionEntity | null> {
    return await this.sessionModel.findById(id).exec();
  }

  async findByUserId(userId: string): Promise<SessionEntity[]> {
    return await this.sessionModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async findBySessionId(sessionId: string): Promise<SessionEntity | null> {
    return await this.sessionModel.findOne({ sessionId }).exec();
  }

  async findActiveSessions(): Promise<SessionEntity[]> {
    return await this.sessionModel
      .find({ isActive: true })
      .sort({ lastActivity: -1 })
      .exec();
  }

  async findExpiredSessions(expiryHours: number = 24): Promise<SessionEntity[]> {
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() - expiryHours);

    return await this.sessionModel
      .find({
        lastActivity: { $lt: expiryDate },
        isActive: true,
      })
      .exec();
  }

  async update(id: string, updateSessionDto: UpdateSessionDto): Promise<SessionEntity | null> {
    return await this.sessionModel
      .findByIdAndUpdate(id, updateSessionDto, { new: true })
      .exec();
  }

  async deactivate(id: string): Promise<boolean> {
    const result = await this.sessionModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();
    return !!result;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.sessionModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async getSessionsWithPagination(
    page: number = 1,
    limit: number = 10,
    filters?: Partial<{ extensionId: string; pageUrl: string; isActive: boolean }>,
  ): Promise<{ sessions: SessionEntity[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    
    const query = this.sessionModel.find();
    
    if (filters) {
      if (filters.extensionId) query.where('extensionId', filters.extensionId);
      if (filters.pageUrl) query.where('pageUrl', new RegExp(filters.pageUrl, 'i'));
      if (filters.isActive !== undefined) query.where('isActive', filters.isActive);
    }

    const [sessions, total] = await Promise.all([
      query.skip(skip).limit(limit).sort({ createdAt: -1 }).exec(),
      this.sessionModel.countDocuments(filters || {}).exec(),
    ]);

    return {
      sessions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getSessionStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byExtension: Record<string, number>;
  }> {
    const [total, active, inactive, byExtension] = await Promise.all([
      this.sessionModel.countDocuments().exec(),
      this.sessionModel.countDocuments({ isActive: true }).exec(),
      this.sessionModel.countDocuments({ isActive: false }).exec(),
      this.sessionModel.aggregate([
        { $group: { _id: '$extensionId', count: { $sum: 1 } } },
      ]).exec(),
    ]);

    const extensionStats = byExtension.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      active,
      inactive,
      byExtension: extensionStats,
    };
  }

  async cleanupOldSessions(daysOld: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.sessionModel
      .deleteMany({ createdAt: { $lt: cutoffDate } })
      .exec();
    
    return result.deletedCount || 0;
  }

  async updateLastActivity(sessionId: string): Promise<boolean> {
    const result = await this.sessionModel
      .findOneAndUpdate(
        { sessionId },
        { lastActivity: new Date() },
        { new: true }
      )
      .exec();
    return !!result;
  }

  async deactivateSession(sessionId: string): Promise<boolean> {
    const result = await this.sessionModel
      .findOneAndUpdate(
        { sessionId },
        { isActive: false },
        { new: true }
      )
      .exec();
    return !!result;
  }
} 