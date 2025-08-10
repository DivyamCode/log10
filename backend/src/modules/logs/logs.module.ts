import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';
import { LogsRepository } from './repositories/logs.repository';
import { LogsProcessor } from './processors/logs.processor';
import { LogEntity, LogEntitySchema } from './entities/log.entity';
import { CreateLogDto } from './dto';
import { ConfigService } from '../../config/config.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LogEntity.name, schema: LogEntitySchema },
    ]),
    CacheModule.register(),
  ],
  controllers: [LogsController],
  providers: [
    LogsService,
    LogsRepository,
    LogsProcessor,
    CreateLogDto,
    ConfigService,
  ],
  exports: [LogsService, LogsRepository],
})
export class LogsModule {} 