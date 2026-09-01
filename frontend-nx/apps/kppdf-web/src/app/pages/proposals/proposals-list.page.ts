import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PiQuotationsService, PiStudioDocumentsService, type Quotation, type StudioDocument } from '@kppdf/data-access';
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
  imports: [PiStatusBannerComponent],
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
                <div class="font-medium">{{ row.number }}</div>
                <div class="text-xs text-muted-foreground">{{ statusLabel(row.status) }}</div>
              </div>
              <div class="flex items-center gap-2">
                <button class="pi-button pi-button-secondary" type="button" data-test="proposal-open-studio" (click)="openInStudio(row)">
                  В студии
                </button>
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
  private readonly router = inject(Router);
  private readonly toast = inject(PiToastService);

  readonly rows = signal<readonly Quotation[]>([]);
  readonly studioDocs = signal<readonly StudioDocument[]>([]);
  readonly status = signal<'loading' | 'success' | 'error'>('loading');
  readonly error = signal('Не удалось загрузить КП.');
  readonly filtered = computed(() =>
    this.rows().filter((row) => row.status !== 'cancelled'),
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
}
