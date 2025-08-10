import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

import { SessionsService } from './sessions.service';
import { SessionEntity } from './entities/session.entity';
import { ApiKeyGuard } from '../../auth/guards/api-key.guard';

@ApiTags('sessions')
@Controller('sessions')
@UseGuards(ThrottlerGuard, ApiKeyGuard)
@ApiBearerAuth()
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all active sessions',
    description: 'Returns all active browser sessions',
  })
  @ApiResponse({
    status: 200,
    description: 'Sessions retrieved successfully',
    type: [SessionEntity],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid API key',
  })
  async getActiveSessions(): Promise<SessionEntity[]> {
    return this.sessionsService.getActiveSessions();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get session by ID',
    description: 'Returns a specific session by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Session ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Session retrieved successfully',
    type: SessionEntity,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid API key',
  })
  @ApiResponse({
    status: 404,
    description: 'Session not found',
  })
  async getSessionById(@Param('id', ParseUUIDPipe) id: string): Promise<SessionEntity> {
    return this.sessionsService.getSessionById(id);
  }
} 