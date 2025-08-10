import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type SessionDocument = SessionEntity & Document;

@Schema({
  timestamps: true,
  collection: 'sessions',
})
export class SessionEntity {
  @Prop({ required: true, type: String, maxlength: 100, unique: true, index: true })
  sessionId: string;

  @Prop({ required: true, type: String, maxlength: 100, index: true })
  extensionId: string;

  @Prop({ required: true, type: String, index: true })
  pageUrl: string;

  @Prop({ type: String })
  pageTitle?: string;

  @Prop({ type: String })
  userAgent?: string;

  @Prop({ type: String })
  referrer?: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  browserInfo?: Record<string, any>;

  @Prop({ type: Boolean, default: true, index: true })
  isActive: boolean;

  @Prop({ type: Date, default: Date.now })
  lastActivity: Date;

  @Prop({ type: Number, default: 0 })
  totalLogs: number;

  @Prop({ type: Number, default: 0 })
  errorCount: number;

  @Prop({ type: Number, default: 0 })
  warningCount: number;

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata?: Record<string, any>;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const SessionSchema = SchemaFactory.createForClass(SessionEntity);

// Create compound indexes
SessionSchema.index({ extensionId: 1, createdAt: -1 });
SessionSchema.index({ pageUrl: 1, createdAt: -1 });
SessionSchema.index({ isActive: 1 }); 