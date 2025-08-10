import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '../../../config/config.service';
import * as amqp from 'amqplib';
import { Connection, Channel, Message } from 'amqplib';

@Injectable()
export class AmqpService implements OnModuleInit, OnModuleDestroy {
  private connection: Connection;
  private channel: Channel;
  private readonly config: ConfigService;

  constructor(configService: ConfigService) {
    this.config = configService;
  }

  async onModuleInit() {
    await this.connect();
    await this.setupQueue();
  }

  async onModuleDestroy() {
    await this.closeConnection();
  }

  private async connect() {
    try {
      this.connection = await amqp.connect(this.config.queue.amqp.url);
      this.channel = await this.connection.createChannel();
      
      this.connection.on('error', (error) => {
        console.error('AMQP connection error:', error);
      });

      this.connection.on('close', () => {
        console.log('AMQP connection closed');
      });

      console.log('AMQP connected successfully');
    } catch (error) {
      console.error('Failed to connect to AMQP:', error);
      throw error;
    }
  }

  private async setupQueue() {
    try {
      const { exchangeName, queueName, routingKey } = this.config.queue.amqp;

      // Create exchange
      await this.channel.assertExchange(exchangeName, 'direct', { durable: true });

      // Create queue
      await this.channel.assertQueue(queueName, { durable: true });

      // Bind queue to exchange
      await this.channel.bindQueue(queueName, exchangeName, routingKey);

      console.log(`AMQP queue setup complete: ${queueName}`);
    } catch (error) {
      console.error('Failed to setup AMQP queue:', error);
      throw error;
    }
  }

  async publishMessage(message: any, routingKey?: string) {
    try {
      const { exchangeName, routingKey: defaultRoutingKey } = this.config.queue.amqp;
      const key = routingKey || defaultRoutingKey;
      
      const messageBuffer = Buffer.from(JSON.stringify(message));
      const result = this.channel.publish(exchangeName, key, messageBuffer, {
        persistent: true,
      });

      if (result) {
        console.log(`Message published to ${exchangeName} with routing key ${key}`);
      } else {
        console.warn('Message publish failed - channel write buffer is full');
      }

      return result;
    } catch (error) {
      console.error('Failed to publish message:', error);
      throw error;
    }
  }

  async consumeMessages(
    queueName: string,
    callback: (message: Message) => Promise<void>
  ) {
    try {
      await this.channel.consume(queueName, async (message) => {
        if (message) {
          try {
            await callback(message);
            this.channel.ack(message);
          } catch (error) {
            console.error('Error processing message:', error);
            // Reject the message and requeue it
            this.channel.nack(message, false, true);
          }
        }
      });

      console.log(`Started consuming messages from queue: ${queueName}`);
    } catch (error) {
      console.error('Failed to start consuming messages:', error);
      throw error;
    }
  }

  async closeConnection() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      console.log('AMQP connection closed');
    } catch (error) {
      console.error('Error closing AMQP connection:', error);
    }
  }

  isConnected(): boolean {
    return this.connection && this.connection.connection && this.connection.connection.writable;
  }
} 