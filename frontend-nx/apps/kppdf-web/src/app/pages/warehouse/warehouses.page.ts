import { ChangeDetectionStrategy, Component, DestroyRef, Injector, OnInit, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  PiStorageItemsService,
  PiWarehousesService,
  storageItemName,
  type StorageItem,
  type Warehouse,
  type WarehouseWritePayload,
} from '@kppdf/data-access';
import { extractErrorMessage } from '@kppdf/util-http';
import { PiStatusBannerComponent } from '@kppdf/ui/status-banner';
import { ButtonComponent } from '@kppdf/ui/button';
import { PiRowActionsComponent } from '@kppdf/ui/row-actions';
import { AlertDialogComponent, PiDialogService } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import { PiGroupWorkspaceComponent } from '@kppdf/features';
import { WAREHOUSE_TOC_CHIPS } from '../warehouse-group-chips';
import { onDialogCloseOnce } from '../on-dialog-close-once';
import { WarehouseFormDialogComponent, type WarehouseFormDialogData } from './warehouse-form-dialog.component';

/** Hub expand preview stays short — full balances live on `/storage-items`. */
const EXPAND_ITEMS_LIMIT = 8;

@Component({
  selector: 'pi-warehouses-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiStatusBannerComponent, ButtonComponent, PiRowActionsComponent, RouterLink, PiGroupWorkspaceComponent],
  template: `
    <app-pi-group-workspace [toc]="toc" tocActiveId="warehouses" [chips]="[]" activeId="">
    <main class="py-6" data-test="warehouses-page">
      <div class="flex items-center justify-between gap-4 mb-6">
        <div>
          <div class="eyebrow">Склад</div>
          <h1 class="font-display text-2xl m-0">Склады</h1>
        </div>
        <app-pi-button variant="default" type="button" (click)="openCreate()" data-test="warehouse-create">
          Создать склад
        </app-pi-button>
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
          <div class="grid grid-cols-[1.5rem_minmax(0,1fr)_minmax(7rem,0.35fr)_minmax(9rem,0.6fr)] gap-4 px-4 py-2 text-xs text-muted-foreground hairline-bottom" role="row">
            <span role="columnheader" aria-hidden="true"></span>
            <span role="columnheader">Название</span>
            <span role="columnheader">Статус</span>
            <span role="columnheader" aria-label="Действия"></span>
          </div>
          @for (row of filteredRows(); track row._id) {
            <div
              class="grid grid-cols-[1.5rem_minmax(0,1fr)_minmax(7rem,0.35fr)_minmax(9rem,0.6fr)] gap-4 items-center px-4 py-2 hairline-bottom last:border-b-0 cursor-pointer hover:bg-paper-2 pi-focus-ring border-l-2"
              role="row"
              data-test="warehouse-row"
              tabindex="0"
              [class.bg-paper-2]="expandedId() === row._id"
              [class.border-l-gold-deep]="expandedId() === row._id"
              [class.border-l-transparent]="expandedId() !== row._id"
              [attr.aria-expanded]="expandedId() === row._id"
              (click)="toggleExpand(row._id)"
              (keydown.enter)="toggleExpand(row._id)"
              (keydown.space)="onRowSpace($event, row._id)"
            >
              <span role="cell" aria-hidden="true" class="text-muted-foreground" data-test="warehouse-row-chevron">
                {{ expandedId() === row._id ? '▾' : '▸' }}
              </span>
              <div role="cell">
                <div class="font-medium truncate flex items-center gap-1.5">
                  {{ row.name }}
                  @if (row.isDefault) {
                    <span class="text-xs text-muted-foreground" data-test="warehouse-default-badge">★ по умолчанию</span>
                  }
                </div>
                @if (row.description) {
                  <div class="text-xs text-muted-foreground truncate">{{ row.description }}</div>
                }
              </div>
              <span class="text-sm" role="cell" [class.text-muted-foreground]="!row.isActive">{{ row.isActive ? 'Активен' : 'Неактивен' }}</span>
              <div class="flex items-center justify-end gap-2" role="cell" (click)="$event.stopPropagation()">
                @if (!row.isDefault) {
                  <button
                    type="button"
                    class="pi-icon-btn pi-focus-ring"
                    aria-label="Сделать складом по умолчанию"
                    data-test="warehouse-make-default"
                    (click)="makeDefault(row)"
                  >
                    <span aria-hidden="true">★</span>
                  </button>
                }
                <app-pi-row-actions
                  [row]="row"
                  editLabel="Редактировать склад"
                  dataTestEdit="warehouse-edit"
                  deleteLabel="Удалить склад"
                  dataTestDelete="warehouse-delete"
                  (edit)="openEdit($event)"
                  (delete)="confirmDelete($event)"
                />
              </div>
            </div>
            @if (expandedId() === row._id) {
              <div
                class="warehouse-hub-tray bg-paper-2 border-t hairline"
                data-test="warehouse-row-expand"
                role="region"
                [attr.aria-label]="'Сводка склада: ' + row.name"
              >
                <p class="text-xs text-muted-foreground m-0 px-4 pt-3">Склад / {{ row.name }} / Остатки</p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                  <section class="min-w-0 hairline rounded-sm bg-paper p-4" data-test="warehouse-expand-about">
                    <h3 class="text-sm font-medium text-ink m-0 mb-3">О складе</h3>
                    <dl class="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
                      <dt class="text-muted-foreground">Название</dt>
                      <dd class="m-0">{{ row.name }}</dd>
                      <dt class="text-muted-foreground">Описание</dt>
                      <dd class="m-0">{{ row.description || '—' }}</dd>
                      <dt class="text-muted-foreground">Статус</dt>
                      <dd class="m-0">{{ row.isActive ? 'Активен' : 'Неактивен' }}</dd>
                    </dl>
                  </section>

                  <section class="min-w-0 hairline rounded-sm bg-paper p-4" data-test="warehouse-expand-balances">
                    <h3 class="text-sm font-medium text-ink m-0 mb-3">Остатки</h3>
                    @if (itemsLoading()) {
                      <p class="text-xs text-muted-foreground m-0">Загрузка…</p>
                    } @else if (itemsError()) {
                      <p class="text-xs text-destructive m-0" role="alert" data-test="warehouse-expand-error">
                        {{ itemsError() }}
                      </p>
                    } @else if (items().length === 0) {
                      <p class="text-xs text-muted-foreground m-0">Нет остатков на этом складе.</p>
                    } @else {
                      <ul class="m-0 p-0 list-none flex flex-col gap-1 text-xs" data-test="warehouse-expand-items">
                        @for (item of items(); track item._id) {
                          <li class="flex items-center justify-between gap-2" data-test="warehouse-expand-item">
                            <span class="truncate">{{ itemName(item) }}</span>
                            <span class="text-muted-foreground tabular-nums shrink-0">{{ item.quantity }}</span>
                          </li>
                        }
                      </ul>
                    }
                    <a
                      routerLink="/storage-items"
                      [queryParams]="{ warehouseId: row._id }"
                      class="pi-outline-btn mt-3"
                      data-test="warehouse-expand-all-link"
                    >
                      Все остатки склада
                    </a>
                  </section>
                </div>
              </div>
            }
          }
        </div>
      }
    </main>
    </app-pi-group-workspace>
  `,
})
export class WarehousesPage implements OnInit {
  protected readonly toc = WAREHOUSE_TOC_CHIPS;
  private readonly api = inject(PiWarehousesService);
  private readonly storageItemsApi = inject(PiStorageItemsService);
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

  /** Single expand (HUB pattern) — mirrors counterparties/orders/supply. */
  readonly expandedId = signal<string | null>(null);
  readonly items = signal<readonly StorageItem[]>([]);
  readonly itemsLoading = signal(false);
  readonly itemsError = signal<string | null>(null);
  protected readonly itemName = storageItemName;

  ngOnInit(): void {
    this.load();
  }

  onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  toggleExpand(warehouseId: string): void {
    if (this.expandedId() === warehouseId) {
      this.expandedId.set(null);
      return;
    }
    this.expandedId.set(warehouseId);
    this.loadItems(warehouseId);
  }

  protected onRowSpace(event: Event, warehouseId: string): void {
    event.preventDefault();
    this.toggleExpand(warehouseId);
  }

  private loadItems(warehouseId: string): void {
    this.itemsLoading.set(true);
    this.itemsError.set(null);
    this.items.set([]);
    this.storageItemsApi
      .list({ warehouseId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (this.expandedId() !== warehouseId) return; // stale guard — collapsed/switched while loading
        this.itemsLoading.set(false);
        if (!res.ok) {
          this.itemsError.set(extractErrorMessage(res.error) || 'Не удалось загрузить остатки');
          return;
        }
        this.items.set((res.data?.items ?? []).slice(0, EXPAND_ITEMS_LIMIT));
      });
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

  async makeDefault(row: Warehouse): Promise<void> {
    const result = await firstValueFrom(this.api.setDefault(row._id));
    if (!result.ok) {
      this.toast.error('Не удалось назначить склад по умолчанию', {
        description: extractErrorMessage(result.error),
      });
      return;
    }
    this.toast.success(`«${row.name}» — склад по умолчанию`);
    this.load();
  }
}
