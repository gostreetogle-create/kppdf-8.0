import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { first } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../shared/page/pi-section.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PiDialogService, type DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { PiToastService } from '../../shared/ui/toast';
import { Organization, OrganizationsService } from './organizations.service';
import { OrganizationFormDialogComponent } from './organization-form-dialog.component';

type SortKey = 'name' | 'inn' | 'shortName' | null;
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-organizations-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    PiPageHeaderComponent,
    PiSectionComponent,
    ButtonComponent,
  ],
  template: `
    <app-pi-page-header
      eyebrow="раздел · партнёры"
      title="Организации"
      description="Юр. лица и ИП — покупатели, поставщики, подрядчики. Один контрагент может совмещать несколько ролей."
    />

    <div class="px-page-x py-page-y flex items-center gap-form-field flex-wrap">
      <input
        type="search"
        [value]="searchQuery()"
        (input)="onSearchInput($event)"
        placeholder="Поиск по названию или ИНН…"
        aria-label="Поиск организаций"
        data-test="search-input"
        class="border hairline border-rule rounded-sm px-4 py-2.5 bg-paper text-sm font-body focus:outline-none focus:border-ink w-72 transition-colors"
      />
      <app-pi-button
        variant="default"
        (click)="openCreate()"
        data-test="create-button"
      >
        + Создать
      </app-pi-button>
      <span class="eyebrow text-sunrise-warm">
        {{ total() }} {{ totalLabel(total()) }}
      </span>
    </div>

    <app-pi-section title="Каталог" hint="сортировка · клик по заголовку" eyebrow="I">
      @if (error()) {
        <div
          role="alert"
          class="mb-6 border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive"
        >
          {{ error() }}
        </div>
      }

      <div class="border hairline border-rule rounded-sm overflow-x-auto">
        <table class="w-full text-sm min-w-[640px]">
          <thead class="border-b hairline border-rule">
            <tr>
              <th
                class="text-left py-3 px-4 eyebrow cursor-pointer select-none"
                (click)="setSort('name')"
              >
                Название {{ sortIcon('name') }}
              </th>
              <th
                class="text-left py-3 px-4 eyebrow cursor-pointer select-none"
                (click)="setSort('shortName')"
              >
                Краткое {{ sortIcon('shortName') }}
              </th>
              <th
                class="text-left py-3 px-4 eyebrow cursor-pointer select-none"
                (click)="setSort('inn')"
              >
                ИНН {{ sortIcon('inn') }}
              </th>
              <th class="text-left py-3 px-4 eyebrow">Типы</th>
              <th class="text-right py-3 px-4 eyebrow w-40">Действия</th>
            </tr>
          </thead>
          <tbody>
            @for (row of sortedRows(); track row._id) {
              <tr
                class="border-b hairline border-rule last:border-0 hover:bg-sunrise-soft transition-colors"
                [attr.data-test]="'org-row-' + row._id"
              >
                <td class="py-3 px-4 align-top font-medium">{{ row.name }}</td>
                <td class="py-3 px-4 align-top text-muted">
                  {{ row.shortName || '—' }}
                </td>
                <td class="py-3 px-4 align-top mono text-xs whitespace-nowrap">
                  {{ row.inn }}
                </td>
                <td class="py-3 px-4 align-top">
                  <div class="flex flex-wrap gap-1">
                    @for (t of (row.type || []); track t) {
                      <span class="eyebrow text-[10px] px-2 py-1 border hairline border-rule rounded-sm">
                        {{ t }}
                      </span>
                    }
                  </div>
                </td>
                <td class="py-3 px-4 text-right align-top">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      class="inline-flex items-center justify-center w-8 h-8 hairline border border-rule rounded-sm bg-paper hover:bg-paper-2 transition-colors text-sm"
                      [attr.aria-label]="'Редактировать ' + row.name"
                      [attr.data-test]="'edit-button-' + row._id"
                      (click)="openEdit(row)"
                    >
                      <span aria-hidden="true">✎</span>
                    </button>
                    <button
                      type="button"
                      class="inline-flex items-center justify-center w-8 h-8 hairline border border-rule rounded-sm bg-paper hover:bg-destructive hover:text-paper hover:border-destructive transition-colors text-sm"
                      [attr.aria-label]="'Удалить ' + row.name"
                      [attr.data-test]="'delete-button-' + row._id"
                      (click)="onDelete(row)"
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                  </div>
                </td>
              </tr>
            }
            @if (sortedRows().length === 0 && !loading()) {
              <tr>
                <td colspan="5" class="py-12 px-4 text-center text-muted">
                  <div class="flex flex-col items-center gap-1">
                    <span class="eyebrow text-sunrise-warm">00</span>
                    <span class="text-sm">
                      {{ searchQuery() ? 'Ничего не найдено.' : 'Нет организаций. Нажмите «Создать», чтобы добавить первую.' }}
                    </span>
                  </div>
                </td>
              </tr>
            }
            @if (loading() && sortedRows().length === 0) {
              <tr>
                <td colspan="5" class="py-12 px-4 text-center text-muted">
                  Загрузка…
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </app-pi-section>
  `,
})
export class OrganizationsPage implements OnInit {
  private readonly service = inject(OrganizationsService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);

  protected readonly data = signal<Organization[]>([]);
  protected readonly total = signal<number>(0);
  protected readonly loading = signal<boolean>(true);
  protected readonly error = signal<string | null>(null);

  protected readonly searchQuery = signal<string>('');
  protected readonly sortKey = signal<SortKey>('name');
  protected readonly sortDir = signal<SortDir>('asc');

  protected readonly sortedRows = computed<Organization[]>(() => {
    const rows = this.data().slice();
    const k = this.sortKey();
    if (!k) return rows;
    const sign = this.sortDir() === 'asc' ? 1 : -1;
    return rows.sort((a, b) => {
      const av = a[k];
      const bv = b[k];
      if (av == null && bv == null) return 0;
      if (av == null) return -1 * sign;
      if (bv == null) return 1 * sign;
      return String(av).localeCompare(String(bv), 'ru') * sign;
    });
  });

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.reload();
  }

  private refreshOnDialogClose<TResult>(ref: DialogRef<TResult>): void {
    toObservable(ref.closed)
      .pipe(first((v) => v !== undefined))
      .subscribe((v) => {
        if (v) this.reload();
      });
  }

  protected onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.reload(), 300);
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

  protected totalLabel(n: number): string {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return 'организация';
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
      return 'организации';
    }
    return 'организаций';
  }

  protected openCreate(): void {
    const ref = this.dialog.open(OrganizationFormDialogComponent, {
      data: null,
      width: 'lg',
    });
    this.refreshOnDialogClose(ref);
  }

  protected openEdit(org: Organization): void {
    const ref = this.dialog.open(OrganizationFormDialogComponent, {
      data: org,
      width: 'lg',
    });
    this.refreshOnDialogClose(ref);
  }

  protected onDelete(row: Organization): void {
    const ok = window.confirm(
      `Удалить организацию «${row.name}»?\n\nЭто действие нельзя отменить.`,
    );
    if (!ok) return;
    this.service.remove(row._id).subscribe({
      next: () => {
        this.toast.success('Организация удалена');
        this.reload();
      },
      error: (err: unknown) => {
        const e = err as { error?: { message?: string }; message?: string };
        this.toast.error(
          e?.error?.message ?? e?.message ?? 'Не удалось удалить организацию.',
        );
      },
    });
  }

  protected reload(): void {
    this.loading.set(true);
    this.error.set(null);
    const search = this.searchQuery().trim();
    this.service
      .list({ page: 1, limit: 50, search: search || undefined })
      .subscribe({
        next: (res) => {
          this.data.set(res.items ?? []);
          this.total.set(res.total ?? res.items?.length ?? 0);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          const e = err as { error?: { message?: string }; message?: string };
          this.error.set(
            e?.error?.message ?? e?.message ?? 'Не удалось загрузить организации.',
          );
          this.loading.set(false);
        },
      });
  }
}
