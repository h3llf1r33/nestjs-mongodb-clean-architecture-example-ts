import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Collection, Db, MongoClient } from 'mongodb';

@Injectable()
export class MongoDBService {
  private client: MongoClient;
  private db: Db;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const uri = this.configService.get<string>('mongodb.uri');
    if (!uri) {
      throw new Error('MongoDB URI is not defined');
    }

    this.client = new MongoClient(uri);
    await this.client.connect();
    this.db = this.client.db();
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.close();
    }
  }

  getCollection(name: string): Collection {
    if (!this.db) {
      throw new Error('Database connection not established');
    }
    return this.db.collection(name);
  }
}
