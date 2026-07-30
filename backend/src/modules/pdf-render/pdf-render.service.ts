import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentTemplateService } from '../document-template/document-template.service';
import { BuildDocumentDto } from '../document-template/dto/build-document.dto';

/**
 * TZ-236.B — PdfRenderService: HTML → PDF via Gotenberg.
 *
 * Reuses DocumentTemplateService.build() for HTML rendering (which already
 * resolves dataBinding, substitutes {{key.subkey}}, applies Intl formatting,
 * and lays out blocks). This service is a thin HTTP wrapper around Gotenberg.
 *
 * Gotenberg endpoint: POST /forms/chromium/convert/html (multipart/form-data)
 *   - field `files` = the HTML file (must be named `index.html` or end in `.html`)
 *   - field `paperWidth` / `paperHeight` = page size in inches
 *   - field `marginTop` / `marginBottom` / `marginLeft` / `marginRight` = inches (default 0)
 *   - response: application/pdf stream
 *
 * MVP scope (TZ-236.B):
 *   - A4 / A3 / A5 portrait + landscape
 *   - Cyrillic text (fonts pre-installed in Dockerfile TZ-236.A.1)
 *   - Sync rendering (small docs only — >30s docs would benefit from async queue in TZ-236.C)
 *
 * Out of scope (deferred):
 *   - Background images (relative /uploads/* URLs — Gotenberg in Docker can't reach host
 *     without explicit host.docker.internal or mounted volume; tracked in TZ-236.C)
 *   - Header/footer injection via Chromium API (TZ-236.C)
 *   - Async render queue (TZ-236.C)
 */
@Injectable()
export class PdfRenderService {
  private readonly logger = new Logger(PdfRenderService.name);
  /** Default Gotenberg URL — overridable via GOTENBERG_URL env. */
  private readonly gotenbergUrl: string;
  /** Hard timeout for Gotenberg render (Chromium can stall on huge docs). */
  private readonly renderTimeoutMs = 60_000;

  constructor(
    private readonly templateService: DocumentTemplateService,
    private readonly config: ConfigService,
  ) {
    this.gotenbergUrl =
      this.config.get<string>('GOTENBERG_URL') ?? 'http://localhost:3001';
  }

  /**
   * Render template (with build payload) to PDF buffer.
   * Throws ServiceUnavailableException if Gotenberg is unreachable.
   */
  async renderFromTemplate(
    templateId: string,
    dto: BuildDocumentDto,
  ): Promise<Buffer> {
    // 1. Delegate HTML rendering to DocumentTemplateService (dataBinding + Intl + layout).
    const html = await this.templateService.build(templateId, dto);

    // 2. Fetch template metadata for page size + orientation.
    const { template } = await this.templateService.findExpanded(templateId);
    const { width, height } = this.mapPageSize(
      template.pageSize,
      template.orientation,
    );

    // 3. Build multipart form-data.
    const form = new FormData();
    // Gotenberg requires the HTML file to be either named `index.html` or end in `.html`.
    // We pass the bytes via Blob with explicit filename.
    form.append(
      'files',
      new Blob([html], { type: 'text/html; charset=utf-8' }),
      'index.html',
    );
    form.append('paperWidth', String(width));
    form.append('paperHeight', String(height));
    form.append('marginTop', '0');
    form.append('marginBottom', '0');
    form.append('marginLeft', '0');
    form.append('marginRight', '0');

    // 4. POST to Gotenberg with hard timeout via AbortSignal.
    const url = `${this.gotenbergUrl}/forms/chromium/convert/html`;
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), this.renderTimeoutMs);

    try {
      this.logger.log(
        `Rendering template ${templateId} (${template.pageSize} ${template.orientation}) → ${url}`,
      );
      const response = await fetch(url, {
        method: 'POST',
        body: form,
        signal: controller.signal,
      });
      if (!response.ok) {
        const errText = await response.text().catch(() => '<no body>');
        throw new ServiceUnavailableException(
          `Gotenberg вернул ${response.status}: ${errText.slice(0, 500)}`,
        );
      }
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      this.logger.log(
        `Rendered template ${templateId} → ${buffer.length} bytes`,
      );
      return buffer;
    } catch (err) {
      if (err instanceof ServiceUnavailableException) throw err;
      if ((err as Error).name === 'AbortError') {
        throw new ServiceUnavailableException(
          `Gotenberg render timeout (${this.renderTimeoutMs}ms) для шаблона ${templateId}`,
        );
      }
      throw new ServiceUnavailableException(
        `Gotenberg недоступен (${this.gotenbergUrl}): ${(err as Error).message}`,
      );
    } finally {
      clearTimeout(timeoutHandle);
    }
  }

  /**
   * Map pageSize + orientation → paper dimensions in inches.
   * Gotenberg Chromium API expects inches (not mm/pt).
   * Source: ISO 216 standard (rounded to 2 decimals).
   */
  private mapPageSize(
    pageSize: string,
    orientation: 'portrait' | 'landscape',
  ): { width: number; height: number } {
    const sizes: Record<
      string,
      { portrait: [number, number]; landscape: [number, number] }
    > = {
      A4: { portrait: [8.27, 11.69], landscape: [11.69, 8.27] },
      A3: { portrait: [11.69, 16.54], landscape: [16.54, 11.69] },
      A5: { portrait: [5.83, 8.27], landscape: [8.27, 5.83] },
    };
    const dims = sizes[pageSize] ?? sizes.A4;
    const [w, h] = orientation === 'landscape' ? dims.landscape : dims.portrait;
    return { width: w, height: h };
  }
}