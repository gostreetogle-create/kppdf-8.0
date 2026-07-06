import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { TableComponent, type ColumnDef } from '../../shared/ui/pi-table.component';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../shared/page/pi-section.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { Material, MaterialsService } from './materials.service';

/**
 * Bridge type — TableComponent<T> constrains T to
 * `Record<string, unknown>`, so we intersect Material with an index
 * signature. The intersection satisfies the constraint without
 * forcing Material to be open-ended in every callsite. Property
 * access (`row.name`, `row.pricePerUnit`) still resolves to the
 * Material type via the intersection narrowing rules.
 */
type MaterialRow = Material & Record<string, unknown>;

/**
 * TZ-NEW MaterialsPage — the new site landing (per user direction,
 * 2026-07-06). When the user opens the SPA, logs in, and reaches
 * `/`, this page renders as the first thing they see.
 *
 * Read-only editorial table over /api/materials. Sortable, paginated
 * via PiTableComponent (which already implements sort + selection +
 * empty-state in Paper & Ink style).
 *
 * Standalone, OnPush, signal-based. Future: PiDialog/PiSheet for
 * create/edit (see followups).
 */
@Component({
  selector: 'app-materials-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TableComponent,
    PiPageHeaderComponent,
    PiSectionComponent,
    ButtonComponent,
  ],
  template: `
    <app-pi-page-header
      eyebrow="site · каталог"
      title="Материалы"
      description="Справочник материалов: номенклатура, единицы, цены, остатки."
    />

    <div class="px-5 pt-6 flex items-center gap-2">
      <app-pi-button variant="default" (click)="reload()" [disabled]="loading()">
        {{ loading() ? 'Загрузка…' : 'Обновить' }}
      </app-pi-button>
      <span class="eyebrow text-muted">
        {{ total() }} {{ totalLabel(total()) }}
      </span>
    </div>

    <app-pi-section title="Каталог" hint="sortable · latest 50" eyebrow="I">
      @if (error()) {
        <div
          role="alert"
          class="mb-4 border hairline border-destructive rounded-sm px-3 py-2 text-sm text-destructive"
        >
          {{ error() }}
        </div>
      }
      <div class="border hairline border-rule rounded-sm overflow-hidden">
        <app-pi-table
          [data]="data()"
          [columns]="columns"
          ariaLabel="Каталог материалов"
        >
          <span caption>Paper &amp; Ink · editorial · {{ now() }}</span>
        </app-pi-table>
      </div>
    </app-pi-section>
  `,
})
export class MaterialsPage implements OnInit {
  private readonly service = inject(MaterialsService);

  protected readonly data = signal<MaterialRow[]>([]);
  protected readonly total = signal<number>(0);
  protected readonly loading = signal<boolean>(true);
  protected readonly error = signal<string | null>(null);
  protected readonly now = signal<string>(new Date().toISOString());

  protected readonly columns: ColumnDef<MaterialRow>[] = [
    { key: 'name', label: 'Название', sortable: true },
    { key: 'article', label: 'Артикул', sortable: true },
    { key: 'sku', label: 'SKU', sortable: true },
    { key: 'unit', label: 'Ед.', sortable: true, width: '60px' },
    {
      key: 'pricePerUnit',
      label: 'Цена',
      sortable: true,
      align: 'right',
      format: (row) =>
        row.pricePerUnit != null
          ? `${row.pricePerUnit.toFixed(2)} ${row.priceCurrency ?? 'RUB'}`
          : '—',
    },
    {
      key: 'stockQty',
      label: 'Остаток',
      sortable: true,
      align: 'right',
      format: (row) => (row.stockQty != null ? String(row.stockQty) : '0'),
    },
  ];

  ngOnInit(): void {
    this.reload();
  }

  protected reload(): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set(null);
    this.service.list({ page: 1, limit: 50 }).subscribe({
      next: (res) => {
        // The service returns Material[] (no index signature); cast to
        // MaterialRow (Material & Record<string, unknown>) for the
        // PiTableComponent constraint. Object identity is preserved
        // — we're only widening the static type.
        this.data.set((res.items ?? []) as MaterialRow[]);
        this.total.set(res.total ?? res.items?.length ?? 0);
        this.loading.set(false);
        this.now.set(new Date().toISOString());
      },
      error: (err: unknown) => {
        const e = err as { error?: { message?: string }; message?: string };
        this.error.set(
          e?.error?.message ?? e?.message ?? 'Не удалось загрузить материалы.',
        );
        this.loading.set(false);
      },
    });
  }

  protected totalLabel(n: number): string {
    // Russian pluralisation: 1 материал, 2-4 материала, 5+ материалов.
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return 'материал';
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'материала';
    return 'материалов';
  }
}
