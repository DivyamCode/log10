import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';

import { LogsService } from './logs.service';
import { CreateLogDto } from './dto/create-log.dto';
import { GetLogsDto } from './dto/get-logs.dto';
import { LogsResponseDto } from './dto/logs-response.dto';
import { SessionLogsResponseDto } from './dto/session-logs-response.dto';
import { ApiKeyGuard } from '../../auth/guards/api-key.guard';

@ApiTags('logs')
@Controller('logs')
@UseGuards(ThrottlerGuard, ApiKeyGuard)
@ApiBearerAuth()
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Create a new log entry',
    description: 'Receives individual log entries from the Chrome extension',
  })
  @ApiBody({ type: CreateLogDto })
  @ApiResponse({
    status: 200,
    description: 'Log entry created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid log data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid API key',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests',
  })
  async createLog(@Body(ValidationPipe) createLogDto: CreateLogDto): Promise<{ message: string }> {
    await this.logsService.createLog(createLogDto);
    return { message: 'Log entry created successfully' };
  }

  @Get()
  @ApiOperation({
    summary: 'Get latest logs',
    description: 'Returns the latest logs with optional pagination and filtering',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of logs to return',
    type: Number,
  })
  @ApiQuery({
    name: 'level',
    required: false,
    description: 'Filter by log level',
    enum: ['log', 'error', 'warn', 'info', 'debug'],
  })
  @ApiQuery({
    name: 'sessionId',
    required: false,
    description: 'Filter by session ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Logs retrieved successfully',
    type: LogsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid API key',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests',
  })
  async getLogs(@Query() getLogsDto: GetLogsDto): Promise<LogsResponseDto> {
    return this.logsService.getLogs(getLogsDto);
  }

  @Get(':session')
  @ApiOperation({
    summary: 'Get logs for a specific session',
    description: 'Returns logs for a specific session with session metadata',
  })
  @ApiParam({
    name: 'session',
    description: 'Session ID to filter logs by',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Session logs retrieved successfully',
    type: SessionLogsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid API key',
  })
  @ApiResponse({
    status: 404,
    description: 'Session not found',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests',
  })
  async getSessionLogs(
    @Param('session', ParseUUIDPipe) sessionId: string,
  ): Promise<SessionLogsResponseDto> {
    return this.logsService.getSessionLogs(sessionId);
  }
} 