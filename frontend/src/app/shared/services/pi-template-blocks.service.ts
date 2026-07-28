import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';
import {
  silentDelete,
  silentGet,
  silentPatch,
  silentPost,
  SilentResult,
} from '../../core/silent-http';
import type {
  CreateTemplateBlockPayload,
  ReorderBlocksPayload,
  TemplateBlock,
  UpdateTemplateBlockPayload,
} from '../template-block/template-block.types';

/**
 * TZ-86 Phase D — TemplateBlocksService. Silent-http mirror of backend
 * `TemplateBlockController` (5 endpoints).
 *
 * Routes (cf. backend `template-block.controller.ts`):
 *   GET    /template-blocks?templateId={id}    → TemplateBlock[]
 *   GET    /template-blocks/:id                → TemplateBlock
 *   POST   /document-templates/:id/blocks      → TemplateBlock   (templateId from URL)
 *   POST   /document-templates/:id/blocks/reorder → TemplateBlock[]   (atomic sortOrder write)
 *   PATCH  /template-blocks/:id                → TemplateBlock
 *   DELETE /template-blocks/:id                → void
 *
 * The reorder endpoint receives a flat `blockIds: string[]` and the backend
 * service recomputes `order` per index in a single transaction — see
 * `TemplateBlockService.reorder()`. The frontend NEVER rewrites `order`
 * locally; it always round-trips through this endpoint after a drop event
 * to keep the in-memory array in lockstep with the database.
 *
 * No `dataBinding` upsert dedicated endpoint — bindings are written via the
 * generic PATCH `/template-blocks/:id` (the `dataBinding` subdoc is part of
 * the same schema, see Phase A.3).
 */
@Injectable({ providedIn: 'root' })
export class TemplateBlocksService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  /**
   * List all blocks for a template. Returns flat array (not paginated — a
   * single template rarely exceeds ~50 blocks). Sort order is `order: 1`
   * per the schema index.
   */
  listByTemplate(templateId: string): Observable<SilentResult<TemplateBlock[]>> {
    return silentGet<TemplateBlock[]>(this.http, `${this.baseUrl}/template-blocks`, {
      params: { templateId },
    });
  }

  findById(id: string): Observable<SilentResult<TemplateBlock>> {
    return silentGet<TemplateBlock>(this.http, `${this.baseUrl}/template-blocks/${id}`);
  }

  /**
   * Add a block to a template. `templateId` is the URL param, not the body —
   * matches `controller.add(templateId, dto)` where the controller injects
   * `templateId` from `:id` and forwards the rest.
   */
  add(
    templateId: string,
    payload: CreateTemplateBlockPayload,
  ): Observable<SilentResult<TemplateBlock>> {
    return silentPost<TemplateBlock>(
      this.http,
      `${this.baseUrl}/document-templates/${templateId}/blocks`,
      payload,
    );
  }

  /**
   * Atomic reorder. `blockIds` must contain every block _id for the
   * template; the backend recomputes `order = blockIds.indexOf(_id)`.
   */
  reorder(
    templateId: string,
    payload: ReorderBlocksPayload,
  ): Observable<SilentResult<TemplateBlock[]>> {
    return silentPost<TemplateBlock[]>(
      this.http,
      `${this.baseUrl}/document-templates/${templateId}/blocks/reorder`,
      payload,
    );
  }

  update(id: string, payload: UpdateTemplateBlockPayload): Observable<SilentResult<TemplateBlock>> {
    return silentPatch<TemplateBlock>(this.http, `${this.baseUrl}/template-blocks/${id}`, payload);
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/template-blocks/${id}`);
  }

  /**
   * Upload an image file for an image-type block.
   *
   * Endpoint contract (planned, TZ-251 backend follow-up):
   *   POST /template-blocks/:id/upload   multipart/form-data  →  { url: string }
   *
   * Uses `silentPost<T>` helper from `core/silent-http` for pattern-consistency
   * with the rest of this service (every existing method delegates to silent-http).
   * The raw `http.post` → cast-as-SilentResult pattern would defeat SilentResult's
   * discriminator: HttpClient emits an ErrorEvent on 4xx/5xx (not a SilentResult
   * `{ok: false}`, which would silently lie as `{ok: true, data: <whatever>}`).
   *
   * TODO TZ-251: the backend endpoint at
   * `backend/src/modules/template-block/template-block.controller.ts` is NOT
   * YET implemented (grep confirms only 5 routes: GET list, GET :id, POST
   * add, POST reorder, PATCH update). Until TZ-251 ships, calls 404 at runtime;
   * builder.page.ts' `.error` toast handler catches this and the local blob URL
   * keeps canvas preview working for the current session.
   */
  uploadImage(
    blockId: string,
    file: File,
  ): Observable<SilentResult<{ url: string }>> {
    const form = new FormData();
    form.append('file', file, file.name);
    return silentPost<{ url: string }>(
      this.http,
      `${this.baseUrl}/template-blocks/${blockId}/upload`,
      form,
    );
  }
}
