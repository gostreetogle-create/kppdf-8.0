import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { Response } from 'express';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuditAction } from '../../common/decorators/audit-action.decorator';
import { PdfRenderService } from './pdf-render.service';
import { BuildDocumentDto } from '../document-template/dto/build-document.dto';

/**
 * TZ-236.B + TZ-236.C — PdfRenderController.
 *
 * Endpoints:
 *   POST /api/pdf-render/from-template/:templateId              — sync (TZ-236.B + C.1 + C.3)
 *   POST /api/pdf-render/async/from-template/:templateId        — enqueue async job (TZ-236.C.2)
 *   GET  /api/pdf-render/jobs/:jobId                            — job status (TZ-236.C.2)
 *   GET  /api/pdf-render/jobs/:jobId/download                   — consume PDF buffer (TZ-236.C.2)
 */
@Controller('pdf-render')
export class PdfRenderController {
  constructor(private readonly service: PdfRenderService) {}

  // ── SYNC (TZ-236.B) ───────────────────────────────────────────────

  @Post('from-template/:templateId')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'render', entityType: 'PdfRender' })
  async renderFromTemplate(
    @Param('templateId') templateId: string,
    @Body() dto: BuildDocumentDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const pdf = await this.service.renderFromTemplate(templateId, dto);
    const filename = `template-${templateId.slice(-6)}-${Date.now()}.pdf`;
    res.status(HttpStatus.OK);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return new StreamableFile(pdf);
  }

  // ── ASYNC (TZ-236.C.2) ────────────────────────────────────────────

  /**
   * Enqueue PDF render as async job. Returns 202 Accepted with jobId.
   * Caller polls GET /jobs/:jobId for status, then GET /jobs/:jobId/download.
   *
   * Use this for large templates (>30 blocks) where sync 60s timeout might fire.
   * For small templates, sync endpoint above is simpler and faster.
   */
  @Post('async/from-template/:templateId')
  @HttpCode(HttpStatus.ACCEPTED)
  @Roles('admin', 'manager')
  @AuditAction({ action: 'render-async', entityType: 'PdfRender' })
  enqueueRender(
    @Param('templateId') templateId: string,
    @Body() dto: BuildDocumentDto,
  ): { jobId: string; status: string } {
    const jobId = this.service.enqueueRender(templateId, dto);
    return { jobId, status: 'pending' };
  }

  /** Job status (pending / processing / done / failed). */
  @Get('jobs/:jobId')
  @Roles('admin', 'manager')
  getJob(@Param('jobId') jobId: string): {
    jobId: string;
    status: string;
    templateId: string;
    createdAt: number;
    error?: string;
  } {
    const job = this.service.getJob(jobId);
    if (!job) throw new NotFoundException(`Job ${jobId} не найден`);
    return { jobId, ...job };
  }

  /** Download PDF buffer for completed job. Throws 404 if not done yet. */
  @Get('jobs/:jobId/download')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'render-download', entityType: 'PdfRender' })
  downloadJob(
    @Param('jobId') jobId: string,
    @Res({ passthrough: true }) res: Response,
  ): StreamableFile {
    const pdf = this.service.getJobPdf(jobId);
    const job = this.service.getJob(jobId);
    const filename = `template-${job?.templateId.slice(-6) ?? 'job'}-${jobId.slice(0, 8)}.pdf`;
    res.status(HttpStatus.OK);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return new StreamableFile(pdf);
  }
}
