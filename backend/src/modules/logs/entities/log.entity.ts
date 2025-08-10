import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum LogLevel {
  LOG = 'log',
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

export type LogDocument = LogEntity & Document;

@Schema({
  timestamps: true,
  collection: 'logs',
})
export class LogEntity {
  @Prop({ required: true, enum: LogLevel, default: LogLevel.LOG })
  level: LogLevel;

  @Prop({ required: true, type: String })
  message: string;

  @Prop({ required: true, type: Date, default: Date.now })
  timestamp: Date;

  @Prop({ required: true, type: String, index: true })
  sessionId: string;

  @Prop({ required: true, type: String, index: true })
  pageUrl: string;

  @Prop({ type: String })
  pageTitle?: string;

  @Prop({ type: String })
  userAgent?: string;

  @Prop({ type: String })
  referrer?: string;

  @Prop({ type: String })
  stackTrace?: string;

  @Prop({ required: true, type: String, maxlength: 10 })
  logLevel: string;

  @Prop({ required: true, type: String, maxlength: 100, index: true })
  extensionId: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  browserInfo?: Record<string, any>;

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata?: Record<string, any>;

  @Prop({ type: Boolean, default: false })
  isProcessed: boolean;

  @Prop({ type: Number, default: 0 })
  processingAttempts: number;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const LogSchema = SchemaFactory.createForClass(LogEntity);

// Create compound indexes
LogSchema.index({ sessionId: 1, createdAt: -1 });
LogSchema.index({ level: 1, createdAt: -1 });
LogSchema.index({ pageUrl: 1 });
LogSchema.index({ extensionId: 1 }); 