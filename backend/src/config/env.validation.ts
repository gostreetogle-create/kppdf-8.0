import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),

  MONGO_URI: Joi.string().uri().required(),
  MONGO_DB: Joi.string().default('kppdf'),
  MONGO_REPLICA_SET: Joi.string().default('rs0'),

  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
  LOG_LEVEL: Joi.string()
    .valid('trace', 'debug', 'info', 'warn', 'error', 'fatal')
    .default('info'),

  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().min(16).required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  ADMIN_USERNAME: Joi.string().default('admin'),
  ADMIN_PASSWORD: Joi.string().min(8).required(),

  // TZ-236.B: Gotenberg microservice URL (TZ-236.A.1 Docker).
  // Optional: defaults to http://localhost:3001 in PdfRenderService.
  GOTENBERG_URL: Joi.string().uri().optional(),
  // TZ-236.C.1: Public base URL for absolute asset URLs in PDF rendering
  // (background images fetched by Gotenberg via host.docker.internal).
  // Optional: defaults to http://host.docker.internal:3000 in PdfRenderService.
  BACKEND_PUBLIC_URL: Joi.string().uri().optional(),
});
