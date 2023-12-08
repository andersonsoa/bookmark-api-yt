import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import * as schema from './schema';

@Injectable({})
export class DatabaseService implements OnModuleInit, OnApplicationShutdown {
  private _db: NodePgDatabase<typeof schema>;
  private _client: Client;

  private connectionObj = {
    host: '127.0.0.1',
    port: 5435,
    user: 'postgres',
    password: '123456',
    database: 'ponto-local',
  };

  constructor(private config: ConfigService) {}

  get db() {
    return this._db;
  }

  async onModuleInit() {
    const connectionString = this.config.get('DATABASE_URL');
    this._client = new Client(connectionString);
    await this._client.connect();
    this._db = drizzle(this._client, { schema });
  }

  async onApplicationShutdown(signal?: string) {
    console.log({ signal });
    await this._client.end();
  }
}
