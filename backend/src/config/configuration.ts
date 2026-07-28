import {
  DEFAULT_ADMIN_PASSWORD,
  DEFAULT_ADMIN_USERNAME,
} from './defaults';

export interface AppConfig {
  port: number;
  nodeEnv: string;
  mongo: {
    uri: string;
    db: string;
    replicaSet: string;
  };
  cors: {
    origin: string[];
  };
  log: {
    level: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
  admin: {
    username: string;
    password: string;
  };
  // TZ-247: Backend Idempotency Middleware
  idempotency: {
    enabled: boolean;
    ttlSeconds: number;
    maxBodyBytes: number;
  };
}

export default (): AppConfig => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  mongo: {
    uri: process.env.MONGO_URI ?? 'mongodb://localhost:27017/kppdf',
    db: process.env.MONGO_DB ?? 'kppdf',
    replicaSet: process.env.MONGO_REPLICA_SET ?? 'rs0',
  },
  cors: {
    origin: (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .split(',')
      .map((o) => o.trim()),
  },
  log: {
    level: process.env.LOG_LEVEL ?? 'info',
  },
  jwt: {
    secret: process.env.JWT_SECRET as string,
    expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET as string,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  admin: {
    username: process.env.ADMIN_USERNAME ?? DEFAULT_ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD,
  },
  // TZ-247: Backend Idempotency Middleware — 5 min TTL matches frontend TZ-232.N
  idempotency: {
    enabled: process.env.IDEMPOTENCY_ENABLED !== 'false',
    ttlSeconds: parseInt(process.env.IDEMPOTENCY_TTL_SECONDS ?? '300', 10),
    maxBodyBytes: parseInt(
      process.env.IDEMPOTENCY_MAX_BODY_BYTES ?? String(5 * 1024 * 1024),
      10,
    ),
  },
});
