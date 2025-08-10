import { Injectable, Logger, NotFoundException, Inject } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { SessionsRepository } from './repositories/sessions.repository';
import { SessionEntity } from './entities/session.entity';

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name);

  constructor(
    private readonly sessionsRepository: SessionsRepository,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async getActiveSessions(): Promise<SessionEntity[]> {
    try {
      // Try to get from cache first
      const cacheKey = 'sessions:active';
      const cached = await this.cacheManager.get<SessionEntity[]>(cacheKey);
      if (cached) {
        this.logger.debug('Active sessions retrieved from cache');
        return cached;
      }

      // Get from database
      const sessions = await this.sessionsRepository.findActiveSessions();
      
      // Cache the response
      await this.cacheManager.set(cacheKey, sessions, 300); // 5 minutes

      this.logger.log(`Retrieved ${sessions.length} active sessions`);
      return sessions;
    } catch (error) {
      this.logger.error(`Failed to retrieve active sessions: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getSessionById(id: string): Promise<SessionEntity> {
    try {
      // Try to get from cache first
      const cacheKey = `session:${id}`;
      const cached = await this.cacheManager.get<SessionEntity>(cacheKey);
      if (cached) {
        this.logger.debug(`Session retrieved from cache: ${id}`);
        return cached;
      }

      // Get from database
      const session = await this.sessionsRepository.findById(id);
      
      if (!session) {
        throw new NotFoundException(`Session not found: ${id}`);
      }

      // Cache the response
      await this.cacheManager.set(cacheKey, session, 300); // 5 minutes

      this.logger.log(`Retrieved session: ${id}`);
      return session;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to retrieve session: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateSessionActivity(sessionId: string): Promise<void> {
    try {
      await this.sessionsRepository.updateLastActivity(sessionId);
      
      // Clear cache for this session
      await this.cacheManager.del(`session:${sessionId}`);
      await this.cacheManager.del('sessions:active');
      
      this.logger.debug(`Updated session activity: ${sessionId}`);
    } catch (error) {
      this.logger.error(`Failed to update session activity: ${error.message}`, error.stack);
      throw error;
    }
  }

  async deactivateSession(sessionId: string): Promise<void> {
    try {
      await this.sessionsRepository.deactivateSession(sessionId);
      
      // Clear cache
      await this.cacheManager.del(`session:${sessionId}`);
      await this.cacheManager.del('sessions:active');
      
      this.logger.log(`Deactivated session: ${sessionId}`);
    } catch (error) {
      this.logger.error(`Failed to deactivate session: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getSessionStats(): Promise<{
    totalSessions: number;
    activeSessions: number;
    averageSessionDuration: number;
    sessionsByExtension: Record<string, number>;
  }> {
    try {
      const cacheKey = 'stats:sessions';
      const cached = await this.cacheManager.get<{
        total: number;
        active: number;
        inactive: number;
        byExtension: Record<string, number>;
      }>(cacheKey);
      if (cached) {
        return {
          totalSessions: cached.total,
          activeSessions: cached.active,
          averageSessionDuration: 0, // TODO: Calculate this
          sessionsByExtension: cached.byExtension,
        };
      }

      const stats = await this.sessionsRepository.getSessionStats();
      
      // Cache the stats
      await this.cacheManager.set(cacheKey, stats, 300); // 5 minutes

      return {
        totalSessions: stats.total,
        activeSessions: stats.active,
        averageSessionDuration: 0, // TODO: Calculate this
        sessionsByExtension: stats.byExtension,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve session stats: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getSessionsWithPagination(
    page: number = 1,
    limit: number = 10,
    filters?: Partial<{ extensionId: string; pageUrl: string; isActive: boolean }>,
  ): Promise<{ sessions: SessionEntity[]; total: number; page: number; totalPages: number }> {
    try {
      const cacheKey = `sessions:pagination:${page}:${limit}:${JSON.stringify(filters)}`;
      const cached = await this.cacheManager.get<{
        sessions: SessionEntity[];
        total: number;
        page: number;
        totalPages: number;
      }>(cacheKey);
      if (cached) {
        return cached;
      }

      const result = await this.sessionsRepository.getSessionsWithPagination(page, limit, filters);
      
      // Cache the result
      await this.cacheManager.set(cacheKey, result, 60); // 1 minute

      return result;
    } catch (error) {
      this.logger.error(`Failed to retrieve sessions with pagination: ${error.message}`, error.stack);
      throw error;
    }
  }
} 