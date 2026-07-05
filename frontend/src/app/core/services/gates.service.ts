import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../tokens';
import { GATE_MAP, GateEntry } from '../../configs/gates.config';
import { AuthService } from './auth.service';

/**
 * Runtime gate overrides served by the `feature-flag` backend collection.
 *
 * Naming convention: every gate that has been overridden lives under the key
 * `gate:{pageId}` with `category: 'gate'`. The TZ-05 FeatureFlag service
 * upserts on PUT, so the FIRST admin click creates the row; until then
 * there is no override and the static `gates.config.ts` value wins.
 */
export interface GateFeatureFlag {
  _id?: string;
  key: string;
  label: string;
  description?: string;
  enabledByDefault: boolean;
  category: string;
  isActive: boolean;
  enabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GateView {
  id: string;
  static: GateEntry;
  override?: GateFeatureFlag;
  effective: boolean;
}

const GATE_PREFIX = 'gate:';
const GATE_CATEGORY = 'gate';

@Injectable({ providedIn: 'root' })
export class GatesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly auth = inject(AuthService);

  /** Runtime overrides keyed by page id (no 'gate:' prefix). */
  private readonly overrides = signal<Record<string, GateFeatureFlag>>({});

  readonly loading = signal<boolean>(false);
  readonly lastError = signal<string | null>(null);
  readonly lastLoadedAt = signal<number | null>(null);

  /** Combined view: each static gate plus its override (if any) + effective state. */
  readonly entries = computed<GateView[]>(() => {
    const ov = this.overrides();
    return Object.values(GATE_MAP).map((sg) => {
      const o = ov[sg.id];
      const effective = !o ? sg.enabled : o.isActive && o.enabledByDefault;
      return { id: sg.id, static: sg, override: o, effective };
    });
  });

  /** O(1) effective lookup map. Reactive — re-evaluates when overrides change. */
  readonly effectiveMap = computed<Record<string, boolean>>(() => {
    const map = this.overrides();
    const out: Record<string, boolean> = {};
    for (const sg of Object.values(GATE_MAP)) {
      const o = map[sg.id];
      out[sg.id] = !o ? sg.enabled : o.isActive && o.enabledByDefault;
    }
    return out;
  });

  readonly enabledCount = computed(
    () => this.entries().filter((e) => e.effective).length,
  );

  readonly overriddenCount = computed(
    () => this.entries().filter((e) => !!e.override).length,
  );

  constructor() {
    // Auto-load on login (admin/manager only — feature-flag endpoint is gated
    // server-side, so `user` role would 403). Clear cache on logout AND on a
    // role flip that loses read access (avoids stale admin overrides leaking
    // into a `user`-mode session).
    let lastAuthKey: string | null = null;
    effect(() => {
      const role = this.auth.role();
      const isAuth = !!role;
      if (isAuth && lastAuthKey !== role) {
        lastAuthKey = role;
        if (role === 'admin' || role === 'manager') {
          this.refresh().subscribe({ error: () => undefined });
        } else {
          // Became a role with no read access — drop stale cache.
          this.overrides.set({});
          this.lastLoadedAt.set(null);
        }
      } else if (!isAuth && lastAuthKey !== null) {
        lastAuthKey = null;
        this.overrides.set({});
        this.lastLoadedAt.set(null);
      }
    });
  }

  /** Reactive lookup. Must be called inside a `computed()` for reactivity. */
  isPageEnabled(id: string): boolean {
    return this.effectiveMap()[id] ?? true;
  }

  /** Filter any `{ id: string }[]` list through the gate — reactive when used in `computed`. */
  filterEnabled<T extends { id: string }>(items: T[]): T[] {
    const map = this.effectiveMap();
    return items.filter((p) => map[p.id] ?? true);
  }

  /** GET /feature-flags → populate overrides. Returns the cached observable for chaining. */
  refresh(): Observable<GateFeatureFlag[]> {
    this.loading.set(true);
    this.lastError.set(null);
    return this.http.get<GateFeatureFlag[]>(`${this.baseUrl}/feature-flags`).pipe(
      tap({
        next: (flags) => {
          const map: Record<string, GateFeatureFlag> = {};
          for (const f of flags ?? []) {
            if (typeof f.key === 'string' && f.key.startsWith(GATE_PREFIX)) {
              const id = f.key.slice(GATE_PREFIX.length);
              map[id] = f;
            }
          }
          this.overrides.set(map);
          this.lastLoadedAt.set(Date.now());
        },
        error: (err) => {
          this.lastError.set(err?.error?.message ?? err?.message ?? 'Load failed');
        },
        complete: () => {
          this.loading.set(false);
        },
      }),
    );
  }

  /**
   * Optimistic toggle. Updates the signal IMMEDIATELY, then PUTs to backend.
   * On error, rolls back to the previous state and surfaces the message via `lastError`.
   */
  async toggle(
    id: string,
    enabled: boolean,
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    if (!GATE_MAP[id]) {
      return { ok: false, error: `Unknown gate: ${id}` };
    }
    const prev = this.overrides()[id];
    const optimistic: GateFeatureFlag = {
      ...(prev ?? {}),
      key: GATE_PREFIX + id,
      label: `Gate: ${id}`,
      enabledByDefault: enabled,
      category: GATE_CATEGORY,
      isActive: true,
      updatedAt: new Date().toISOString(),
    };
    this.overrides.update((m) => ({ ...m, [id]: optimistic }));
    this.lastError.set(null);
    try {
      const saved = await this.http
        .put<GateFeatureFlag>(
          `${this.baseUrl}/feature-flags/${GATE_PREFIX + id}`,
          {
            label: optimistic.label,
            enabledByDefault: enabled,
            category: GATE_CATEGORY,
            isActive: true,
          },
        )
        .toPromise();
      if (saved) {
        this.overrides.update((m) => ({ ...m, [id]: saved }));
      }
      return { ok: true };
    } catch (err: unknown) {
      // Rollback
      this.overrides.update((m) => {
        const m2 = { ...m };
        if (prev) {
          m2[id] = prev;
        } else {
          delete m2[id];
        }
        return m2;
      });
      const msg =
        (err as { error?: { message?: string }; message?: string })?.error?.message ??
        (err as { message?: string })?.message ??
        'Toggle failed';
      this.lastError.set(msg);
      return { ok: false, error: msg };
    }
  }
}
