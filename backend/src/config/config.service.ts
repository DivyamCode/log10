import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsString, Max, Min, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Local = 'local',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  @Min(0)
  @Max(65535)
  PORT: number;

  @IsString()
  @IsNotEmpty()
  GOAL_INVESTMENT_SUCCESS_PAYMENT_QUEUE_NAME: string;

  @IsString()
  @IsNotEmpty()
  GOAL_INVESTMENT_WITHDRAWAL_QUEUE_NAME: string;

  @IsString()
  @IsNotEmpty()
  AUGMONT_REVERSE_REFUND_QUEUE_NAME: string;

  @IsString()
  @IsNotEmpty()
  ASSET_METAL_PURCHASE_QUEUE_NAME: string;

  @IsString()
  @IsNotEmpty()
  SERVICE_NAME: string;

  @IsString()
  @IsNotEmpty()
  QUEUE_HOST: string;

  @IsString()
  @IsNotEmpty()
  QUEUE_V_HOST: string;

  @IsString()
  @IsNotEmpty()
  QUEUE_USERNAME: string;

  @IsNumber()
  @IsNotEmpty()
  QUEUE_PORT: number;

  @IsString()
  @IsNotEmpty()
  QUEUE_PWD: string;

  @IsString()
  @IsNotEmpty()
  NOTIFICATION_EXCHANGE_NAME: string;

  @IsString()
  @IsNotEmpty()
  NOTIFICATION_ROUTING_KEY: string;

  @IsString()
  @IsNotEmpty()
  FIREBASE_CONFIG_JSON: string;

  @IsString()
  @IsNotEmpty()
  FIREBASE_REALTIME_DB: string;

  @IsString()
  @IsNotEmpty()
  MONGO_URL: string;

  @IsString()
  @IsNotEmpty()
  PHONEPE_SALT: string;

  @IsString()
  @IsNotEmpty()
  PHONEPE_SALT_INDEX: string;

  @IsString()
  @IsNotEmpty()
  PHONEPE_SUBSCRIPTION_HOST: string;

  @IsString()
  @IsNotEmpty()
  PHONEPE_LUMPSUM_HOST: string;

  @IsString()
  @IsNotEmpty()
  PHONEPE_MERCHANT_ID: string;

  @IsString()
  @IsNotEmpty()
  PHONEPE_WEBHOOK_URL: string;

  @IsString()
  @IsNotEmpty()
  AUGMONT_HOST: string;

  @IsString()
  @IsNotEmpty()
  S3_ACCESS_KEY: string;

  @IsString()
  @IsNotEmpty()
  S3_SECRET_KEY: string;

  @IsString()
  @IsNotEmpty()
  S3_BUCKET_NAME: string;

  @IsString()
  @IsNotEmpty()
  S3_REGION: string;

  @IsString()
  @IsNotEmpty()
  CLOUDFRONT_URL: string;

  @IsString()
  @IsNotEmpty()
  CLOUDFRONT_ACCESS_KEY: string;

  @IsString()
  @IsNotEmpty()
  CLOUDFRONT_ACCESS_PRIVATE_KEY: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  DECENTRO_CLIENT_ID: string;

  @IsString()
  @IsNotEmpty()
  DECENTRO_CLIENT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  DECENTRO_MODULE_SECRET: string;

  @IsString()
  @IsNotEmpty()
  DECENTRO_PROVIDER_SECRET: string;

  @IsString()
  @IsNotEmpty()
  DECENTRO_MVA: string;

  @IsString()
  @IsNotEmpty()
  DECENTRO_BANK_CODE: string;

  @IsString()
  @IsNotEmpty()
  DECENTRO_HOST: string;

  @IsString()
  @IsNotEmpty()
  ENABLE_CRON: string;

  @IsInt()
  @IsNotEmpty()
  AUGMONT_RECENT_TRANSACTION_DAYS_FOR_REVIEW: number;

  @IsString()
  @IsNotEmpty()
  X_API_KEY: string;

  @IsString()
  @IsNotEmpty()
  CASHFREE_HOST: string;

  @IsString()
  @IsNotEmpty()
  CASHFREE_CLIENT_ID: string;

  @IsString()
  @IsNotEmpty()
  CASHFREE_PAYMENT_GATEWAY_SECRET_KEY: string;

  @IsString()
  @IsNotEmpty()
  CASHFREE_PAYMENT_GATEWAY_ID: string;

  @IsString()
  @IsNotEmpty()
  CASHFREE_DIGILOCKER_REDIRECT_URL: string;

  @IsString()
  @IsNotEmpty()
  CASHFREE_SECRET: string;

  @IsString()
  @IsNotEmpty()
  GOLD_SERVICE_HOST: string;

  @IsString()
  @IsNotEmpty()
  GOLD_SERVICE_API_KEY: string;

  @IsString()
  @IsNotEmpty()
  WHATSAPP_NOTIFICATION_QUEUE: string;

  @IsString()
  @IsNotEmpty()
  OTP_VERIFICATION_QUEUE: string;

  @IsString()
  @IsNotEmpty()
  JOINING_BONUS_50: string;

  @IsString()
  @IsNotEmpty()
  REDIS_URL: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  Object.assign(process.env, { ...validatedConfig });
  return validatedConfig;
}

export interface DatabaseConfig {
  uri: string;
  name: string;
  options: {
    maxPoolSize: number;
    serverSelectionTimeoutMS: number;
    socketTimeoutMS: number;
    bufferMaxEntries: number;
    bufferCommands: boolean;
  };
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  keyPrefix: string;
}

export interface CacheConfig {
  ttl: number;
  max: number;
}

export interface ThrottleConfig {
  ttl: number;
  limit: number;
}

export interface LoggingConfig {
  level: string;
  maxFiles: string;
  maxSize: string;
  dirname: string;
  filename: string;
}

export interface LoggerConfig {
  level: string;
  maxFiles: string;
  maxSize: string;
  dirname: string;
  filename: string;
}

export interface SecurityConfig {
  corsOrigins: string[];
  apiKeys: string[];
}

export interface MonitoringConfig {
  healthCheckTimeout: number;
  memoryThreshold: number;
  diskThreshold: number;
}

export interface QueueConfig {
  amqp: {
    url: string;
    queueName: string;
    exchangeName: string;
    routingKey: string;
  };
}

export interface AppConfig {
  port: number;
  environment: string;
  database: DatabaseConfig;
  redis: RedisConfig;
  cache: CacheConfig;
  queue: QueueConfig;
  security: SecurityConfig;
  logger: LoggerConfig;
  throttle: { ttl: number; limit: number };
  logging: LoggingConfig;
  monitoring: MonitoringConfig;
}

@Injectable()
export class ConfigService {
  private readonly config: AppConfig;

  constructor(private nestConfigService: NestConfigService) {
    this.config = this.validateConfig();
  }

  private validateConfig(): AppConfig {
    // Validate environment variables using class-validator
    const validatedEnv = validate(process.env);

    return {
      port: validatedEnv.PORT || 3000,
      environment: validatedEnv.NODE_ENV || 'development',
      database: {
        uri: validatedEnv.MONGO_URL,
        name: 'log10_chrome_extension', // Default value
        options: {
          maxPoolSize: 10, // Default value
          serverSelectionTimeoutMS: 5000, // Default value
          socketTimeoutMS: 45000, // Default value
          bufferMaxEntries: 0, // Default value
          bufferCommands: false, // Default value
        },
      },
      redis: {
        host: 'localhost', // Default value
        port: 6379, // Default value
        password: undefined, // Default value
        db: 0, // Default value
        keyPrefix: 'log10:', // Default value
      },
      cache: {
        ttl: 300, // Default value
        max: 100, // Default value
      },
      queue: {
        amqp: {
          url: `amqp://${validatedEnv.QUEUE_USERNAME}:${validatedEnv.QUEUE_PWD}@${validatedEnv.QUEUE_HOST}:${validatedEnv.QUEUE_PORT}/${validatedEnv.QUEUE_V_HOST}`,
          queueName: validatedEnv.GOAL_INVESTMENT_SUCCESS_PAYMENT_QUEUE_NAME,
          exchangeName: validatedEnv.NOTIFICATION_EXCHANGE_NAME,
          routingKey: validatedEnv.NOTIFICATION_ROUTING_KEY,
        },
      },
      throttle: {
        ttl: 60, // Default value
        limit: 100, // Default value
      },
      logging: {
        level: 'info', // Default value
        maxFiles: '14d', // Default value
        maxSize: '20m', // Default value
        dirname: './logs', // Default value
        filename: 'application-%DATE%.log', // Default value
      },
      security: {
        corsOrigins: ['*'], // Default value
        apiKeys: [validatedEnv.X_API_KEY],
      },
      monitoring: {
        healthCheckTimeout: 5000, // Default value
        memoryThreshold: 150 * 1024 * 1024, // 150MB Default value
        diskThreshold: 1024 * 1024 * 1024, // 1GB Default value
      },
      logger: {
        level: 'info', // Default value
        maxFiles: '14d', // Default value
        maxSize: '20m', // Default value
        dirname: './logs', // Default value
        filename: 'application-%DATE%.log', // Default value
      },
    };
  }

  get port(): number {
    return this.config.port;
  }

  get environment(): string {
    return this.config.environment;
  }

  get database(): DatabaseConfig {
    return this.config.database;
  }

  get redis(): RedisConfig {
    return this.config.redis;
  }

  get cache(): CacheConfig {
    return this.config.cache;
  }

  get queue(): QueueConfig {
    return this.config.queue;
  }

  get throttle(): { ttl: number; limit: number } {
    return this.config.throttle;
  }

  get logging(): LoggingConfig {
    return this.config.logging;
  }

  get logger(): LoggerConfig {
    return this.config.logger;
  }

  get security(): SecurityConfig {
    return this.config.security;
  }

  get monitoring(): MonitoringConfig {
    return this.config.monitoring;
  }

  get isDevelopment(): boolean {
    return this.config.environment === 'development';
  }

  get isProduction(): boolean {
    return this.config.environment === 'production';
  }

  get isTest(): boolean {
    return this.config.environment === 'test';
  }
} 