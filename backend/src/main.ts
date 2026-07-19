import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger as PinoLogger } from 'nestjs-pino';
import helmet from 'helmet';
import compression from 'compression';
import { join } from 'path';
import type { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { MulterExceptionFilter } from './common/filters/multer-exception.filter';
import { VersionConflictFilter } from './common/filters/version-conflict.filter';
import { ThrottlerBehindAuthGuard } from './common/guards/throttler-behind-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(PinoLogger));

  // Helmet with CSP and HSTS hardening
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'blob:'],
        },
      },
      hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    }),
  );

  // Static serve for uploaded photos at /uploads/* → ./uploads/
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // Compression
  app.use(compression());

  // TZ-91 §4 Phase A.6: CORS multi-origin — read CORS_ORIGIN (preferred, new convention) or
  // CORS_ORIGINS (legacy, deprecated). Comma-separated list, trimmed, empty handlers dropped.
  const corsEnv = process.env.CORS_ORIGIN ?? process.env.CORS_ORIGINS ?? 'http://localhost:3000,http://localhost:4200';
  const corsOrigins = corsEnv.split(',').map((o) => o.trim()).filter(Boolean);
  app.enableCors({
    origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
    credentials: true,
  });

  // Global throttler (skips when DISABLE_THROTTLE=1)
  app.useGlobalGuards(app.get(ThrottlerBehindAuthGuard));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // TZ-86 Phase A.6 — Multer errors (LIMIT_FILE_SIZE etc.) get specific HTTP
  // codes (413 for oversize, 400 for unexpected field) before falling through
  // to HttpExceptionFilter for everything else. More-specific @Catch(MulterError)
  // filter is registered first; the global catch-all backs it up.
  app.useGlobalFilters(new VersionConflictFilter(), new MulterExceptionFilter(), new HttpExceptionFilter());
  app.setGlobalPrefix('api');

  // Production: serve built Angular SPA from FRONTEND_PATH (Synology/docker deploy).
  const frontendPath = process.env.FRONTEND_PATH;
  if (process.env.NODE_ENV === 'production' && frontendPath) {
    app.useStaticAssets(frontendPath, { index: false });
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') return next();
      const p = req.path;
      if (p.startsWith('/api') || p.startsWith('/uploads')) return next();
      res.sendFile(join(frontendPath, 'index.html'), (err: Error | null) => {
        if (err) next(err);
      });
    });
    Logger.log(`📦 Frontend static: ${frontendPath}`, 'Bootstrap');
  }

  const swaggerConfig = new DocumentBuilder()
    .setTitle('KPPDF API')
    .setDescription('Backend API for kppdf-8.0 ERP system')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  // TZ-91 §4 Phase C.1: Swagger gated by NODE_ENV !== 'production'.
  // Escape hatch: SWAGGER_ENABLED='true' for prod-debug scenarios only.
  // Strict `=== 'true'` (no truthy coercion) avoids accidental enabling
  // via SWAGGER_ENABLED=1 or SWAGGER_ENABLED=yes (both intentionally rejected
  // — code-reviewer MINOR cross-cutting decision).
  const swaggerEnabled =
    process.env.NODE_ENV !== 'production' ||
    process.env.SWAGGER_ENABLED === 'true';
  if (swaggerEnabled) {
    SwaggerModule.setup('docs', app, document);
  } else {
    Logger.log('Swagger UI disabled in production (set SWAGGER_ENABLED=true to override)', 'Bootstrap');
  }

  // Graceful shutdown
  app.enableShutdownHooks();
  const shutdown = async (signal: string) => {
    Logger.log(`Received ${signal}, starting graceful shutdown...`, 'Bootstrap');
    try {
      await app.close();
      Logger.log('HTTP server closed', 'Bootstrap');
      process.exit(0);
    } catch (err) {
      Logger.error(`Shutdown error: ${err instanceof Error ? err.message : String(err)}`, 'Bootstrap');
      process.exit(1);
    }
  };
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

  const port = parseInt(process.env.PORT ?? '3000', 10);
  await app.listen(port);

  const url = await app.getUrl();
  Logger.log(`🚀 Backend started on ${url}`, 'Bootstrap');
  Logger.log(`📚 Swagger UI: ${url}/docs`, 'Bootstrap');
  Logger.log(`❤️  Health: ${url}/api/health`, 'Bootstrap');
}

void bootstrap();
