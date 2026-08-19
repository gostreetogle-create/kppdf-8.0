import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { PiGroupWorkspaceComponent } from '../../shared/page/pi-group-workspace.component';
import { CLIENTS_SECTION_CHIPS } from '../clients/clients-group-chips';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PiRowActionsComponent } from '../../shared/ui/pi-row-actions/pi-row-actions.component';
import { ColumnDef, TableComponent } from '../../shared/ui/pi-table.component';
import { PiDialogService, type DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../shared/ui/dialog/pi-alert-dialog.component';
import { PiToastService } from '../../shared/ui/toast';
import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../core/silent-http';
import { Counterparty, CounterpartyService } from '../../shared/services/pi-counterparty.service';
import { CounterpartyFullEditorDialogComponent } from './counterparty-full-editor-dialog.component';

/** Server-side list page size (TZ-UX-314). */
const PAGE_SIZE = 50;

/**
 * TZ-NAV-301 — thin Заказчики list (Counterparty API).
 * TZ-NAV-302 — Клиенты chips (Заказчики | Люди).
 * TZ-PARTY-301 — badge «временный» on quick-created (stub) INNs.
 * TZ-PARTY-303 — create / edit / delete via the Counterparty FullEditor.
 * Sites / площадки live in ORDERS-303 — not this page.
 */
@Component({
  selector: 'app-counterparties-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PiGroupWorkspaceComponent,
    TableComponent,
    BadgeComponent,
    ButtonComponent,
    PiRowActionsComponent,
    FormsModule,
  ],
  template: `
    <app-pi-group-workspace [chips]="chips" activeId="counterparties">
      <div tools class="flex items-center gap-form-field flex-wrap w-full">
        <input
          id="counterparties-search"
          type="search"
          name="counterparties-search"
          [value]="searchQuery()"
          (input)="onSearchInput($event)"
          placeholder="Поиск по названию или ИНН"
          aria-label="Поиск заказчиков"
          data-test="counterparties-search"
          class="pi-input w-72 pi-focus-ring"
        />
        <app-pi-button variant="default" (click)="openCreate()" data-test="counterparty-create">
          + Создать
        </app-pi-button>
        <span class="text-xs text-muted-foreground">{{ total() }} заказчик{{ totalLabel() }}</span>
        @if (stubCount() > 0) {
          <span class="text-xs text-muted-foreground" data-test="counterparties-stub-count">
            · {{ stubCount() }} с временным ИНН
          </span>
        }
      </div>

      @if (error()) {
        <div
          role="alert"
          class="mb-4 border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive"
          data-test="counterparties-error"
        >
          {{ error() }}
        </div>
      }

      <ng-template #innTpl let-row>
        <span class="inline-flex items-center gap-2 flex-wrap">
          <span class="font-mono">{{ row.inn || '—' }}</span>
          @if (row.innIsStub) {
            <app-pi-badge
              variant="outline"
              title="ИНН сгенерирован при быстром создании — заменить на реальный"
              data-test="counterparty-inn-stub"
            >
              временный
            </app-pi-badge>
          }
        </span>
      </ng-template>

      <ng-template #rowActionsTpl let-row>
        <app-pi-row-actions
          [row]="row"
          [editLabel]="'Редактировать ' + row.name"
          [deleteLabel]="'Удалить ' + row.name"
          [dataTestEdit]="'counterparty-edit-' + row._id"
          [dataTestDelete]="'counterparty-delete-' + row._id"
          (edit)="openEdit($event)"
          (delete)="onDelete($event)"
        />
      </ng-template>

      <div
        class="pi-table-surface hairline rounded-sm overflow-hidden"
        data-test="counterparties-page"
      >
        <app-pi-table
          [data]="rows()"
          [columns]="cols"
          [cellTemplates]="cellTemplates()"
          [rowActions]="rowActionsTplBinding()"
          [loading]="loading()"
          [total]="total()"
          [page]="page()"
          [pageSize]="PAGE_SIZE"
          (pageChange)="onPageChange($event)"
          emptyMessage="Заказчиков пока нет. Нажмите «Создать», чтобы добавить первого."
        />
      </div>

      <p class="mt-3 text-sm text-muted-foreground" data-test="counterparties-sites-note">
        Объекты / площадки — в волне ORDERS-303 (карточка заказчика).
      </p>
    </app-pi-group-workspace>
  `,
})
export class CounterpartiesPage implements OnInit {
  private readonly api = inject(CounterpartyService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  protected readonly chips = CLIENTS_SECTION_CHIPS;
  protected readonly PAGE_SIZE = PAGE_SIZE;
  protected readonly page = signal(1);
  protected readonly searchQuery = signal('');

  private readonly searchInput$ = new Subject<string>();

  protected readonly cols: ColumnDef<Counterparty>[] = [
    { key: 'name', label: 'Название', sortable: false },
    { key: 'shortName', label: 'Краткое', sortable: false, cellClass: 'empty-cell' },
    { key: 'inn', label: 'ИНН', sortable: false },
  ];

  @ViewChild('innTpl', { static: true }) private readonly innTpl!: TemplateRef<{
    $implicit: Counterparty;
  }>;
  protected readonly cellTemplates = computed(() => ({ inn: this.innTpl }));

  @ViewChild('rowActionsTpl', { static: true }) private readonly rowActionsTpl!: TemplateRef<{
    $implicit: Counterparty;
  }>;
  protected readonly rowActionsTplBinding = signal<TemplateRef<{
    $implicit: Counterparty;
  }> | null>(null);

  protected readonly rows = signal<Counterparty[]>([]);
  protected readonly total = signal(0);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly stubCount = computed(() => this.rows().filter((r) => r.innIsStub).length);

  protected readonly totalLabel = computed(() => {
    const n = this.total();
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return '';
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'а';
    return 'ов';
  });

  ngOnInit(): void {
    this.rowActionsTplBinding.set(this.rowActionsTpl);
    this.searchInput$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((q) => {
        this.searchQuery.set(q);
        this.page.set(1);
        this.reload();
      });
    this.reload();
  }

  protected onSearchInput(event: Event): void {
    this.searchInput$.next((event.target as HTMLInputElement).value);
  }

  protected openCreate(): void {
    this.openEditor(null);
  }

  protected openEdit(row: Counterparty): void {
    this.openEditor(row);
  }

  protected onDelete(row: Counterparty): void {
    const ref = this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Удалить заказчика?',
        description: `Удалить «${row.name}»? Заказчик скроется из списка; связанные заказы останутся.`,
        confirmLabel: 'Удалить',
        variant: 'destructive',
      },
      width: 'sm',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (confirmed: unknown) => {
      if (!confirmed) return;
      this.api.remove(row._id).subscribe((res) => {
        if (res.ok) {
          this.toast.success('Заказчик удалён');
          this.reload();
          return;
        }
        this.toast.error(extractErrorMessage(res.error));
      });
    });
  }

  private openEditor(row: Counterparty | null): void {
    const ref: DialogRef<Counterparty | null | undefined> = this.dialog.open(
      CounterpartyFullEditorDialogComponent,
      { data: row, width: 'lg', parentDestroyRef: this.destroyRef },
    );
    onDialogCloseOnce(ref, this.injector, (saved: unknown) => {
      if (saved) this.reload();
    });
  }

  protected onPageChange(next: number): void {
    this.page.set(next);
    this.reload();
  }

  private reload(): void {
    this.loading.set(true);
    const q = this.searchQuery().trim();
    this.api
      .list({ page: this.page(), limit: PAGE_SIZE, ...(q ? { search: q } : {}) })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.loading.set(false);
        if (!res.ok) {
          this.error.set(extractErrorMessage(res.error) || 'Не удалось загрузить заказчиков.');
          this.rows.set([]);
          this.total.set(0);
          return;
        }
        this.error.set(null);
        const items = res.data.items ?? [];
        const total = res.data.total ?? 0;
        this.rows.set(items);
        this.total.set(total);
        // After delete on last page — step back once.
        const maxPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
        if (items.length === 0 && total > 0 && this.page() > maxPage) {
          this.page.set(maxPage);
          this.reload();
        }
      });
  }
}
