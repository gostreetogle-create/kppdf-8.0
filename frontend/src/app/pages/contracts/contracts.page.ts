import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../shared/page/pi-section.component';
import { PiToolbarComponent } from '../../shared/page/pi-toolbar.component';
import { PiEmptyStateComponent } from '../../shared/ui/pi-empty-state/pi-empty-state.component';
import { PiRowActionsComponent } from '../../shared/ui/pi-row-actions/pi-row-actions.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../shared/ui/dialog/pi-alert-dialog.component';
import { PiToastService } from '../../shared/ui/toast';
import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../core/silent-http';
import {
  Counterparty,
  CounterpartyService,
} from '../../shared/services/pi-counterparty.service';
import { API_BASE_URL } from '../../core/api.tokens';
import { Contract, ContractsService, ContractStatus } from './contracts.service';
import { Organization, OrganizationsService } from '../organizations/organizations.service';
import { ContractFormDialogComponent } from './contract-form-dialog.component';

type SortKey = 'number' | 'expiresAt' | 'totalAmount' | 'status' | null;
type SortDir = 'asc' | 'desc';

const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  draft: 'Черновик',
  sent: 'Отправлен',
  signed: 'Подписан',
  active: 'Активен',
  completed: 'Завершён',
  cancelled: 'Отменён',
  expired: 'Истёк',
};

/**
 * ContractsPage — flat list of contracts with two lookup tables
 * (organizationsById + counterpartiesById) since the schema requires
 * BOTH `organizationId` AND `customerId` (the counterparty-side).
 *
 * Backend response caveat (see ContractsService): flat array, not
 * paginated envelope. Pagination TODO at backend. Client-side search
 * filters across «number», «title», organization name, counterparty
 * name/shortName, packageTag.
 */
@Component({
  selector: 'app-contracts-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    PiPageHeaderComponent,
    PiSectionComponent,
    PiToolbarComponent,
    PiEmptyStateComponent,
    PiRowActionsComponent,
    ButtonComponent,
  ],
  template: `
    <app-pi-page-header
      eyebrow="раздел · договоры"
      title="Договоры"
      description="Договоры с покупателями. Связь «наша организация ↔ контрагент», позиции, срок действия."
    />

    <app-pi-toolbar>
      <input
        id="contracts-search"
        type="search"
        name="contracts-search"
        [value]="searchQuery()"
        (input)="onSearchInput($event)"
        placeholder="Поиск по номеру, названию, контрагенту…"
        aria-label="Поиск договоров"
        data-test="search-input"
        class="pi-input w-80"
      />
      <app-pi-button
        variant="default"
        (click)="openCreate()"
        data-test="create-button"
      >
        + Создать
      </app-pi-button>
      <span hint>{{ visibleCount() }} {{ totalLabel(visibleCount()) }}</span>
    </app-pi-toolbar>

    <app-pi-section
      title="Реестр"
      hint="сортировка · клик по заголовку"
      eyebrow="I"
    >
      @if (error()) {
        <div
          role="alert"
          class="mb-6 border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive"
        >
          {{ error() }}
        </div>
      }

      <div class="hairline rounded-sm overflow-x-auto">
        <table class="w-full text-sm min-w-[1080px]">
          <thead class="hairline-b">
            <tr>
              <th
                class="pi-cell eyebrow cursor-pointer select-none group text-left"
                (click)="setSort('number')"
              >
                Номер
                <span [class.text-sunrise-warm]="isSortedBy('number')" class="ml-1 opacity-40 group-hover:opacity-70">{{ sortIcon('number') }}</span>
              </th>
              <th class="pi-cell eyebrow text-left">Название</th>
              <th class="pi-cell eyebrow text-left min-w-40">Контрагент</th>
              <th class="pi-cell eyebrow text-left min-w-32">Организация</th>
              <th
                class="pi-cell eyebrow cursor-pointer select-none group text-left"
                (click)="setSort('status')"
              >
                Статус
                <span [class.text-sunrise-warm]="isSortedBy('status')" class="ml-1 opacity-40 group-hover:opacity-70">{{ sortIcon('status') }}</span>
              </th>
              <th
                class="pi-cell eyebrow cursor-pointer select-none group text-left"
                (click)="setSort('expiresAt')"
              >
                Срок
                <span [class.text-sunrise-warm]="isSortedBy('expiresAt')" class="ml-1 opacity-40 group-hover:opacity-70">{{ sortIcon('expiresAt') }}</span>
              </th>
              <th class="pi-cell eyebrow text-left">Позиций</th>
              <th
                class="pi-cell-numeric eyebrow cursor-pointer select-none group"
                (click)="setSort('totalAmount')"
              >
                Сумма
                <span [class.text-sunrise-warm]="isSortedBy('totalAmount')" class="ml-1 opacity-40 group-hover:opacity-70">{{ sortIcon('totalAmount') }}</span>
              </th>
              <th class="pi-cell eyebrow w-40 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            @for (row of sortedRows(); track row._id) {
              <tr
                class="pi-table-row pi-table-row-odd last:border-0"
                [attr.data-test]="'contract-row-' + row._id"
              >
                <td class="pi-cell align-top font-mono text-xs font-medium">{{ row.number }}</td>
                <td class="pi-cell align-top text-muted-foreground empty-cell">{{ row.title || '—' }}</td>
                <td class="pi-cell align-top">{{ counterpartyNameOf(row) ?? '—' }}</td>
                <td class="pi-cell align-top empty-cell">{{ organizationNameOf(row) ?? '—' }}</td>
                <td class="pi-cell align-top empty-cell">{{ statusLabel(row.status) }}</td>
                <td class="pi-cell align-top text-muted-foreground whitespace-nowrap empty-cell">{{ formatDate(row.expiresAt) }}</td>
                <td class="pi-cell align-top text-muted-foreground">{{ row.items?.length ?? 0 }}</td>
                <td class="pi-cell-numeric align-top empty-cell">{{ formatTotal(row) }}</td>
                <td class="pi-cell align-top">
                  <app-pi-row-actions
                    [row]="row"
                    [documentLabel]="'Создать документ для договора ' + row.number"
                    [dataTestDocument]="'document-button-' + row._id"
                    [editLabel]="'Редактировать договор ' + row.number"
                    [deleteLabel]="'Удалить договор ' + row.number"
                    [dataTestEdit]="'edit-button-' + row._id"
                    [dataTestDelete]="'delete-button-' + row._id"
                    (document)="onCreateDocument($event)"
                    (edit)="openEdit($event)"
                    (delete)="onDelete($event)"
                  />
                </td>
              </tr>
            }
            @if (sortedRows().length === 0 && !loading()) {
              <app-pi-empty-state
                [colspan]="9"
                [message]="searchQuery() ? 'Ничего не найдено.' : 'Нет договоров. Нажмите «Создать», чтобы добавить первый.'"
                state="empty"
              />
            }
            @if (loading() && sortedRows().length === 0) {
              <app-pi-empty-state
                [colspan]="9"
                message="Загрузка…"
                state="loading"
              />
            }
          </tbody>
        </table>
      </div>
    </app-pi-section>
  `,
})
export class ContractsPage implements OnInit {
  private readonly service = inject(ContractsService);
  private readonly counterpartyService = inject(CounterpartyService);
  private readonly orgService = inject(OrganizationsService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly injector = inject(Injector);
  private readonly baseUrl = inject(API_BASE_URL);
  // TZ-86 Phase E.2: per-row «Создать документ» navigates to the builder's
  // empty-state picker with `?source=contract&sourceId=<row._id>`. See
  // OrdersPage.onCreateDocument for the full pattern explanation.
  private readonly router = inject(Router);

  /**
   * Server list = `GET /api/contracts` via Angular 20's `httpResource`.
   *
   * Same flat-array caveat as orders: backend doesn't paginate yet,
   * search is client-side, so no `search` query params and no
   * `debouncedSearch` signal. When backend pagination lands, switch
   * to the envelope shape and add `debouncedSearch` like
   * materials/products do.
   *
   * The `filteredRows` computed reads `data()` (from the resource)
   * plus the lookup-table signals, and feeds both
   * `counterpartiesById` and `organizationsById` into the search
   * haystack. Lookup tables are still populated via the legacy
   * HttpClient+Observable path (one-shot, error-tolerant) because
   * they are non-critical: a 500 on orgs just falls back to raw IDs.
   */
  protected readonly listRes = httpResource<Contract[]>(() => ({
    url: `${this.baseUrl}/contracts`,
  }));

  protected readonly data = computed<Contract[]>(
    () => this.listRes.value() ?? [],
  );
  protected readonly loading = computed<boolean>(() => this.listRes.isLoading());
  protected readonly error = computed<string | null>(() => {
    const err = this.listRes.error() as import('@angular/common/http').HttpErrorResponse | undefined;
    return err ? extractErrorMessage(err) : null;
  });

  protected readonly searchQuery = signal<string>('');
  protected readonly sortKey = signal<SortKey>('number');
  protected readonly sortDir = signal<SortDir>('asc');

  protected readonly counterpartiesById = signal<Record<string, Counterparty>>({});
  protected readonly organizationsById = signal<Record<string, Organization>>({});

  protected readonly filteredRows = computed<Contract[]>(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.data();
    return this.data().filter((c) => {
      const cpId = customerIdOf(c);
      const orgId = organizationIdOf(c);
      const hay = [
        c.number,
        c.title,
        c.packageTag,
        this.counterpartiesById()[cpId]?.name,
        this.counterpartiesById()[cpId]?.shortName,
        this.counterpartiesById()[cpId]?.inn,
        this.organizationsById()[orgId]?.name,
        this.organizationsById()[orgId]?.shortName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  });

  protected readonly sortedRows = computed<Contract[]>(() => {
    const rows = this.filteredRows().slice();
    const k = this.sortKey();
    if (!k) return rows;
    const sign = this.sortDir() === 'asc' ? 1 : -1;
    return rows.sort((a, b) => {
      const av = a[k];
      const bv = b[k];
      if (av == null && bv == null) return 0;
      if (av == null) return -1 * sign;
      if (bv == null) return 1 * sign;
      if (typeof av === 'number' && typeof bv === 'number') {
        return (av - bv) * sign;
      }
      return String(av).localeCompare(String(bv), 'ru') * sign;
    });
  });

  protected readonly visibleCount = computed(() => this.sortedRows().length);

  ngOnInit(): void {
    this.loadLookups();
    // `listRes` auto-fires its initial GET — no explicit `reload()`.
  }

  private loadLookups(): void {
    this.counterpartyService.list({ limit: 200 }).subscribe((res) => {
      if (!res.ok) return;
      const map: Record<string, Counterparty> = {};
      for (const c of res.data.items ?? []) map[c._id] = c;
      this.counterpartiesById.set(map);
    });
    this.orgService.list({ limit: 200 }).subscribe((res) => {
      if (!res.ok) return;
      const map: Record<string, Organization> = {};
      for (const o of res.data.items ?? []) map[o._id] = o;
      this.organizationsById.set(map);
    });
  }

  protected counterpartyNameOf(row: Contract): string | null {
    const id = customerIdOf(row);
    if (!id) return null;
    return (
      this.counterpartiesById()[id]?.shortName ??
      this.counterpartiesById()[id]?.name ??
      null
    );
  }

  protected organizationNameOf(row: Contract): string | null {
    const id = organizationIdOf(row);
    if (!id) return null;
    return (
      this.organizationsById()[id]?.shortName ??
      this.organizationsById()[id]?.name ??
      null
    );
  }

  protected statusLabel(s: ContractStatus): string {
    return CONTRACT_STATUS_LABELS[s] ?? s;
  }

  protected formatDate(d: string | undefined): string {
    if (!d) return '';
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(dt.getDate())}.${pad(dt.getMonth() + 1)}.${dt.getFullYear()}`;
  }

  protected formatTotal(row: Contract): string {
    if (row.totalAmount == null) return '';
    return `${row.totalAmount.toFixed(2)} ₽`;
  }

  protected totalLabel(n: number): string {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return 'договор';
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
      return 'договора';
    }
    return 'договоров';
  }

  protected onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  protected setSort(key: Exclude<SortKey, null>): void {
    if (this.sortKey() !== key) {
      this.sortKey.set(key);
      this.sortDir.set('asc');
    } else if (this.sortDir() === 'asc') {
      this.sortDir.set('desc');
    } else {
      this.sortKey.set(null);
      this.sortDir.set('asc');
    }
  }

  protected sortIcon(key: Exclude<SortKey, null>): string {
    if (this.sortKey() !== key) return '↕';
    return this.sortDir() === 'asc' ? '↑' : '↓';
  }

  protected isSortedBy(key: Exclude<SortKey, null>): boolean {
    return this.sortKey() === key;
  }

  protected openCreate(): void {
    const ref = this.dialog.open(ContractFormDialogComponent, {
      data: null,
      width: 'lg',
    });
    onDialogCloseOnce(ref, this.injector, () => this.listRes.reload());
  }

  protected openEdit(contract: Contract): void {
    const ref = this.dialog.open(ContractFormDialogComponent, {
      data: contract,
      width: 'lg',
    });
    onDialogCloseOnce(ref, this.injector, () => this.listRes.reload());
  }

  protected onDelete(row: Contract): void {
    const ref = this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Удалить договор?',
        description: `Удалить «${row.number}»? Это действие нельзя отменить.`,
        confirmLabel: 'Удалить',
        variant: 'destructive',
      },
      width: 'sm',
    });
    onDialogCloseOnce(ref, this.injector, (confirmed: unknown) => {
      if (!confirmed) return;
      this.service.remove(row._id).subscribe((res) => {
        if (res.ok) {
          this.toast.success('Договор удалён');
          this.listRes.reload();
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    });
  }

  /**
   * TZ-86 Phase E.2: navigate to the document constructor's empty-state
   * picker with `?source=contract&sourceId=<row._id>`. See
   * OrdersPage.onCreateDocument for the full pattern explanation.
   */
  protected onCreateDocument(row: Contract): void {
    this.router.navigate(['/doc-constructor/builder'], {
      queryParams: { source: 'contract', sourceId: row._id },
    });
  }

  protected reload(): void {
    this.listRes.reload();
  }
}

// ─── Local helpers (dual-shape ref narrowing) ───
function customerIdOf(row: Contract): string {
  if (!row.customerId) return '';
  if (typeof row.customerId === 'string') return row.customerId;
  return row.customerId._id ?? '';
}

function organizationIdOf(row: Contract): string {
  if (!row.organizationId) return '';
  if (typeof row.organizationId === 'string') return row.organizationId;
  return row.organizationId._id ?? '';
}
