import {
  Body,
  Controller,
  HttpStatus,
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
 * TZ-236.B — PdfRenderController: HTTP entry point for PDF rendering.
 *
 * Endpoint:
 *   POST /api/pdf-render/from-template/:templateId
 *   Body: BuildDocumentDto (same shape as POST /api/generated-documents/from-template/:templateId)
 *   Response: application/pdf stream with Content-Disposition: attachment
 *
 * Audit: every render is logged via @AuditAction({ action: 'render', entityType: 'PdfRender' })
 * to track who generated which PDF (compliance + billing downstream).
 */
@Controller('pdf-render')
export class PdfRenderController {
  constructor(private readonly service: PdfRenderService) {}

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
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"`,
    );
    res.setHeader('Content-Length', String(pdf.length));
    return new StreamableFile(pdf);
  }
}