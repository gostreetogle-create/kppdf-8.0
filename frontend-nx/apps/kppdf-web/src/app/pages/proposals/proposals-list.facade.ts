/**
 * TZ-NX-PROPOSALS-LIST-FACADE — domain facade for `ProposalsListPage`.
 *
 * Owns: list/family-expand/cache signals and every load/attach/sync/
 * studio-bridge/convert-to-order method — moved as-is from the page.
 * Convert-to-order and studio bridge semantics unchanged; no legacy KP
 * workspace ported.
 */
import { DestroyRef, Injectable, Injector, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  PiDocTypesService,
  PiOrganizationsService,
  PiQuotationsService,
  PiStudioDocumentsService,
  quotationCounterpartyName,
  type AttachOrganizationsPayload,
  type Organization,
  type Quotation,
  type QuotationFamilyMemberSummary,
  type QuotationFamilyResponse,
  type StudioDocument,
} from '@kppdf/data-access';
import { extractErrorMessage } from '@kppdf/util-http';
import { AlertDialogComponent, PiDialogService } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import { onDialogCloseOnce } from '../on-dialog-close-once';
import { findKpDocType, rememberStudioDocument } from '@kppdf/features/doc-studio';
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

@Injectable()
export class ProposalsListFacade {
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
    this.rows().filter((row) => row.status !== 'cancelled' && (row.familyRole ?? 'solo') !== 'variant'),
  );

  constructor() {
    this.load();
  }

  load(): void {
    this.status.set('loading');
    void Promise.all([firstValueFrom(this.quotationsApi.list()), firstValueFrom(this.studioApi.list())]).then(
      ([quotations, studio]) => {
        if (!quotations.ok) {
          this.error.set(String(quotations.error));
          this.status.set('error');
          return;
        }
        this.rows.set(quotations.data ?? []);
        if (studio.ok) this.studioDocs.set(studio.data ?? []);
        this.status.set('success');
      },
    );
  }

  statusLabel(status?: string): string {
    return status ? (STATUS_LABELS[status] ?? status) : '—';
  }

  counterpartyName(row: Quotation): string | null {
    return quotationCounterpartyName(row);
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

  private async attachOrganizations(row: Quotation, items: readonly AttachOrgsItemPayload[]): Promise<void> {
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
    const linked =
      studioDocumentId ??
      this.studioDocs().find(
        (doc) => doc.linkedQuotationId === quotationId || doc.context?.['quotationId'] === quotationId,
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
