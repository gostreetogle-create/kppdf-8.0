import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { z } from 'zod';
import { firstValueFrom } from 'rxjs';

/**
 * Default unit values for the new-material form. Matches the canonical
 * units the backend schema accepts (anything else is freeform text).
 */
export const DEFAULT_UNITS = ['m²', 'm³', 'kg', 'sheet', 'pcs'] as const;

/**
 * Allowed currencies — short list to keep the dropdown focused; backend
 * Length(3,8) accepts any 3-character ISO-style code, but Material Symbols
 * icons + locale-aware formatting naturally favour RUB / USD / EUR / CNY.
 */
export const DEFAULT_CURRENCIES = ['RUB', 'USD', 'EUR', 'CNY'] as const;

/**
 * Backend Material shape (mirrors `@Schema({ collection: 'materials' })`).
 * We keep it permissive here: the server enforces hard constraints, this
 * type is a best-effort surface so the UI signals stay type-safe.
 */
export interface Material {
  _id: string;
  name: string;
  article?: string;
  sku?: string;
  unit: string;
  categoryId?:
    | string
    | { _id: string; name: string } /* populated via `populate('categoryId')` */;
  description?: string;
  pricePerUnit?: number;
  priceCurrency?: string;
  stockQty?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    thickness?: number;
    diameter?: number;
    unit?: string;
  };
  fixedDimensions?: boolean;
  image?: string;
  photoIds?: string[];
  supplierId?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MaterialListResponse {
  items: Material[];
  total: number;
  page: number;
  limit: number;
}

const dimensionsSchema = z.object({
  length: z.number().min(0).optional(),
  width: z.number().min(0).optional(),
  height: z.number().min(0).optional(),
  thickness: z.number().min(0).optional(),
  diameter: z.number().min(0).optional(),
  unit: z.string().optional(),
});

/**
 * Cross-validation for the create form. Matches `CreateMaterialDto`
 * (Length(1,256) for name; Length(1,32) for unit). Comparing against the
 * server's class-validator constraints guarantees the payload we send
 * is one the server will accept.
 */
export const materialCreateSchema = z.object({
  name: z.string().min(1, 'Введите название').max(256),
  unit: z.string().min(1, 'Укажите единицу измерения').max(32),
  article: z.string().max(64).optional().or(z.literal('')),
  description: z.string().max(2000).optional().or(z.literal('')),
  pricePerUnit: z.number().min(0).optional(),
  priceCurrency: z
    .string()
    .max(8)
    .optional()
    .or(z.literal('')),
  stockQty: z.number().min(0).optional(),
  dimensions: dimensionsSchema.optional(),
  fixedDimensions: z.boolean().optional(),
  notes: z.string().max(2000).optional().or(z.literal('')),
  // Mongo-IDs kept as strings; backend will validate.
  categoryId: z.string().optional().or(z.literal('')),
  supplierId: z.string().optional().or(z.literal('')),
});

export type MaterialCreateValues = z.infer<typeof materialCreateSchema>;

/**
 * Thin Signals-based client for the Material entity.
 *
 * State (items, total, loading, error) lives in private signals and is
 * exposed as readonly; mutator methods (`create`, `update`, `remove`)
 * update the state in-place so the table re-renders without a fresh
 * `load()` call.
 */
@Injectable({ providedIn: 'root' })
export class MaterialService {
  private readonly http = inject(HttpClient);

  /** Public signals — readonly view onto internal state. */
  readonly items = signal<Material[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly limit = signal(20);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  /** Loaded-once metadata for header / toolbar chrome. */
  readonly lastQuery = signal<{ search?: string; page: number }>({ page: 1 });

  async list(opts: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
  } = {}): Promise<void> {
    const page = Math.max(1, opts.page ?? this.page());
    const limit = Math.min(100, Math.max(1, opts.limit ?? this.limit()));
    this.loading.set(true);
    this.error.set(null);

    let params = new HttpParams().set('page', page).set('limit', limit);
    if (opts.search) params = params.set('search', opts.search);
    if (opts.categoryId) params = params.set('categoryId', opts.categoryId);

    try {
      const res = await firstValueFrom(
        this.http.get<MaterialListResponse>('/api/materials', { params }),
      );
      this.items.set(res.items ?? []);
      this.total.set(res.total ?? 0);
      this.page.set(res.page ?? page);
      this.limit.set(res.limit ?? limit);
      this.lastQuery.set({ search: opts.search, page });
    } catch (e) {
      this.items.set([]);
      this.total.set(0);
      this.error.set(toErrorMessage(e, 'Не удалось загрузить список материалов'));
    } finally {
      this.loading.set(false);
    }
  }

  async create(values: MaterialCreateValues): Promise<Material | null> {
    this.error.set(null);
    try {
      const created = await firstValueFrom(
        this.http.post<Material>('/api/materials', sanitizeForCreate(values)),
      );
      // Optimistic prepend so the user sees their record immediately.
      this.items.update((arr) => [created, ...arr]);
      this.total.update((n) => n + 1);
      return created;
    } catch (e) {
      this.error.set(toErrorMessage(e, 'Не удалось создать материал'));
      return null;
    }
  }

  async update(id: string, update: Partial<MaterialCreateValues>): Promise<Material | null> {
    this.error.set(null);
    try {
      const updated = await firstValueFrom(
        this.http.patch<Material>(`/api/materials/${id}`, sanitizeForCreate(update)),
      );
      this.items.update((arr) => arr.map((m) => (m._id === id ? updated : m)));
      return updated;
    } catch (e) {
      this.error.set(toErrorMessage(e, 'Не удалось сохранить изменения'));
      return null;
    }
  }

  async remove(id: string): Promise<boolean> {
    this.error.set(null);
    try {
      await firstValueFrom(this.http.delete<void>(`/api/materials/${id}`));
      this.items.update((arr) => arr.filter((m) => m._id !== id));
      this.total.update((n) => Math.max(0, n - 1));
      return true;
    } catch (e) {
      this.error.set(toErrorMessage(e, 'Не удалось удалить материал'));
      return false;
    }
  }
}

/**
 * Strip empty strings → undefined and pack dimensions into the nested
 * object the backend expects. Keeps the wire-format identical to
 * CreateMaterialDto (server ignores undefined; class-validator runs on
 * what's present).
 */
function sanitizeForCreate(values: Partial<MaterialCreateValues>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(values ?? {})) {
    if (v === '' || v === undefined) continue;
    out[k] = v;
  }
  const dimsRaw = out['dimensions'];
  if (dimsRaw && typeof dimsRaw === 'object') {
    const dims: Record<string, unknown> = {};
    for (const [dk, dv] of Object.entries(dimsRaw as Record<string, unknown>)) {
      if (dv === '' || dv === undefined || dv === null) continue;
      dims[dk] = dv;
    }
    if (Object.keys(dims).length > 0) out['dimensions'] = dims;
    else delete out['dimensions'];
  }
  return out;
}

function toErrorMessage(e: unknown, fallback: string): string {
  // HttpErrorResponse has `.error?.message`; we surface that first, else
  // the status text, else the fallback label.
  const anyErr = e as { error?: { message?: string }; statusText?: string; message?: string };
  return anyErr?.error?.message ?? anyErr?.statusText ?? anyErr?.message ?? fallback;
}
