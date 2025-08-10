import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '../config/config.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly validApiKeys: Set<string>;

  constructor(private readonly configService: ConfigService) {
    // Get API keys from environment variables
    const apiKeys = this.configService.security.apiKeys;
    this.validApiKeys = new Set(apiKeys);

    this.logger.log(`Initialized with ${this.validApiKeys.size} valid API keys`);
  }

  validateApiKey(apiKey: string): boolean {
    if (!apiKey) {
      this.logger.warn('No API key provided');
      return false;
    }

    const isValid = this.validApiKeys.has(apiKey);
    
    if (!isValid) {
      this.logger.warn(`Invalid API key provided: ${apiKey.substring(0, 8)}...`);
    } else {
      this.logger.debug(`Valid API key used: ${apiKey.substring(0, 8)}...`);
    }

    return isValid;
  }

  async validateRequest(headers: Record<string, string>): Promise<boolean> {
    const apiKey = headers['x-api-key'] || headers['authorization']?.replace('Bearer ', '');
    
    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    if (!this.validateApiKey(apiKey)) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }

  getValidApiKeyCount(): number {
    return this.validApiKeys.size;
  }

  isApiKeyRequired(): boolean {
    return this.validApiKeys.size > 0;
  }

  // Method to add API key dynamically (useful for testing or runtime management)
  addApiKey(apiKey: string): void {
    if (apiKey && apiKey.length >= 16) {
      this.validApiKeys.add(apiKey);
      this.logger.log(`Added new API key: ${apiKey.substring(0, 8)}...`);
    } else {
      this.logger.warn('Attempted to add invalid API key');
    }
  }

  // Method to remove API key
  removeApiKey(apiKey: string): boolean {
    const removed = this.validApiKeys.delete(apiKey);
    if (removed) {
      this.logger.log(`Removed API key: ${apiKey.substring(0, 8)}...`);
    }
    return removed;
  }

  // Method to list all API keys (for admin purposes, should be secured)
  listApiKeys(): string[] {
    return Array.from(this.validApiKeys).map(key => 
      `${key.substring(0, 8)}...${key.substring(key.length - 4)}`
    );
  }
} 