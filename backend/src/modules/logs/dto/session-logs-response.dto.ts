import { ApiProperty } from '@nestjs/swagger';
import { LogEntity } from '../entities/log.entity';

export class SessionLogsResponseDto {
  @ApiProperty({
    description: 'Session identifier',
    example: 'session_1705312200000_abc123def',
  })
  sessionId: string;

  @ApiProperty({
    description: 'Array of logs for this session',
    type: [LogEntity],
  })
  logs: LogEntity[];

  @ApiProperty({
    description: 'Total number of logs in this session',
    example: 25,
  })
  total: number;

  @ApiProperty({
    description: 'Session start time',
    example: '2024-01-15T10:30:00.000Z',
  })
  startTime: Date;

  @ApiProperty({
    description: 'Session end time (last log timestamp)',
    example: '2024-01-15T10:45:00.000Z',
  })
  endTime: Date;

  @ApiProperty({
    description: 'Session duration in milliseconds',
    example: 900000,
  })
  duration: number;

  @ApiProperty({
    description: 'Page URL where the session started',
    example: 'http://localhost:3000/dashboard',
  })
  startPageUrl: string;

  @ApiProperty({
    description: 'Page URL where the session ended',
    example: 'http://localhost:3000/api/users',
  })
  endPageUrl: string;
} 