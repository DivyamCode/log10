import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LogEntity, LogSchema } from '../modules/logs/entities/log.entity';
import { SessionEntity, SessionSchema } from '../modules/sessions/entities/session.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LogEntity.name, schema: LogSchema },
      { name: SessionEntity.name, schema: SessionSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {} 