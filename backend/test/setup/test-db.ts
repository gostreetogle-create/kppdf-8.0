import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { AppModule } from '../../src/app.module';

export interface TestContext {
  app: INestApplication;
  module: TestingModule;
  connection: Connection;
  cleanup: () => Promise<void>;
}

export async function createTestApp(): Promise<TestContext> {
  process.env.MONGO_DB = process.env.MONGO_DB_TEST ?? 'kppdf-test';
  process.env.NODE_ENV = 'test';
  process.env.DISABLE_THROTTLE = '1';
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret-min-16-chars-long';
  process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'test-refresh-secret-min-16-chars';
  process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin';

  const module = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = module.createNestApplication({ logger: false });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('api');
  await app.init();

  const connection = app.get<Connection>(getConnectionToken());

  const cleanup = async () => {
    await connection.dropDatabase();
    await app.close();
    await module.close();
  };

  return { app, module, connection, cleanup };
}

export async function clearCollections(connection: Connection, names: string[]): Promise<void> {
  for (const name of names) {
    try {
      await connection.collection(name).deleteMany({});
    } catch {
      // collection may not exist
    }
  }
}
