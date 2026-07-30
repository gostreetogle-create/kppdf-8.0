import { Module } from '@nestjs/common';
import { DocumentTemplateModule } from '../document-template/document-template.module';
import { PdfRenderService } from './pdf-render.service';
import { PdfRenderController } from './pdf-render.controller';

/**
 * TZ-236.B — PdfRenderModule: NestJS integration with Gotenberg microservice.
 *
 * Workflow:
 *   1. POST /api/pdf-render/from-template/:templateId
 *   2. PdfRenderService delegates HTML generation to DocumentTemplateService.build()
 *   3. Service sends HTML to Gotenberg (http://localhost:3001) via multipart POST
 *   4. Gotenberg (Chromium headless) returns PDF buffer
 *   5. Controller streams PDF back to client with attachment Content-Disposition
 *
 * Gotenberg runs in Docker (TZ-236.A.1) — Cyrillic fonts pre-installed in Dockerfile
 * (fonts-dejavu, fonts-liberation2, fonts-noto-core, fonts-noto-cjk).
 */
@Module({
  imports: [DocumentTemplateModule],
  providers: [PdfRenderService],
  controllers: [PdfRenderController],
  exports: [PdfRenderService],
})
export class PdfRenderModule {}