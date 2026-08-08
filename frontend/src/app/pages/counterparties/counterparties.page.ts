import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PiPageChromeComponent, type PageCrumb } from '../../shared/page/pi-page-chrome.component';
import { PiToolbarComponent } from '../../shared/page/pi-toolbar.component';
import { ColumnDef, TableComponent } from '../../shared/ui/pi-table.component';
import { extractErrorMessage } from '../../core/silent-http';
import { Counterparty, CounterpartyService } from '../../shared/services/pi-counterparty.service';

/**
 * TZ-NAV-301 — thin Заказчики list (Counterparty API).
 * Sites / quick-create live in ORDERS-303 — not this page.
 */
@Component({
  selector: 'app-counterparties-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiPageChromeComponent, PiToolbarComponent, TableComponent],
  template: `
    <app-pi-page-chrome [crumbs]="crumbs" />

    <app-pi-toolbar>
      <span hint>{{ total() }} заказчик{{ totalLabel() }}</span>
    </app-pi-toolbar>

    @if (error()) {
      <div
        role="alert"
        class="mb-4 border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive"
        data-test="counterparties-error"
      >
        {{ error() }}
      </div>
    }

    <div
      class="pi-table-surface hairline rounded-sm overflow-hidden"
      data-test="counterparties-page"
    >
      <app-pi-table
        [data]="rows()"
        [columns]="cols"
        [loading]="loading()"
        [total]="total()"
        [page]="1"
        [pageSize]="200"
        emptyMessage="Заказчиков пока нет. API готов — полный CRUD и объекты (площадки) в ORDERS-303."
      />
    </div>

    <p class="mt-3 text-sm text-muted-foreground" data-test="counterparties-sites-note">
      Объекты / площадки — в волне ORDERS-303 (карточка заказчика).
    </p>
  `,
})
export class CounterpartiesPage implements OnInit {
  private readonly api = inject(CounterpartyService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly crumbs: PageCrumb[] = [{ label: 'Клиенты' }, { label: 'Заказчики' }];

  protected readonly cols: ColumnDef<Counterparty>[] = [
    { key: 'name', label: 'Название', sortable: false },
    { key: 'shortName', label: 'Краткое', sortable: false, cellClass: 'empty-cell' },
    { key: 'inn', label: 'ИНН', sortable: false, cellClass: 'font-mono empty-cell' },
  ];

  protected readonly rows = signal<Counterparty[]>([]);
  protected readonly total = signal(0);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly totalLabel = computed(() => {
    const n = this.total();
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return '';
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'а';
    return 'ов';
  });

  ngOnInit(): void {
    this.loading.set(true);
    this.api
      .list({ page: 1, limit: 200 })
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
        this.rows.set(res.data.items ?? []);
        this.total.set(res.data.total ?? 0);
      });
  }
}
