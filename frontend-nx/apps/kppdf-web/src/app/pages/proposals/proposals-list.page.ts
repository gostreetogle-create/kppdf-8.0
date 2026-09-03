import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  PiOrganizationsService,
  PiQuotationsService,
  PiStudioDocumentsService,
  type Quotation,
  type QuotationFamilyResponse,
  type StudioDocument,
} from '@kppdf/data-access';
import { extractErrorMessage } from '@kppdf/util-http';
import { BadgeComponent } from '@kppdf/ui/badge';
import { PiStatusBannerComponent } from '@kppdf/ui/status-banner';
import { PiToastService } from '@kppdf/ui/toast';

const STATUS_LABELS: Record<string, string> = {
  draft: 'Черновик',
  sent: 'На проверке',
  accepted: 'Принято',
  rejected: 'Отклонено',
  converted: 'В заказе',
  cancelled: 'Отменено',
};

@Component({
  selector: 'pi-proposals-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiStatusBannerComponent, BadgeComponent],
  template: `
    <main class="px-panel-inset py-6" data-test="proposals-list">
      <div class="flex items-center justify-between gap-4 mb-6">
        <div>
          <div class="eyebrow">Коммерция</div>
          <h1 class="font-display text-2xl m-0">Коммерческие предложения</h1>
        </div>
        <button class="pi-button pi-button-primary" type="button" data-test="proposals-create" (click)="createInStudio()">
          Создать в студии
        </button>
      </div>
      @if (status() === 'loading') {
        <div class="text-sm text-muted-foreground">Загрузка…</div>
      }
      @if (status() === 'error') {
        <app-pi-status-banner tone="destructive" [message]="error()" actionLabel="Повторить" (action)="load()" />
      }
      @if (status() === 'success' && filtered().length === 0) {
        <div class="pi-dashed-panel p-8 text-center">КП не найдены.</div>
      }
      @if (status() === 'success' && filtered().length > 0) {
        <div class="pi-table-surface hairline rounded-sm overflow-hidden bg-paper-raised">
          @for (row of filtered(); track row._id) {
            <div class="flex items-center justify-between gap-4 px-4 py-3 hairline-bottom" data-test="proposal-row">
              <div>
                <div class="flex items-center gap-2">
                  <div class="font-medium">{{ row.number }}</div>
                  @if ((row.familyRole ?? 'solo') === 'master') {
                    <app-pi-badge variant="outline" data-test="proposal-family-badge">Семья</app-pi-badge>
                  }
                </div>
                <div class="text-xs text-muted-foreground">{{ statusLabel(row.status) }}</div>
              </div>
              <div class="flex flex-col items-end gap-1">
                <div class="flex items-center gap-2">
                  @if (row.status === 'accepted') {
                    <button
                      class="pi-button pi-button-primary"
                      type="button"
                      data-test="proposal-convert-order"
                      (click)="convertToOrder(row)"
                      [disabled]="convertingId() === row._id"
                    >
                      {{ convertingId() === row._id ? 'Преобразование…' : 'В заказ' }}
                    </button>
                  }
                  <button class="pi-button pi-button-secondary" type="button" data-test="proposal-open-studio" (click)="openInStudio(row)">
                    В студии
                  </button>
                </div>
                <button
                  type="button"
                  class="text-xs underline underline-offset-2 hover:text-ink disabled:opacity-40"
                  data-test="proposal-family-expand"
                  (click)="toggleFamily(row)"
                >
                  {{ expandedFamilyId() === row._id ? 'Скрыть семью' : 'Семья' }}
                </button>
                @if (expandedFamilyId() === row._id) {
                  <div class="flex flex-col items-end gap-1 max-w-[18rem] text-xs" data-test="proposal-family-list">
                    @if (familyLoadingId() === row._id) {
                      <span class="text-muted-foreground">Загрузка…</span>
                    } @else if (familyError()) {
                      <app-pi-status-banner tone="destructive" [message]="familyError()" actionLabel="Повторить" (action)="reloadFamily(row)" />
                    } @else if (familyByRow()[row._id]; as family) {
                      @for (member of family.variants; track member.id) {
                        <div class="flex items-center justify-end gap-2" data-test="proposal-family-member">
                          <span class="font-medium">{{ orgNameOf(member.organizationId) }}</span>
                          <span class="text-muted-foreground">
                            {{ member.number }} · {{ member.orgMarkupPercent ?? 0 }}% · {{ statusLabel(member.status) }}
                          </span>
                        </div>
                      } @empty {
                        <span class="text-muted-foreground">Нет вариантов фирм</span>
                      }
                    }
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }
    </main>
  `,
})
export class ProposalsListPage implements OnInit {
  private readonly quotationsApi = inject(PiQuotationsService);
  private readonly studioApi = inject(PiStudioDocumentsService);
  private readonly organizationsApi = inject(PiOrganizationsService);
  private readonly router = inject(Router);
  private readonly toast = inject(PiToastService);

  readonly rows = signal<readonly Quotation[]>([]);
  readonly studioDocs = signal<readonly StudioDocument[]>([]);
  readonly status = signal<'loading' | 'success' | 'error'>('loading');
  readonly error = signal('Не удалось загрузить КП.');
  readonly convertingId = signal<string | null>(null);

  /** KP family expand (S43) — one open panel at a time, per-row cache. */
  readonly expandedFamilyId = signal<string | null>(null);
  readonly familyByRow = signal<Record<string, QuotationFamilyResponse>>({});
  readonly familyLoadingId = signal<string | null>(null);
  readonly familyError = signal('');
  readonly orgNames = signal<Record<string, string>>({});
  private orgsLoaded = false;

  readonly filtered = computed(() =>
    this.rows().filter(
      (row) => row.status !== 'cancelled' && (row.familyRole ?? 'solo') !== 'variant',
    ),
  );

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.status.set('loading');
    void Promise.all([
      firstValueFrom(this.quotationsApi.list()),
      firstValueFrom(this.studioApi.list()),
    ]).then(([quotations, studio]) => {
      if (!quotations.ok) {
        this.error.set(String(quotations.error));
        this.status.set('error');
        return;
      }
      this.rows.set(quotations.data ?? []);
      if (studio.ok) this.studioDocs.set(studio.data ?? []);
      this.status.set('success');
    });
  }

  statusLabel(status?: string): string {
    return status ? (STATUS_LABELS[status] ?? status) : '—';
  }

  /** S43 — org display name for a family variant (lazy-loaded once). */
  orgNameOf(organizationId: string): string {
    return this.orgNames()[organizationId] ?? organizationId;
  }

  async toggleFamily(row: Quotation): Promise<void> {
    if (this.expandedFamilyId() === row._id) {
      this.expandedFamilyId.set(null);
      this.familyLoadingId.set(null);
      return;
    }
    this.expandedFamilyId.set(row._id);
    if (this.familyByRow()[row._id]) return; // cached — no refetch
    await this.loadFamily(row);
  }

  reloadFamily(row: Quotation): void {
    void this.loadFamily(row);
  }

  private async loadFamily(row: Quotation): Promise<void> {
    this.familyLoadingId.set(row._id);
    this.familyError.set('');
    await this.ensureOrganizations();
    // Stale guard — the expand panel may have been closed during the fetch.
    if (this.expandedFamilyId() !== row._id) {
      this.familyLoadingId.set(null);
      return;
    }
    const result = await firstValueFrom(this.quotationsApi.getFamily(row._id));
    if (this.expandedFamilyId() !== row._id) {
      this.familyLoadingId.set(null);
      return; // closed while loading — ignore stale result
    }
    this.familyLoadingId.set(null);
    if (!result.ok) {
      this.familyError.set(extractErrorMessage(result.error));
      return;
    }
    const family = result.data;
    this.familyByRow.update((all) => ({ ...all, [row._id]: family }));
  }

  private async ensureOrganizations(): Promise<void> {
    if (this.orgsLoaded) return;
    this.orgsLoaded = true;
    const result = await firstValueFrom(this.organizationsApi.list({ limit: 100 }));
    if (!result.ok || !result.data) return;
    const byId: Record<string, string> = {};
    for (const org of result.data.items) {
      byId[org._id] = org.shortName ?? org.name;
    }
    this.orgNames.set(byId);
  }

  createInStudio(): void {
    void this.router.navigate(['/studio']);
  }

  openInStudio(quotation: Quotation): void {
    const linked = quotation.studioDocumentId
      ?? this.studioDocs().find(
        (doc) =>
          doc.linkedQuotationId === quotation._id
          || doc.context?.['quotationId'] === quotation._id,
      )?._id;
    if (linked) {
      void this.router.navigate(['/studio', linked]);
      return;
    }
    void this.router.navigate(['/studio'], { queryParams: { quotationId: quotation._id } });
  }

  async convertToOrder(quotation: Quotation): Promise<void> {
    if (quotation.status !== 'accepted' || this.convertingId() !== null) return;
    this.convertingId.set(quotation._id);
    const result = await firstValueFrom(this.quotationsApi.convertToOrder(quotation._id));
    this.convertingId.set(null);
    if (!result.ok) {
      this.toast.error('Не удалось преобразовать КП в заказ', {
        description: extractErrorMessage(result.error),
      });
      return;
    }
    const orderId = result.data?.orderId;
    if (orderId) void this.router.navigate(['/orders', orderId]);
  }
}
