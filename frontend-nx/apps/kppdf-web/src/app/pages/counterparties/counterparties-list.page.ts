import { ChangeDetectionStrategy, Component, DestroyRef, Injector, OnInit, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PiCounterpartiesService, type Counterparty, type CreateCounterpartyPayload } from '@kppdf/data-access';
import { extractErrorMessage } from '@kppdf/util-http';
import { PiStatusBannerComponent } from '@kppdf/ui/status-banner';
import { ButtonComponent } from '@kppdf/ui/button';
import { PiRowActionsComponent } from '@kppdf/ui/row-actions';
import { AlertDialogComponent, PiDialogService } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import { onDialogCloseOnce } from '../on-dialog-close-once';
import { CounterpartyFormDialogComponent, type CounterpartyFormDialogData } from './counterparty-form-dialog.component';
import { CounterpartyHubTrayComponent } from './counterparty-hub-tray.component';

/**
 * Thin заказчики list (TZ-NX-DEALS-D3) — not the legacy full EAV editor.
 * Fields: название, ИНН, телефон/email, роли (default `['customer']`, hidden from the form).
 *
 * TZ-NX-HUB-01 — hub parity with `/registries`: denser rows, ▸/▾ single-expand
 * (mirrors `orders-list.page.ts`) opening `CounterpartyHubTrayComponent`, and
 * `app-pi-row-actions` icon buttons replacing the former wide text buttons.
 */
@Component({
  selector: 'pi-counterparties-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiStatusBannerComponent, ButtonComponent, PiRowActionsComponent, CounterpartyHubTrayComponent],
  template: `
    <main class="px-panel-inset py-6" data-test="counterparties-list">
      <div class="flex items-center justify-between gap-4 mb-6">
        <div>
          <div class="eyebrow">Клиенты</div>
          <h1 class="font-display text-2xl m-0">Заказчики</h1>
        </div>
        <app-pi-button variant="default" type="button" data-test="counterparty-create" (click)="openCreate()">
          Создать заказчика
        </app-pi-button>
      </div>

      @if (status() === 'loading') {
        <div class="text-sm text-muted-foreground" data-test="counterparties-loading">Загрузка…</div>
      }

      @if (status() === 'error') {
        <app-pi-status-banner
          tone="destructive"
          [message]="error()"
          actionLabel="Повторить"
          (action)="load()"
          data-test="counterparties-error"
        />
      }

      @if (status() === 'success' && rows().length === 0) {
        <div class="pi-dashed-panel p-8 text-center" data-test="counterparties-empty">
          Заказчиков пока нет.
        </div>
      }

      @if (status() === 'success' && rows().length > 0) {
        <div
          class="pi-table-surface hairline rounded-sm overflow-hidden bg-paper-raised"
          role="table"
          aria-label="Заказчики"
          data-test="counterparties-table"
        >
          <div class="grid grid-cols-[1.5rem_minmax(0,1.4fr)_minmax(8rem,0.9fr)_minmax(8rem,0.9fr)_minmax(6rem,0.6fr)] gap-4 px-4 py-2 text-xs text-muted-foreground hairline-bottom" role="row">
            <span role="columnheader" aria-hidden="true"></span>
            <span role="columnheader">Название</span>
            <span role="columnheader">ИНН</span>
            <span role="columnheader">Контакт</span>
            <span role="columnheader" aria-label="Действия"></span>
          </div>
          @for (row of rows(); track row._id) {
            <div
              class="grid grid-cols-[1.5rem_minmax(0,1.4fr)_minmax(8rem,0.9fr)_minmax(8rem,0.9fr)_minmax(6rem,0.6fr)] gap-4 items-center px-4 py-2 hairline-bottom last:border-b-0 cursor-pointer hover:bg-paper-2 pi-focus-ring"
              role="row"
              tabindex="0"
              data-test="counterparty-row"
              [attr.aria-expanded]="expandedId() === row._id"
              (click)="toggleExpand(row._id)"
              (keydown.enter)="toggleExpand(row._id)"
              (keydown.space)="onRowSpace($event, row._id)"
            >
              <span role="cell" aria-hidden="true" class="text-muted-foreground" data-test="counterparty-row-chevron">
                {{ expandedId() === row._id ? '▾' : '▸' }}
              </span>
              <span role="cell" class="min-w-0">
                <span class="font-medium truncate block">{{ row.shortName || row.name }}</span>
                @if (row.shortName && row.shortName !== row.name) {
                  <span class="text-xs text-muted-foreground truncate block" data-test="counterparty-full-name">
                    {{ row.name }}
                  </span>
                }
              </span>
              <span class="text-sm" role="cell">{{ row.inn }}{{ row.innIsStub ? ' (временный)' : '' }}</span>
              <span class="text-sm text-muted-foreground truncate" role="cell">{{ contactLabel(row) }}</span>
              <div class="flex items-center justify-end" role="cell" (click)="$event.stopPropagation()">
                <app-pi-row-actions
                  [row]="row"
                  editLabel="Редактировать заказчика"
                  dataTestEdit="counterparty-edit"
                  deleteLabel="Удалить заказчика"
                  dataTestDelete="counterparty-delete"
                  (edit)="openEdit($event)"
                  (delete)="confirmDelete($event)"
                />
              </div>
            </div>
            @if (expandedId() === row._id) {
              <app-counterparty-hub-tray [counterparty]="row" data-test="counterparty-row-expand" />
            }
          }
        </div>
      }
    </main>
  `,
})
export class CounterpartiesListPage implements OnInit {
  private readonly api = inject(PiCounterpartiesService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  readonly rows = signal<readonly Counterparty[]>([]);
  readonly status = signal<'loading' | 'success' | 'error'>('loading');
  readonly error = signal('Не удалось загрузить заказчиков.');

  /** Single expand (HUB pattern, mirrors `orders-list.page.ts`) — opening another row or reloading collapses it. */
  readonly expandedId = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.status.set('loading');
    this.expandedId.set(null);
    void firstValueFrom(this.api.list()).then((result) => {
      if (!result.ok) {
        this.error.set(extractErrorMessage(result.error));
        this.status.set('error');
        return;
      }
      this.rows.set(result.data?.items ?? []);
      this.status.set('success');
    });
  }

  contactLabel(row: Counterparty): string {
    const parts = [row.phone, row.email].filter((p): p is string => !!p);
    return parts.length > 0 ? parts.join(' · ') : '—';
  }

  toggleExpand(counterpartyId: string): void {
    this.expandedId.update((current) => (current === counterpartyId ? null : counterpartyId));
  }

  protected onRowSpace(event: Event, counterpartyId: string): void {
    event.preventDefault();
    this.toggleExpand(counterpartyId);
  }

  openCreate(): void {
    const data: CounterpartyFormDialogData = {};
    const ref = this.dialog.open<CreateCounterpartyPayload | undefined>(CounterpartyFormDialogComponent, {
      data,
      width: 'sm',
      ariaLabel: 'Создать заказчика',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (payload) => {
      if (!payload) return;
      void this.create(payload);
    });
  }

  openEdit(row: Counterparty): void {
    const data: CounterpartyFormDialogData = { counterparty: row };
    const ref = this.dialog.open<CreateCounterpartyPayload | undefined>(CounterpartyFormDialogComponent, {
      data,
      width: 'sm',
      ariaLabel: 'Редактировать заказчика',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (payload) => {
      if (!payload) return;
      void this.update(row._id, payload);
    });
  }

  confirmDelete(row: Counterparty): void {
    const ref = this.dialog.open<boolean>(AlertDialogComponent, {
      data: {
        title: 'Удалить заказчика?',
        description: `«${row.name}» будет удалён.`,
        confirmLabel: 'Удалить',
        cancelLabel: 'Отмена',
        variant: 'destructive',
      },
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (confirmed) => {
      if (confirmed) void this.remove(row._id);
    });
  }

  private async create(payload: CreateCounterpartyPayload): Promise<void> {
    const result = await firstValueFrom(this.api.create(payload));
    if (!result.ok) {
      this.toast.error('Не удалось создать заказчика', { description: extractErrorMessage(result.error) });
      return;
    }
    this.toast.success('Заказчик создан');
    this.load();
  }

  private async update(id: string, payload: CreateCounterpartyPayload): Promise<void> {
    const result = await firstValueFrom(this.api.update(id, payload));
    if (!result.ok) {
      this.toast.error('Не удалось сохранить заказчика', { description: extractErrorMessage(result.error) });
      return;
    }
    this.toast.success('Заказчик сохранён');
    this.load();
  }

  private async remove(id: string): Promise<void> {
    const result = await firstValueFrom(this.api.remove(id));
    if (!result.ok) {
      this.toast.error('Не удалось удалить заказчика', { description: extractErrorMessage(result.error) });
      return;
    }
    this.toast.success('Заказчик удалён');
    this.load();
  }
}
