import { IsEnum, IsString, IsOptional, IsDateString, IsUUID, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { LogLevel } from '../entities/log.entity';

export class CreateLogDto {
  @ApiProperty({
    description: 'Log level (log, error, warn, info, debug)',
    enum: LogLevel,
    example: 'error',
  })
  @IsEnum(LogLevel)
  level: LogLevel;

  @ApiProperty({
    description: 'Log message content',
    example: 'API request failed',
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Timestamp when the log was created',
    example: '2024-01-15T10:30:00.000Z',
  })
  @IsDateString()
  timestamp: string;

  @ApiProperty({
    description: 'Unique session identifier',
    example: 'session_1705312200000_abc123def',
  })
  @IsString()
  sessionId: string;

  @ApiProperty({
    description: 'URL of the page where the log was generated',
    example: 'http://localhost:3000/api/users',
  })
  @IsString()
  pageUrl: string;

  @ApiPropertyOptional({
    description: 'Title of the page',
    example: 'User Management',
  })
  @IsOptional()
  @IsString()
  pageTitle?: string;

  @ApiPropertyOptional({
    description: 'User agent string of the browser',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({
    description: 'Referrer URL',
    example: 'http://localhost:3000/dashboard',
  })
  @IsOptional()
  @IsString()
  referrer?: string;

  @ApiPropertyOptional({
    description: 'Error stack trace if applicable',
    example: 'Error: Request failed\n    at fetch (app.js:15:10)',
  })
  @IsOptional()
  @IsString()
  stackTrace?: string;

  @ApiProperty({
    description: 'Log level as string',
    example: 'error',
  })
  @IsString()
  logLevel: string;

  @ApiProperty({
    description: 'Chrome extension identifier',
    example: 'extension_id_here',
  })
  @IsString()
  extensionId: string;

  @ApiPropertyOptional({
    description: 'Additional browser information',
    example: { browser: 'Chrome', version: '120.0.0.0' },
  })
  @IsOptional()
  @IsObject()
  browserInfo?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Additional metadata for the log entry',
    example: { userId: '123', action: 'button_click' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
} 