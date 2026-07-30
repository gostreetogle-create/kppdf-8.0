import { randomUUID } from 'node:crypto';
import {
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentTemplateService } from '../document-template/document-template.service';
import { BuildDocumentDto } from '../document-template/dto/build-document.dto';
import type { DocumentTemplateDocument } from '../document-template/document-template.schema';

/**
 * TZ-236.B + TZ-236.C.1 + TZ-236.C.2 + TZ-236.C.3 — PdfRenderService.
 *
 * Reuses DocumentTemplateService.build() for HTML rendering (which already
 * resolves dataBinding, substitutes {{key.subkey}}, applies Intl formatting,
 * and lays out blocks). This service is a thin HTTP wrapper around Gotenberg
 * with in-memory async queue + Chromium header/footer injection.
 *
 * Gotenberg endpoint: POST /forms/chromium/convert/html (multipart/form-data)
 *   - field `files` = the HTML file (must be named `index.html` or end in `.html`)
 *   - field `paperWidth` / `paperHeight` = page size in inches
 *   - field `marginTop` / `marginBottom` (auto-bumped when header/footer present)
 *   - field `header.html` / `footer.html` = Chromium header/footer HTML (TZ-236.C.3)
 *   - response: application/pdf stream
 *
 * TZ-236.C sub-waves implemented:
 *   - C.1: Background images — rewrite /uploads/* relative URLs to BACKEND_PUBLIC_URL
 *     so Gotenberg (in Docker) can fetch them via host.docker.internal.
 *   - C.2: Async render queue — in-memory FIFO with MAX_CONCURRENT=2 concurrency
 *     limit + TTL cleanup for memory leak prevention.
 *   - C.3: Header/footer injection — sensible defaults from template metadata
 *     (template.name as title + pageNumber/totalPages in footer).
 *
 * Sync flow (TZ-236.B + C.1 + C.3): `renderFromTemplate(...)` → returns Buffer.
 * Async flow (TZ-236.C.2): `enqueueRender(...)` → returns jobId; poll `getJob(jobId)`
 *   for status; `getJobPdf(jobId)` for the rendered Buffer.
 */
@Injectable()
export class PdfRenderService {
  private readonly logger = new Logger(PdfRenderService.name);

  // ── Tunables (TZ-236.C) ────────────────────────────────────────────
  /** Default Gotenberg URL — overridable via GOTENBERG_URL env. */
  private readonly gotenbergUrl: string;
  /** Hard timeout for Gotenberg render (Chromium can stall on huge docs). */
  private readonly renderTimeoutMs = 60_000;
  /** In-memory async queue TTL: jobs older than this get garbage-collected. */
  private static readonly JOB_TTL_MS = 60 * 60 * 1000;
  /** Max concurrent renders (shields Gotenberg from OOM/timeouts). */
  private static readonly MAX_CONCURRENT = 2;
  /**
   * Header/footer reserved margin (gotenberg needs space for sticky zones).
   * ~20mm = 0.79 inches. Set to 0 when no header/footer.
   */
  private static readonly HF_MARGIN_INCHES = 0.79;

  // ── Async state (TZ-236.C.2) ───────────────────────────────────────
  private readonly jobs = new Map<
    string,
    {
      status: 'pending' | 'processing' | 'done' | 'failed';
      pdf?: Buffer;
      error?: string;
      createdAt: number;
      templateId: string;
    }
  >();
  private readonly queue: Array<{
    jobId: string;
    templateId: string;
    dto: BuildDocumentDto;
  }> = [];
  private activeRenders = 0;

  constructor(
    private readonly templateService: DocumentTemplateService,
    private readonly config: ConfigService,
  ) {
    this.gotenbergUrl =
      this.config.get<string>('GOTENBERG_URL') ?? 'http://localhost:3001';
    // TZ-236.C.2: schedule periodic GC for stale jobs (memory leak guard).
    // .unref() so it doesn't prevent process exit during graceful shutdown.
    setInterval(() => this.gcStaleJobs(), 5 * 60 * 1000).unref();
  }

  // ─────────────────────────────────────────────────────────────────
  // SYNC path (TZ-236.B + TZ-236.C.1 + TZ-236.C.3)
  // ─────────────────────────────────────────────────────────────────

  /**
   * Render template (with build payload) to PDF buffer.
   * Throws ServiceUnavailableException if Gotenberg is unreachable.
   */
  async renderFromTemplate(
    templateId: string,
    dto: BuildDocumentDto,
  ): Promise<Buffer> {
    const { template } = await this.templateService.findExpanded(templateId);
    const html = await this.templateService.build(templateId, dto);
    return this.renderFromHtmlAndTemplate(templateId, template, html, dto);
  }

  /**
   * Shared render core (used by both sync renderFromTemplate and async enqueueRender).
   * Applies C.1 (URL rewrite), C.3 (header/footer defaults), then POST to Gotenberg.
   */
  private async renderFromHtmlAndTemplate(
    templateId: string,
    template: DocumentTemplateDocument,
    html: string,
    dto: BuildDocumentDto,
  ): Promise<Buffer> {
    // TZ-236.C.1: rewrite /uploads/* relative URLs to BACKEND_PUBLIC_URL.
    const publicBaseUrl =
      this.config.get<string>('BACKEND_PUBLIC_URL') ??
      'http://host.docker.internal:3000';
    const htmlWithAssets = html.replace(
      /src="(\/uploads\/[^"]+)"/g,
      (_match, path: string) => `src="${publicBaseUrl}${path}"`,
    );

    // TZ-236.C.3: sensible header/footer defaults from template metadata.
    // DTO overrides `htmlHeader?` / `htmlFooter?` (Noop if absent; for future-proofing).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dtoExtras = dto as BuildDocumentDto & {
      htmlHeader?: string;
      htmlFooter?: string;
    };
    const htmlHeader = dtoExtras.htmlHeader ?? this.buildDefaultHeader(template);
    const htmlFooter = dtoExtras.htmlFooter ?? this.buildDefaultFooter(template);
    const headerInches = htmlHeader ? PdfRenderService.HF_MARGIN_INCHES : 0;
    const footerInches = htmlFooter ? PdfRenderService.HF_MARGIN_INCHES : 0;

    const { width, height } = this.mapPageSize(
      template.pageSize ?? 'A4',
      template.orientation ?? 'portrait',
    );

    const form = new FormData();
    form.append(
      'files',
      new Blob([htmlWithAssets], { type: 'text/html; charset=utf-8' }),
      'index.html',
    );
    if (htmlHeader) {
      form.append(
        'header.html',
        new Blob([htmlHeader], { type: 'text/html' }),
        'header.html',
      );
    }
    if (htmlFooter) {
      form.append(
        'footer.html',
        new Blob([htmlFooter], { type: 'text/html' }),
        'footer.html',
      );
    }
    form.append('paperWidth', String(width));
    form.append('paperHeight', String(height));
    form.append('marginTop', String(headerInches));
    form.append('marginBottom', String(footerInches));
    form.append('marginLeft', '0');
    form.append('marginRight', '0');

    const url = `${this.gotenbergUrl}/forms/chromium/convert/html`;
    const controller = new AbortController();
    const timeoutHandle = setTimeout(
      () => controller.abort(),
      this.renderTimeoutMs,
    );

    try {
      this.logger.log(
        `Rendering template ${templateId} (${template.pageSize ?? 'A4'} ${template.orientation ?? 'portrait'}) → ${url}`,
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
      this.logger.log(`Rendered template ${templateId} → ${buffer.length} bytes`);
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

  // ─────────────────────────────────────────────────────────────────
  // ASYNC path (TZ-236.C.2)
  // ─────────────────────────────────────────────────────────────────

  /**
   * Enqueue a render job. Returns jobId immediately (caller polls later).
   * Job FIFO order; concurrency cap via MAX_CONCURRENT.
   */
  enqueueRender(templateId: string, dto: BuildDocumentDto): string {
    const jobId = randomUUID();
    this.jobs.set(jobId, {
      status: 'pending',
      createdAt: Date.now(),
      templateId,
    });
    this.queue.push({ jobId, templateId, dto });
    this.logger.log(
      `Job ${jobId} ENQUEUED (template=${templateId}); queue depth=${this.queue.length}, active=${this.activeRenders}`,
    );
    // Kick the worker loop (non-blocking).
    void this.processQueue();
    return jobId;
  }

  /** Lookup job state (without consuming the PDF buffer). */
  getJob(jobId: string): {
    status: 'pending' | 'processing' | 'done' | 'failed';
    error?: string;
    templateId: string;
    createdAt: number;
  } | null {
    const job = this.jobs.get(jobId);
    if (!job) return null;
    return {
      status: job.status,
      error: job.error,
      templateId: job.templateId,
      createdAt: job.createdAt,
    };
  }

  /** Consume the PDF buffer (caller is responsible for streaming it). */
  getJobPdf(jobId: string): Buffer {
    const job = this.jobs.get(jobId);
    if (!job) throw new NotFoundException(`Job ${jobId} не найден`);
    if (job.status !== 'done' || !job.pdf) {
      throw new NotFoundException(
        `Job ${jobId} ещё не завершён (status=${job.status})`,
      );
    }
    return job.pdf;
  }

  /**
   * Worker loop: while queue has jobs and we have capacity, dequeue + render.
   * Runs sequentially per call (kick from enqueueRender + initial processing).
   */
  private async processQueue(): Promise<void> {
    while (
      this.queue.length > 0 &&
      this.activeRenders < PdfRenderService.MAX_CONCURRENT
    ) {
      const next = this.queue.shift();
      if (!next) break;
      this.activeRenders++;
      const job = this.jobs.get(next.jobId);
      if (job) job.status = 'processing';

      // Fire-and-forget; catch errors inline so worker keeps running.
      void this.runJob(next.jobId, next.templateId, next.dto)
        .catch((err: unknown) => {
          this.logger.error(
            `Job ${next.jobId} crashed in worker loop: ${(err as Error).message}`,
          );
        })
        .finally(() => {
          this.activeRenders--;
          // Chain next iteration if queue still has work.
          void this.processQueue();
        });
    }
  }

  private async runJob(
    jobId: string,
    templateId: string,
    dto: BuildDocumentDto,
  ): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;
    try {
      const { template } = await this.templateService.findExpanded(templateId);
      const html = await this.templateService.build(templateId, dto);
      const pdf = await this.renderFromHtmlAndTemplate(
        templateId,
        template,
        html,
        dto,
      );
      job.status = 'done';
      job.pdf = pdf;
      this.logger.log(
        `Job ${jobId} DONE (template=${templateId}, ${pdf.length} bytes)`,
      );
    } catch (err) {
      job.status = 'failed';
      job.error = (err as Error).message;
      this.logger.warn(
        `Job ${jobId} FAILED (template=${templateId}): ${(err as Error).message}`,
      );
    }
  }

  /** GC stale jobs (called by setInterval every 5 min in constructor). */
  gcStaleJobs(): void {
    const cutoff = Date.now() - PdfRenderService.JOB_TTL_MS;
    let removed = 0;
    for (const [jobId, job] of this.jobs.entries()) {
      if (job.createdAt < cutoff) {
        this.jobs.delete(jobId);
        removed++;
      }
    }
    if (removed > 0) {
      this.logger.log(`GC: удалено ${removed} устаревших job(ов)`);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // Helpers (TZ-236.B + TZ-236.C.3)
  // ─────────────────────────────────────────────────────────────────

  /**
   * Build default header template (TZ-236.C.3).
   * Uses Chromium placeholders: <span class="title"></span> expands to document.title.
   */
  private buildDefaultHeader(template: DocumentTemplateDocument): string {
    return `<div style="font-size:9px;width:100%;text-align:left;color:#666;font-family:'PT Sans',sans-serif;">
      <span class="title">${this.escapeHtml(template.name ?? '')}</span>
      ${template.organizationId ? `&nbsp;&middot;&nbsp; <span>${this.escapeHtml(String(template.organizationId).slice(-6))}</span>` : ''}
    </div>`;
  }

  /**
   * Build default footer template (TZ-236.C.3) with page numbering.
   * Chromium classes: pageNumber, totalPages, date.
   */
  private buildDefaultFooter(_template: DocumentTemplateDocument): string {
    return `<div style="font-size:9px;width:100%;text-align:center;color:#666;font-family:'PT Sans',sans-serif;">
      <span class="pageNumber"></span> / <span class="totalPages"></span>
      &nbsp;&middot;&nbsp;
      <span class="date"></span>
    </div>`;
  }

  /** Minimal HTML escape (TZ-236.C.3 — only for known template-controlled fields). */
  private escapeHtml(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
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
