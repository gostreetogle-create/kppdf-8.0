import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger as PinoLogger } from 'nestjs-pino';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ThrottlerBehindAuthGuard } from './common/guards/throttler-behind-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

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

  // Compression
  app.use(compression());

  // CORS whitelist via env (CORS_ORIGINS, comma-separated)
  const corsOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000,http://localhost:4200')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
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

  app.useGlobalFilters(new HttpExceptionFilter());
  app.setGlobalPrefix('api');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('KPPDF API')
    .setDescription('Backend API for kppdf-8.0 ERP system')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

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
