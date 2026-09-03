import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, Injector, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  PiDocTypesService,
  PiOrganizationsService,
  PiQuotationsService,
  PiStudioDocumentsService,
  type AttachOrganizationsPayload,
  type Organization,
  type Quotation,
  type QuotationFamilyMemberSummary,
  type QuotationFamilyResponse,
  type StudioDocument,
} from '@kppdf/data-access';
import { extractErrorMessage } from '@kppdf/util-http';
import { BadgeComponent } from '@kppdf/ui/badge';
import { AlertDialogComponent, PiDialogService } from '@kppdf/ui/dialog';
import { PiStatusBannerComponent } from '@kppdf/ui/status-banner';
import { PiToastService } from '@kppdf/ui/toast';
import { onDialogCloseOnce } from '../on-dialog-close-once';
import { findKpDocType } from '../studio/studio-kp-doc-type';
import { rememberStudioDocument } from '../studio/studio-session';
import {
  ProposalAttachOrgsDialogComponent,
  type AttachOrgsDialogData,
  type AttachOrgsItemPayload,
  type AttachOrgsResult,
} from './proposal-attach-orgs.dialog';

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
                  @if (row.status === 'accepted' && (row.familyRole ?? 'solo') !== 'variant') {
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
                  <button
                    class="pi-button pi-button-secondary"
                    type="button"
                    data-test="proposal-attach-orgs"
                    (click)="openAttachOrgs(row)"
                  >
                    Несколько фирм
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
                          <button
                            type="button"
                            class="text-xs underline underline-offset-2 hover:text-ink"
                            data-test="proposal-member-open-studio"
                            (click)="openVariantInStudio(member)"
                          >
                            В студии
                          </button>
                        </div>
                      } @empty {
                        <span class="text-muted-foreground">Нет вариантов фирм</span>
                      }
                      @if (family.variants.length > 0 && family.master.familyRole === 'master') {
                        <button
                          type="button"
                          class="text-xs underline underline-offset-2 hover:text-ink"
                          data-test="proposal-family-sync"
                          (click)="confirmSyncFromMaster(row)"
                        >
                          Синхронизировать состав с мастером
                        </button>
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
  private readonly docTypesApi = inject(PiDocTypesService);
  private readonly organizationsApi = inject(PiOrganizationsService);
  private readonly dialog = inject(PiDialogService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly toast = inject(PiToastService);

  private readonly orgRows = signal<readonly Organization[]>([]);

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

  private async loadFamily(row: Quotation): Promise<QuotationFamilyResponse | null> {
    this.familyLoadingId.set(row._id);
    this.familyError.set('');
    await this.ensureOrganizations();
    // Stale guard — the expand panel may have been closed during the fetch.
    if (this.expandedFamilyId() !== row._id) {
      this.familyLoadingId.set(null);
      return null;
    }
    const result = await firstValueFrom(this.quotationsApi.getFamily(row._id));
    if (this.expandedFamilyId() !== row._id) {
      this.familyLoadingId.set(null);
      return null; // closed while loading — ignore stale result
    }
    this.familyLoadingId.set(null);
    if (!result.ok) {
      this.familyError.set(extractErrorMessage(result.error));
      return null;
    }
    const family = result.data;
    this.familyByRow.update((all) => ({ ...all, [row._id]: family }));
    return family;
  }

  private async ensureOrganizations(): Promise<void> {
    if (this.orgsLoaded && this.orgRows().length > 0) return;
    this.orgsLoaded = true;
    const result = await firstValueFrom(this.organizationsApi.list({ limit: 100 }));
    if (!result.ok || !result.data) return;
    const items = result.data.items ?? [];
    this.orgRows.set(items);
    const byId: Record<string, string> = {};
    for (const org of items) {
      byId[org._id] = org.shortName ?? org.name;
    }
    this.orgNames.set(byId);
  }

  /** S44 — «Несколько фирм»: attach orgs as new variants, then refresh the expand panel. */
  openAttachOrgs(row: Quotation): void {
    void this.ensureOrganizations().then(() => {
      const family = this.familyByRow()[row._id];
      const existing = new Set((family?.variants ?? []).map((v) => v.organizationId));
      const data: AttachOrgsDialogData = {
        quotation: row,
        organizations: this.orgRows(),
        existingVariantOrgIds: existing,
      };
      const dialogRef = this.dialog.open<AttachOrgsResult>(ProposalAttachOrgsDialogComponent, {
        data,
        width: 'md',
        ariaLabel: 'Несколько фирм — добавить варианты КП',
        parentDestroyRef: this.destroyRef,
      });
      onDialogCloseOnce(dialogRef, this.injector, (result) => {
        if (!result || result.items.length === 0) return; // cancel — no POST
        void this.attachOrganizations(row, result.items);
      });
    });
  }

  private async attachOrganizations(
    row: Quotation,
    items: readonly AttachOrgsItemPayload[],
  ): Promise<void> {
    const payload: AttachOrganizationsPayload = { items };
    const result = await firstValueFrom(this.quotationsApi.attachOrganizations(row._id, payload));
    if (!result.ok) {
      this.toast.error('Не удалось добавить фирмы', {
        description: extractErrorMessage(result.error),
      });
      return;
    }
    this.familyByRow.update((all) => ({ ...all, [row._id]: result.data }));
    this.toast.success('Варианты добавлены');
    if (this.expandedFamilyId() === row._id) {
      await this.loadFamily(row);
    }
  }

  /** S45 — «Синхронизировать»: rewrite variant composition from master after explicit confirm. */
  confirmSyncFromMaster(row: Quotation): void {
    const ref = this.dialog.open<boolean>(AlertDialogComponent, {
      data: {
        title: 'Синхронизировать состав?',
        description: `Состав вариантов КП «${row.number}» будет перезаписан составом мастера.`,
        confirmLabel: 'Синхронизировать',
        cancelLabel: 'Отмена',
      },
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (confirmed) => {
      if (confirmed) void this.syncFamilyFromMaster(row);
    });
  }

  private async syncFamilyFromMaster(row: Quotation): Promise<void> {
    const result = await firstValueFrom(this.quotationsApi.syncFromMaster(row._id));
    if (!result.ok) {
      this.toast.error('Не удалось синхронизировать состав', {
        description: extractErrorMessage(result.error),
      });
      return;
    }
    this.familyByRow.update((all) => ({ ...all, [row._id]: result.data }));
    this.toast.success('Состав синхронизирован');
  }

  /** «Создать в студии» — same КП path as studio-list's «Новое КП»: pre-selects the КП doc type up front. */
  createInStudio(): void {
    void firstValueFrom(this.docTypesApi.list()).then((result) => {
      const kpDocType = result.ok ? findKpDocType(result.data) : undefined;
      if (!kpDocType) {
        void this.router.navigate(['/studio']);
        return;
      }
      const name = `КП ${new Date().toLocaleDateString('ru-RU')}`;
      void firstValueFrom(
        this.studioApi.create({ name, orientation: 'portrait', pageSize: 'A4', docTypeId: kpDocType._id }),
      ).then((created) => {
        if (!created.ok) {
          this.toast.error('Не удалось создать документ', { description: extractErrorMessage(created.error) });
          return;
        }
        rememberStudioDocument(created.data._id);
        void this.router.navigate(['/studio', created.data._id]);
      });
    });
  }

  openInStudio(quotation: Quotation): void {
    this.openQuotationInStudio(quotation._id, quotation.studioDocumentId);
  }

  /** S46 — variant rows in the family panel open the studio for their own quotation id. */
  openVariantInStudio(member: QuotationFamilyMemberSummary): void {
    this.openQuotationInStudio(member.id);
  }

  private openQuotationInStudio(quotationId: string, studioDocumentId?: string): void {
    const linked = studioDocumentId
      ?? this.studioDocs().find(
        (doc) =>
          doc.linkedQuotationId === quotationId
          || doc.context?.['quotationId'] === quotationId,
      )?._id;
    if (linked) {
      void this.router.navigate(['/studio', linked]);
      return;
    }
    void this.router.navigate(['/studio'], { queryParams: { quotationId } });
  }

  async convertToOrder(quotation: Quotation): Promise<void> {
    // S47 — variants are not convertible: only the master/solo row may become an order.
    if ((quotation.familyRole ?? 'solo') === 'variant') return;
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
