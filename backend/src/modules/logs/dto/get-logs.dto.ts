import { IsOptional, IsEnum, IsString, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { LogLevel } from '../entities/log.entity';

export class GetLogsDto {
  @ApiPropertyOptional({
    description: 'Number of logs to return (max 1000)',
    example: 100,
    minimum: 1,
    maximum: 1000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(1000)
  limit?: number = 100;

  @ApiPropertyOptional({
    description: 'Filter by log level',
    enum: LogLevel,
    example: 'error',
  })
  @IsOptional()
  @IsEnum(LogLevel)
  level?: LogLevel;

  @ApiPropertyOptional({
    description: 'Filter by session ID',
    example: 'session_1705312200000_abc123def',
  })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiPropertyOptional({
    description: 'Filter by page URL (partial match)',
    example: 'localhost:3000',
  })
  @IsOptional()
  @IsString()
  pageUrl?: string;

  @ApiPropertyOptional({
    description: 'Filter by extension ID',
    example: 'extension_id_here',
  })
  @IsOptional()
  @IsString()
  extensionId?: string;
} 