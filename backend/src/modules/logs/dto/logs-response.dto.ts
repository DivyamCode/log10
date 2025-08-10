import { ApiProperty } from '@nestjs/swagger';
import { LogEntity } from '../entities/log.entity';

export class LogsResponseDto {
  @ApiProperty({
    description: 'Array of log entries',
    type: [LogEntity],
  })
  logs: LogEntity[];

  @ApiProperty({
    description: 'Total number of logs matching the criteria',
    example: 150,
  })
  total: number;

  @ApiProperty({
    description: 'Whether there are more logs available',
    example: true,
  })
  hasMore: boolean;

  @ApiProperty({
    description: 'Current page number (if pagination is used)',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of logs per page',
    example: 100,
  })
  limit: number;
} 