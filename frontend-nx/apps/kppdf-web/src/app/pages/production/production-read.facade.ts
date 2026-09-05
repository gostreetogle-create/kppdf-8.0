/**
 * TZ-PRODUCTION-303 lock H — thin FE read facade.
 * Order → Product → direct modules → WorkType.days.
 * Never touches ProductionOrder / OrderTask.
 *
 * NX port (TZ-NX-GANTT-G2-READ-MODEL): same cache/inflight/retry shape as
 * legacy, drivers swapped to the NX `@kppdf/data-access` clients. Photo URL
 * enrichment uses populated catalog photo refs when available; unpopulated refs
 * safely resolve to no thumbnail without adding a Photos API dependency.
 */
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  PiOrdersService,
  PiProductsService,
  PiModulesService,
  PiWorkTypesService,
  PiPeopleService,
  type Order,
  type OrderStatus,
  type Product,
  type Person,
  type EstimateWorkerOverride,
  type ProductModule,
  type WorkTypeInModule,
  type WorkType,
} from '@kppdf/data-access';
import { type SilentResult } from '@kppdf/util-http';
import { personDisplayName } from '@kppdf/data-access';
import {
  buildGanttBars,
  ganttSkipProductNames,
  orderHasGanttEstimate,
  type GanttBar,
  type OrderEstimateInput,
  type DirectModuleRef,
  type ModuleWorkTypeRef,
  type EstimateDayOverrideRef,
  type EstimateStartOffsetRef,
} from './gantt-bar.model';

export interface GanttSkipInfo {
  orderId: string;
  orderNumber: string;
  productNames: string[];
}

/**
 * TZ-PRODUCTION-338/341 — bounded fan-out for catalog hydrate (not 1×N sequential).
 * Nest short throttle is 10 req/s; keep fan-out ≤3 so products+modules stay under
 * that budget with room for orders/workers/thumbs (TZ-341: was 8 → 429).
 */
export const PREFETCH_CONCURRENCY = 3;

/** Backoff delays (ms) between 429/503 retries — TZ-PRODUCTION-341. */
const RETRY_BACKOFF_MS = [300, 800, 1500] as const;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableHttpStatus(status: number): boolean {
  return status === 429 || status === 503;
}

export interface ProductionReadState {
  loading: boolean;
  error: string | null;
  warnings: string[];
  orders: Order[];
  bars: GanttBar[];
  /** TZ-PRODUCTION-336 — filtered-out orders (rail marker + toast on select). */
  ineligible: GanttSkipInfo[];
}

function refId(value: string | { _id?: string } | null | undefined): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value;
  return value._id ?? null;
}

type PhotoRefLike = {
  _id?: string;
  storageUrl?: string;
  variant?: string;
  parentPhotoId?: string;
  linkedPhotoId?: string;
};

function photoRef(value: unknown): PhotoRefLike | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as PhotoRefLike;
  return typeof candidate.storageUrl === 'string' && candidate.storageUrl.trim()
    ? candidate
    : null;
}

function photoListUrl(photo: PhotoRefLike, allPhotos: readonly PhotoRefLike[]): string {
  if (photo.variant === 'thumb') return photo.storageUrl!;
  const linkedThumb = allPhotos.find(
    (candidate) =>
      candidate.variant === 'thumb' &&
      (candidate.parentPhotoId === photo._id || candidate.linkedPhotoId === photo._id),
  );
  return linkedThumb?.storageUrl ?? photo.storageUrl!;
}

/** Resolve the cheapest populated catalog photo for list/tree surfaces. */
export function firstPhotoUrl(
  photoIds?: readonly unknown[] | null,
  mainPhotoId?: unknown | null,
): string | null {
  const photos = (photoIds ?? []).map(photoRef).filter((photo): photo is PhotoRefLike => photo != null);
  const main = photoRef(mainPhotoId);
  const mainId = typeof mainPhotoId === 'string' ? mainPhotoId : main?._id;
  const selected =
    main ??
    (mainId ? photos.find((photo) => photo._id === mainId) : undefined) ??
    photos[0];
  return selected ? photoListUrl(selected, photos) : null;
}

/** Product composition line — structural subset (NX `Product.composition` is `ProductRef[]`). */
interface ProductCompositionLineLike {
  _id?: string;
  lineType?: string;
  refId?: string;
  sortOrder?: number;
}

function isModuleCompositionLine(
  line: unknown,
): line is { refId: string; sortOrder?: number } {
  if (!line || typeof line !== 'object') return false;
  const candidate = line as ProductCompositionLineLike;
  return candidate.lineType === 'module' && typeof candidate.refId === 'string';
}

function sortLines(lines: readonly unknown[]): unknown[] {
  return [...lines].sort((a, b) => {
    const ao = (a as ProductCompositionLineLike)?.sortOrder ?? 0;
    const bo = (b as ProductCompositionLineLike)?.sortOrder ?? 0;
    if (ao !== bo) return ao - bo;
    return String((a as ProductCompositionLineLike)?._id).localeCompare(
      String((b as ProductCompositionLineLike)?._id),
    );
  });
}

/** Composition-first dual-read: non-empty composition wins over legacy productModuleIds. */
export function extractDirectModuleIds(product: Product): {
  moduleIds: string[];
  usedLegacy: boolean;
} {
  const composition = product.composition ?? [];
  if (composition.length > 0) {
    const moduleIds = sortLines(composition)
      .filter(isModuleCompositionLine)
      .map((l) => l.refId)
      .filter(Boolean);
    return { moduleIds, usedLegacy: false };
  }

  const legacy = product.productModuleIds ?? [];
  const moduleIds = legacy
    .map((m) => (typeof m === 'string' ? m : (m as { _id?: string })._id))
    .filter((id): id is string => !!id);
  return { moduleIds, usedLegacy: moduleIds.length > 0 };
}

function mapModuleWorkTypes(mod: ProductModule, workTypeById: Map<string, WorkType>): ModuleWorkTypeRef[] {
  const rows: WorkTypeInModule[] = [...(mod.workTypes ?? [])].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );
  return rows.map((wt, idx) => {
    const id = refId(wt.workTypeId as string | { _id?: string }) ?? `unknown-wt-${idx}`;
    const populated = typeof wt.workTypeId === 'object' ? wt.workTypeId : null;
    const catalog = workTypeById.get(id);
    const name = populated?.name ?? catalog?.name ?? id;
    const days = catalog?.days ?? populated?.days ?? null;
    const accentHue = catalog?.accentHue ?? null;
    return {
      workTypeId: id,
      workTypeName: name,
      estimatedHours: wt.estimatedHours,
      days,
      sortOrder: wt.sortOrder ?? idx,
      accentHue,
    };
  });
}

@Injectable()
export class ProductionReadFacade {
  private readonly ordersApi = inject(PiOrdersService);
  private readonly productsApi = inject(PiProductsService);
  private readonly modulesApi = inject(PiModulesService);
  private readonly workTypesApi = inject(PiWorkTypesService);
  private readonly workersApi = inject(PiPeopleService);

  private readonly productCache = new Map<string, Product | null>();
  private readonly moduleCache = new Map<string, ProductModule | null>();
  private workTypesCache: Map<string, WorkType> | null = null;
  private workTypesInflight: Promise<Map<string, WorkType>> | null = null;
  private workersDirectoryCache: WorkerDirectory | null = null;
  private workersInflight: Promise<WorkerDirectory> | null = null;
  private productInflight = new Map<string, Promise<Product | null>>();
  private moduleInflight = new Map<string, Promise<ProductModule | null>>();

  readonly state = signal<ProductionReadState>({
    loading: false,
    error: null,
    warnings: [],
    orders: [],
    bars: [],
    ineligible: [],
  });

  clearCaches(): void {
    this.productCache.clear();
    this.moduleCache.clear();
    this.workTypesCache = null;
    this.workTypesInflight = null;
    this.workersDirectoryCache = null;
    this.workersInflight = null;
    this.productInflight.clear();
    this.moduleInflight.clear();
  }

  async loadOrders(): Promise<Order[]> {
    this.patch({ loading: true, error: null });
    const res = await firstValueFrom(this.ordersApi.list());
    if (!res.ok) {
      this.patch({
        loading: false,
        error: 'Не удалось загрузить заказы',
        orders: [],
        bars: [],
        ineligible: [],
      });
      return [];
    }
    const orders = res.data ?? [];
    this.patch({ loading: false, orders });
    return orders;
  }

  /**
   * Build estimate bars for one order, or for all provided orders (active multi).
   */
  async loadBarsForOrders(orders: Order[]): Promise<GanttBar[]> {
    this.patch({ loading: true, error: null, warnings: [], ineligible: [] });
    const warnings: string[] = [];
    const ineligible: GanttSkipInfo[] = [];
    try {
      const workTypes = await this.getWorkTypesMap();
      const workerDirectory = await this.getWorkerDirectory();
      // TZ-PRODUCTION-338 — warm the catalog in parallel; the sequential build below
      // then only walks the caches (same estimate math, same warnings).
      await this.prefetchCatalog(orders, warnings);
      const bars: GanttBar[] = [];

      for (const order of orders) {
        const orderWarnings: string[] = [];
        const input = await this.buildOrderEstimate(order, workTypes, orderWarnings);
        if (!orderHasGanttEstimate(input)) {
          ineligible.push({
            orderId: order._id,
            orderNumber: order.number,
            productNames: ganttSkipProductNames(input),
          });
          continue;
        }
        for (const warning of orderWarnings) {
          if (isGanttHeaderSpam(warning)) continue;
          warnings.push(warning);
        }
        bars.push(
          ...applyWorkerLabels(buildGanttBars(input), input.estimateWorkerOverrides, workerDirectory),
        );
      }

      this.patch({ loading: false, bars, warnings: [...warnings], ineligible });
      return bars;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка загрузки оценки';
      this.patch({ loading: false, error: message, bars: [], ineligible: [] });
      return [];
    }
  }

  /** Public tree for order inspector (same estimate path as Gantt). */
  async buildOrderEstimatePublic(order: Order): Promise<OrderEstimateInput> {
    const warnings: string[] = [];
    const workTypes = await this.getWorkTypesMap();
    return this.buildOrderEstimate(order, workTypes, warnings);
  }

  /** Candidate worker ids by skilled Work Type; assignment is resolved per Order override. */
  async getWorkerCandidates(workTypeId: string): Promise<Person[]> {
    const directory = await this.getWorkerDirectory();
    const ids = directory.idsByWorkType.get(workTypeId) ?? [];
    return ids.map((id) => directory.byId.get(id)).filter((person): person is Person => person != null);
  }

  async getWorkerCandidatesMap(workTypeIds: readonly string[]): Promise<Map<string, Person[]>> {
    const directory = await this.getWorkerDirectory();
    const result = new Map<string, Person[]>();
    for (const workTypeId of new Set(workTypeIds)) {
      const ids = directory.idsByWorkType.get(workTypeId) ?? [];
      result.set(
        workTypeId,
        ids.map((id) => directory.byId.get(id)).filter((person): person is Person => person != null),
      );
    }
    return result;
  }

  /** Map Work Type → skilled people labels for compatibility; not used as assignment data. */
  async getWorkerLabelsMap(): Promise<Map<string, string>> {
    const directory = await this.getWorkerDirectory();
    const out = new Map<string, string>();
    for (const [wtId, ids] of directory.idsByWorkType) {
      out.set(
        wtId,
        ids.map((id) => directory.byId.get(id)).filter((person): person is Person => person != null)
          .map(personDisplayName).join(', ') || '—',
      );
    }
    return out;
  }

  /** First populated product photo per order for the collapsed Orders rail. */
  async getOrderThumbMap(orders: Order[]): Promise<Map<string, string>> {
    const out = new Map<string, string>();
    const warnings: string[] = [];
    for (const order of orders) {
      const first = order.items?.[0];
      const productId = first?.productId;
      if (!productId) continue;
      const product = await this.getProduct(productId, warnings);
      if (!product) continue;
      const url = firstPhotoUrl(product.photoIds);
      if (url) out.set(order._id, url);
    }
    return out;
  }

  /**
   * TZ-PRODUCTION-338 — collect unique productIds across orders and fetch them
   * in parallel (reuses cache + inflight, so thumbs share calls with the bar build).
   */
  private async prefetchCatalog(orders: Order[], warnings: string[]): Promise<void> {
    const productIds = new Set<string>();
    for (const order of orders) {
      for (const item of order.items ?? []) {
        const productId = item.productId;
        if (productId && !this.productCache.has(productId)) productIds.add(productId);
      }
    }

    if (productIds.size > 0) {
      const ids = [...productIds];
      // Chunk by 50 to avoid URL length limits on GET requests
      for (let i = 0; i < ids.length; i += 50) {
        const chunk = ids.slice(i, i + 50);
        const res = await this.fetchWithThrottleRetry(() =>
          firstValueFrom(this.productsApi.getByIds(chunk)),
        );
        if (res.ok && res.data) {
          for (const product of res.data) {
            this.productCache.set(product._id, product);
          }
        }
      }
      for (const id of ids) {
        if (!this.productCache.has(id)) {
          warnings.push(`Изделие ${id} недоступно`);
          this.productCache.set(id, null);
        }
      }
    }

    const moduleIds = new Set<string>();
    for (const order of orders) {
      for (const item of order.items ?? []) {
        const productId = item.productId;
        if (!productId) continue;
        const product = this.productCache.get(productId) ?? null;
        if (!product) continue;
        const { moduleIds: ids } = extractDirectModuleIds(product);
        for (const id of ids) {
          if (!this.moduleCache.has(id)) moduleIds.add(id);
        }
      }
    }

    if (moduleIds.size > 0) {
      const ids = [...moduleIds];
      for (let i = 0; i < ids.length; i += 50) {
        const chunk = ids.slice(i, i + 50);
        const res = await this.fetchWithThrottleRetry(() =>
          firstValueFrom(this.modulesApi.getByIds(chunk)),
        );
        if (res.ok && res.data) {
          for (const mod of res.data) {
            this.moduleCache.set(mod._id, mod);
          }
        }
      }
      for (const id of ids) {
        if (!this.moduleCache.has(id)) {
          warnings.push(`Модль ${id} недоступен`);
          this.moduleCache.set(id, null);
        }
      }
    }
  }

  private patch(partial: Partial<ProductionReadState>): void {
    this.state.update((s) => ({ ...s, ...partial }));
  }

  private async getWorkTypesMap(): Promise<Map<string, WorkType>> {
    if (this.workTypesCache) return this.workTypesCache;
    if (this.workTypesInflight) return this.workTypesInflight;

    this.workTypesInflight = (async () => {
      const res = await firstValueFrom(this.workTypesApi.list({ activeOnly: false }));
      const map = new Map<string, WorkType>();
      if (res.ok) {
        for (const wt of res.data?.items ?? []) {
          map.set(wt._id, wt);
        }
      }
      this.workTypesCache = map;
      return map;
    })();

    try {
      return await this.workTypesInflight;
    } finally {
      this.workTypesInflight = null;
    }
  }

  /**
   * TZ-PRODUCTION-341 — retry transien throttle (429) / overload (503).
   * Never retries 404 or other client errors. Max attempts = 1 + RETRY_BACKOFF_MS.length.
   */
  private async fetchWithThrottleRetry<T>(
    request: () => Promise<SilentResult<T>>,
  ): Promise<SilentResult<T>> {
    let attempt = 0;
    for (;;) {
      const res = await request();
      if (res.ok) return res;
      const status = res.error.status;
      if (!isRetryableHttpStatus(status) || attempt >= RETRY_BACKOFF_MS.length) {
        return res;
      }
      await sleep(RETRY_BACKOFF_MS[attempt]!);
      attempt++;
    }
  }

  private async getProduct(id: string, warnings: string[]): Promise<Product | null> {
    if (this.productCache.has(id)) return this.productCache.get(id) ?? null;
    const inflight = this.productInflight.get(id);
    if (inflight) return inflight;

    const promise = (async () => {
      const res = await this.fetchWithThrottleRetry(() =>
        firstValueFrom(this.productsApi.getById(id)),
      );
      if (!res.ok || !res.data) {
        warnings.push(`Изделие ${id} недоступно`);
        this.productCache.set(id, null);
        return null;
      }
      this.productCache.set(id, res.data);
      return res.data;
    })();

    this.productInflight.set(id, promise);
    try {
      return await promise;
    } finally {
      this.productInflight.delete(id);
    }
  }

  private async getModule(id: string, warnings: string[]): Promise<ProductModule | null> {
    if (this.moduleCache.has(id)) return this.moduleCache.get(id) ?? null;
    const inflight = this.moduleInflight.get(id);
    if (inflight) return inflight;

    const promise = (async () => {
      const res = await this.fetchWithThrottleRetry(() =>
        firstValueFrom(this.modulesApi.getById(id)),
      );
      if (!res.ok || !res.data) {
        warnings.push(`Модль ${id} недоступен`);
        this.moduleCache.set(id, null);
        return null;
      }
      this.moduleCache.set(id, res.data);
      return res.data;
    })();

    this.moduleInflight.set(id, promise);
    try {
      return await promise;
    } finally {
      this.moduleInflight.delete(id);
    }
  }

  private async buildOrderEstimate(
    order: Order,
    workTypes: Map<string, WorkType>,
    warnings: string[],
  ): Promise<OrderEstimateInput> {
    const items = order.items ?? [];
    const estimateItems = [];

    for (let orderItemIndex = 0; orderItemIndex < items.length; orderItemIndex++) {
      const item = items[orderItemIndex];
      const productId = item.productId;
      if (!productId) {
        // TZ-PRODUCTION-336: no Gant header spam — toast only when selecting the order.
        continue;
      }

      const product = await this.getProduct(productId, warnings);
      if (!product) continue;

      const { moduleIds, usedLegacy } = extractDirectModuleIds(product);
      if (usedLegacy) {
        warnings.push(
          `Изделие «${product.name}»: состав через legacy productModuleIds (dual-read)`,
        );
      }
      // TZ-PRODUCTION-336: empty modules stay off the Gantt; no persistent header warning.

      const modules: DirectModuleRef[] = [];
      for (let mi = 0; mi < moduleIds.length; mi++) {
        const moduleId = moduleIds[mi];
        const mod = await this.getModule(moduleId, warnings);
        if (!mod) continue;

        let compositionSort = mi;
        for (const line of product.composition ?? []) {
          if (isModuleCompositionLine(line) && line.refId === moduleId) {
            compositionSort = line.sortOrder ?? mi;
            break;
          }
        }

        modules.push({
          moduleId: mod._id,
          moduleName: mod.name,
          sortOrder: compositionSort,
          workTypes: mapModuleWorkTypes(mod, workTypes),
          modulePhotoUrl: firstPhotoUrl(mod.photoIds),
        });
      }

      estimateItems.push({
        orderItemIndex,
        productId,
        productName: item.productName ?? product.name,
        quantity: item.quantity ?? 1,
        modules,
        productPhotoUrl: firstPhotoUrl(product.photoIds),
      });
    }

    return {
      orderId: order._id,
      orderNumber: order.number,
      status: order.status as OrderStatus,
      plannedDate: order.plannedDate,
      date: order.date,
      items: estimateItems,
      estimateDayOverrides: normalizeEstimateDayOverrides(order.estimateDayOverrides),
      estimateStartOffsets: normalizeEstimateStartOffsets(order.estimateStartOffsets),
      estimateWorkerOverrides: normalizeEstimateWorkerOverrides(order.estimateWorkerOverrides),
    };
  }

  private async getWorkerDirectory(): Promise<WorkerDirectory> {
    if (this.workersDirectoryCache) return this.workersDirectoryCache;
    if (this.workersInflight) return this.workersInflight;

    this.workersInflight = (async () => {
      const res = await firstValueFrom(this.workersApi.list({ limit: 100, isActive: true }));
      const byId = new Map<string, Person>();
      const idsByWorkType = new Map<string, string[]>();
      if (res.ok) {
        for (const person of res.data?.items ?? []) {
          byId.set(person._id, person);
          for (const wtId of person.workTypeIds ?? []) {
            const ids = idsByWorkType.get(wtId) ?? [];
            ids.push(person._id);
            idsByWorkType.set(wtId, ids);
          }
        }
      }
      const directory = { byId, idsByWorkType };
      this.workersDirectoryCache = directory;
      return directory;
    })();

    try {
      return await this.workersInflight;
    } finally {
      this.workersInflight = null;
    }
  }
}

function isGanttHeaderSpam(warning: string): boolean {
  return warning.includes('нет прямых модулей') || warning.includes('без изделия');
}

interface WorkerDirectory {
  byId: Map<string, Person>;
  idsByWorkType: Map<string, string[]>;
}

function applyWorkerLabels(
  bars: GanttBar[],
  overrides: readonly EstimateWorkerOverride[] | undefined,
  directory: WorkerDirectory,
): GanttBar[] {
  const byKey = new Map<string, readonly string[]>();
  for (const row of overrides ?? []) {
    byKey.set(`${row.orderItemIndex}|${row.moduleId}|${row.workTypeId}`, row.workerIds);
  }
  return bars.map((bar) => {
    const workerIds = byKey.get(`${bar.orderItemIndex}|${bar.moduleId}|${bar.workTypeId}`) ?? [];
    const workerLabel = workerIds
      .map((id) => directory.byId.get(id))
      .filter((person): person is Person => person != null)
      .map(personDisplayName)
      .filter(Boolean)
      .join(', ');
    return { ...bar, workerIds, workerLabel: workerLabel || 'Не назначен' };
  });
}

function normalizeEstimateDayOverrides(
  rows: Order['estimateDayOverrides'] | null | undefined,
): EstimateDayOverrideRef[] {
  if (!rows?.length) return [];
  const out: EstimateDayOverrideRef[] = [];
  for (const row of rows) {
    const moduleId = refId(row.moduleId as string | { _id?: string });
    const workTypeId = refId(row.workTypeId as string | { _id?: string });
    if (!moduleId || !workTypeId) continue;
    if (!Number.isInteger(row.orderItemIndex) || row.orderItemIndex < 0) continue;
    const days = typeof row.days === 'number' ? row.days : Number(row.days);
    if (!Number.isFinite(days) || days < 1) continue;
    out.push({
      orderItemIndex: row.orderItemIndex,
      moduleId,
      workTypeId,
      days: Math.floor(days),
    });
  }
  return out;
}

function normalizeEstimateWorkerOverrides(
  rows: Order['estimateWorkerOverrides'] | null | undefined,
): EstimateWorkerOverride[] {
  if (!rows?.length) return [];
  return rows
    .filter(
      (row) =>
        Number.isInteger(row.orderItemIndex) &&
        row.orderItemIndex >= 0 &&
        typeof row.moduleId === 'string' &&
        row.moduleId.length > 0 &&
        typeof row.workTypeId === 'string' &&
        row.workTypeId.length > 0,
    )
    .map((row) => ({
      orderItemIndex: row.orderItemIndex,
      moduleId: row.moduleId,
      workTypeId: row.workTypeId,
      workerIds: [...row.workerIds],
    }));
}

function normalizeEstimateStartOffsets(
  rows: Order['estimateStartOffsets'] | null | undefined,
): EstimateStartOffsetRef[] {
  if (!rows?.length) return [];
  const out: EstimateStartOffsetRef[] = [];
  for (const row of rows) {
    const moduleId = refId(row.moduleId as string | { _id?: string });
    const workTypeId = refId(row.workTypeId as string | { _id?: string });
    if (!moduleId || !workTypeId) continue;
    if (!Number.isInteger(row.orderItemIndex) || row.orderItemIndex < 0) continue;
    const offsetDays = typeof row.offsetDays === 'number' ? row.offsetDays : Number(row.offsetDays);
    if (!Number.isInteger(offsetDays) || offsetDays < 0) continue;
    out.push({
      orderItemIndex: row.orderItemIndex,
      moduleId,
      workTypeId,
      offsetDays,
    });
  }
  return out;
}