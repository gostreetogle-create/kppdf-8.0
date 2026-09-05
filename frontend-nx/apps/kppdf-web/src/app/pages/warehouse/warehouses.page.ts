import { ChangeDetectionStrategy, Component, DestroyRef, Injector, OnInit, inject, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PiWarehousesService, type Warehouse, type WarehouseWritePayload } from '@kppdf/data-access';
import { extractErrorMessage } from '@kppdf/util-http';
import { PiStatusBannerComponent } from '@kppdf/ui/status-banner';
import { AlertDialogComponent, PiDialogService } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import { onDialogCloseOnce } from '../on-dialog-close-once';
import { WarehouseFormDialogComponent, type WarehouseFormDialogData } from './warehouse-form-dialog.component';

@Component({
  selector: 'pi-warehouses-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiStatusBannerComponent],
  template: `
    <main class="px-panel-inset py-6" data-test="warehouses-page">
      <div class="flex items-center justify-between gap-4 mb-6">
        <div>
          <div class="eyebrow">Склад</div>
          <h1 class="font-display text-2xl m-0">Склады</h1>
        </div>
        <button class="pi-button pi-button-primary" type="button" (click)="openCreate()" data-test="warehouse-create">
          Создать склад
        </button>
      </div>

      <div class="flex items-center gap-3 mb-4">
        <label class="sr-only" for="warehouse-search">Поиск складов</label>
        <input
          id="warehouse-search"
          type="search"
          class="pi-input w-64 pi-focus-ring"
          placeholder="Поиск по названию…"
          [value]="search()"
          (input)="onSearch($event)"
          data-test="warehouse-search"
        />
        <span class="text-sm text-muted-foreground">{{ filteredRows().length }} складов</span>
      </div>

      @if (status() === 'loading') {
        <div class="text-sm text-muted-foreground" data-test="warehouses-loading">Загрузка…</div>
      }
      @if (status() === 'error') {
        <app-pi-status-banner
          tone="destructive"
          [message]="error()"
          actionLabel="Повторить"
          (action)="load()"
          data-test="warehouses-error"
        />
      }
      @if (status() === 'success' && filteredRows().length === 0) {
        <div class="pi-dashed-panel p-8 text-center" data-test="warehouses-empty">
          {{ search().trim() ? 'По вашему запросу ничего не найдено.' : 'Складов пока нет.' }}
        </div>
      }
      @if (status() === 'success' && filteredRows().length > 0) {
        <div class="pi-table-surface hairline rounded-sm overflow-hidden bg-paper-raised" role="table" aria-label="Склады" data-test="warehouses-table">
          <div class="grid grid-cols-[minmax(0,1fr)_minmax(7rem,0.35fr)_minmax(10rem,0.7fr)] gap-4 px-4 py-2 text-xs text-muted-foreground hairline-bottom" role="row">
            <span role="columnheader">Название</span>
            <span role="columnheader">Статус</span>
            <span role="columnheader" aria-label="Действия"></span>
          </div>
          @for (row of filteredRows(); track row._id) {
            <div class="grid grid-cols-[minmax(0,1fr)_minmax(7rem,0.35fr)_minmax(10rem,0.7fr)] gap-4 items-center px-4 py-3 hairline-bottom last:border-b-0" role="row" data-test="warehouse-row">
              <div role="cell">
                <div class="font-medium truncate">{{ row.name }}</div>
                @if (row.description) {
                  <div class="text-xs text-muted-foreground truncate">{{ row.description }}</div>
                }
              </div>
              <span class="text-sm" role="cell" [class.text-muted-foreground]="!row.isActive">{{ row.isActive ? 'Активен' : 'Неактивен' }}</span>
              <div class="flex items-center gap-2 justify-end" role="cell">
                <button class="pi-button pi-button-secondary" type="button" (click)="openEdit(row)" data-test="warehouse-edit">Изменить</button>
                <button class="pi-button pi-button-secondary" type="button" (click)="confirmDelete(row)" data-test="warehouse-delete">Удалить</button>
              </div>
            </div>
          }
        </div>
      }
    </main>
  `,
})
export class WarehousesPage implements OnInit {
  private readonly api = inject(PiWarehousesService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  readonly rows = signal<readonly Warehouse[]>([]);
  readonly status = signal<'loading' | 'success' | 'error'>('loading');
  readonly error = signal('Не удалось загрузить склады.');
  readonly search = signal('');
  readonly filteredRows = computed(() => {
    const query = this.search().trim().toLowerCase();
    return query ? this.rows().filter((row) => row.name.toLowerCase().includes(query)) : this.rows();
  });

  ngOnInit(): void {
    this.load();
  }

  onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  load(): void {
    this.status.set('loading');
    void firstValueFrom(this.api.list()).then((result) => {
      if (!result.ok) {
        this.error.set(extractErrorMessage(result.error));
        this.status.set('error');
        return;
      }
      this.rows.set(result.data ?? []);
      this.status.set('success');
    });
  }

  openCreate(): void {
    const ref = this.dialog.open<WarehouseWritePayload | undefined>(WarehouseFormDialogComponent, {
      data: {} satisfies WarehouseFormDialogData,
      width: 'sm',
      ariaLabel: 'Создать склад',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (payload) => {
      if (payload) void this.create(payload);
    });
  }

  openEdit(row: Warehouse): void {
    const ref = this.dialog.open<WarehouseWritePayload | undefined>(WarehouseFormDialogComponent, {
      data: { warehouse: row } satisfies WarehouseFormDialogData,
      width: 'sm',
      ariaLabel: 'Изменить склад',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (payload) => {
      if (payload) void this.update(row._id, payload);
    });
  }

  confirmDelete(row: Warehouse): void {
    const ref = this.dialog.open<boolean>(AlertDialogComponent, {
      data: {
        title: 'Удалить склад?',
        description: `«${row.name}» будет удалён.`,
        confirmLabel: 'Удалить',
        cancelLabel: 'Отмена',
        variant: 'destructive',
      },
      width: 'sm',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (confirmed) => {
      if (confirmed) void this.remove(row._id);
    });
  }

  private async create(payload: WarehouseWritePayload): Promise<void> {
    const result = await firstValueFrom(this.api.create(payload));
    if (!result.ok) {
      this.toast.error('Не удалось создать склад', { description: extractErrorMessage(result.error) });
      return;
    }
    this.toast.success('Склад создан');
    this.load();
  }

  private async update(id: string, payload: WarehouseWritePayload): Promise<void> {
    const result = await firstValueFrom(this.api.update(id, payload));
    if (!result.ok) {
      this.toast.error('Не удалось сохранить склад', { description: extractErrorMessage(result.error) });
      return;
    }
    this.toast.success('Склад сохранён');
    this.load();
  }

  private async remove(id: string): Promise<void> {
    const result = await firstValueFrom(this.api.remove(id));
    if (!result.ok) {
      this.toast.error('Не удалось удалить склад', { description: extractErrorMessage(result.error) });
      return;
    }
    this.toast.success('Склад удалён');
    this.load();
  }
}
