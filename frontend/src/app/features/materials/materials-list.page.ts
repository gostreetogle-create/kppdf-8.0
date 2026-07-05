import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  signal,
  viewChild,
  AfterViewInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, from, switchMap } from 'rxjs';

import { DecimalPipe } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';

import {
  Material,
  MaterialCreateValues,
  MaterialService,
} from '../../core/material.service';
import {
  MaterialFormDialog,
  MaterialFormDialogResult,
} from './material-form.dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog';

/**
 * Materials list page — table with server-side search & paginator, plus
 * create/edit dialogs and inline delete confirmation. State lives in
 * MaterialService (Signals) so navigation to/from this page is idempotent.
 */
@Component({
  selector: 'app-materials-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    DecimalPipe,
  ],
  template: `
    <main class="page">
      <header class="page-header">
        <div class="page-title">
          <mat-icon class="title-icon">inventory_2</mat-icon>
          <div>
            <h1>Материалы</h1>
            <p class="subtitle">
              Справочник сырья: {{ service.total() }} {{ plural(service.total()) }}
            </p>
          </div>
        </div>
        <div class="page-actions">
          <a mat-stroked-button routerLink="/home">
            <mat-icon>arrow_back</mat-icon>
            На главную
          </a>
          <button mat-flat-button color="primary" (click)="openCreate()">
            <mat-icon>add</mat-icon>
            Создать материал
          </button>
        </div>
      </header>

      <mat-card appearance="outlined" class="filter-card">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Поиск по названию, артикулу или SKU</mat-label>
          <mat-icon matPrefix>search</mat-icon>
          <input
            matInput
            type="search"
            [formControl]="searchCtrl"
            autocomplete="off"
          />
          @if (searchCtrl.value) {
            <button
              matSuffix
              mat-icon-button
              type="button"
              aria-label="Очистить"
              (click)="clearSearch()"
            >
              <mat-icon>close</mat-icon>
            </button>
          }
        </mat-form-field>
        <button
          mat-stroked-button
          type="button"
          (click)="reload()"
          [disabled]="service.loading()"
          aria-label="Обновить"
        >
          <mat-icon>refresh</mat-icon>
          Обновить
        </button>
      </mat-card>

      @if (service.error(); as err) {
        <mat-card appearance="outlined" class="error-card">
          <mat-icon color="warn">error_outline</mat-icon>
          <div>
            <strong>Не удалось выполнить запрос</strong>
            <p>{{ err }}</p>
          </div>
          <button mat-button color="primary" (click)="reload()">Повторить</button>
        </mat-card>
      }

      <mat-card appearance="outlined" class="table-card">
        <div class="table-wrapper">
          <table mat-table [dataSource]="dataSource" matSort>
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Название</th>
              <td mat-cell *matCellDef="let m">{{ m.name }}</td>
            </ng-container>

            <ng-container matColumnDef="article">
              <th mat-header-cell *matHeaderCellDef>Артикул</th>
              <td mat-cell *matCellDef="let m">
                <span class="muted">{{ m.article || '—' }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="unit">
              <th mat-header-cell *matHeaderCellDef>Ед.</th>
              <td mat-cell *matCellDef="let m">{{ m.unit }}</td>
            </ng-container>

            <ng-container matColumnDef="price">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Цена</th>
              <td mat-cell *matCellDef="let m">
                @if (m.pricePerUnit != null) {
                  {{ m.pricePerUnit | number:'1.0-2' }} {{ m.priceCurrency || '' }}
                } @else {
                  <span class="muted">—</span>
                }
              </td>
            </ng-container>

            <ng-container matColumnDef="stock">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Остаток</th>
              <td mat-cell *matCellDef="let m">
                @if (m.stockQty != null) {
                  {{ m.stockQty | number:'1.0-0' }}
                } @else {
                  <span class="muted">—</span>
                }
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="actions-col">Действия</th>
              <td mat-cell *matCellDef="let m" class="actions-col">
                <button
                  mat-icon-button
                  type="button"
                  matTooltip="Редактировать"
                  (click)="openEdit(m)"
                >
                  <mat-icon>edit</mat-icon>
                </button>
                <button
                  mat-icon-button
                  type="button"
                  matTooltip="Удалить"
                  color="warn"
                  (click)="confirmDelete(m)"
                >
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="cols; sticky: true"></tr>
            <tr mat-row *matRowDef="let row; columns: cols"></tr>

            <tr class="mat-row" *matNoDataRow>
              <td class="empty-cell" [attr.colspan]="cols.length">
                @if (service.loading()) {
                  <mat-spinner diameter="22"></mat-spinner>
                  <span>Загружаем…</span>
                } @else if (searchCtrl.value) {
                  Ничего не нашли по запросу «{{ searchCtrl.value }}».
                } @else {
                  Пока нет ни одного материала — создайте первый.
                }
              </td>
            </tr>
          </table>
        </div>

        <mat-paginator
          [length]="service.total()"
          [pageIndex]="service.page() - 1"
          [pageSize]="service.limit()"
          [pageSizeOptions]="[10, 20, 50, 100]"
          (page)="onPage($event)"
          [disabled]="service.loading()"
        ></mat-paginator>
      </mat-card>
    </main>
  `,
  styles: `
    :host { display: block; }

    .page {
      max-width: 1100px;
      margin: 0 auto;
      padding: 24px 20px 64px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 16px;
      flex-wrap: wrap;
    }

    .page-title {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .title-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
      color: var(--mat-sys-primary);
      background: color-mix(in srgb, var(--mat-sys-primary) 14%, transparent);
      border-radius: 12px;
      padding: 8px;
      box-sizing: border-box;
    }

    h1 {
      margin: 0;
      font-size: 26px;
      font-weight: 600;
      letter-spacing: -0.01em;
    }

    .subtitle {
      margin: 2px 0 0;
      color: var(--mat-sys-on-surface-variant);
      font-size: 14px;
    }

    .page-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .filter-card {
      padding: 12px 16px 4px;
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
    }

    .search-field { flex: 1 1 280px; }

    .error-card {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px 16px;
      background: color-mix(in srgb, var(--mat-sys-error) 6%, transparent);
  }

    .error-card mat-icon { color: var(--mat-sys-error); }

    .error-card p {
      margin: 4px 0 0;
      font-size: 13px;
      color: var(--mat-sys-on-surface-variant);
  }

    .table-card { padding: 0; overflow: hidden; }

    .table-wrapper {
      max-height: calc(100vh - 320px);
      min-height: 320px;
      overflow: auto;
    }

    table {
      width: 100%;
    }

    .mat-mdc-row:hover {
      background: var(--mat-sys-surface-container-low);
    }

    .muted { color: var(--mat-sys-on-surface-variant); }

    .actions-col {
      width: 112px;
      text-align: right;
      white-space: nowrap;
    }

    .empty-cell {
      padding: 48px 16px;
      text-align: center;
      color: var(--mat-sys-on-surface-variant);
    }

    .empty-cell mat-spinner {
      display: inline-block;
      margin-right: 10px;
      vertical-align: middle;
    }
  `,
})
export class MaterialsListPage implements AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  protected readonly service = inject(MaterialService);

  readonly cols = ['name', 'article', 'unit', 'price', 'stock', 'actions'];
  readonly dataSource = new MatTableDataSource<Material>([]);
  readonly searchCtrl = this.fb.nonNullable.control('');

  // viewChild refs — wired up in ngAfterViewInit to avoid expression
  // changed-after-checked with OnPush + signals.
  private readonly paginator = viewChild<MatPaginator | undefined>(MatPaginator);
  private readonly sort = viewChild<MatSort | undefined>(MatSort);

  constructor() {
    // Mirror service.items → dataSource so mat-table re-renders.
    effect(() => {
      this.dataSource.data = this.service.items();
    });

    // First load happens once; pagination will re-load via MatPaginator.
    void this.service.list({ page: 1 });

    // Debounce search input → server reload. switchMap guarantees we
    // can't race two outgoing list() calls — an older response that
    // arrives after a newer one would otherwise leave the table stale.
    this.searchCtrl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((value) =>
          from(this.service.list({ page: 1, search: value || undefined })),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  ngAfterViewInit(): void {
    const pag = this.paginator();
    const srt = this.sort();
    if (srt) this.dataSource.sort = srt;
    if (pag && pag.pageIndex !== this.service.page() - 1) {
      pag.pageIndex = this.service.page() - 1;
    }
  }

  plural(n: number): string {
    // Russian pluralization: 1 материал, 2-4 материала, 5+ материалов.
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 14) return 'материалов';
    if (mod10 === 1) return 'материал';
    if (mod10 >= 2 && mod10 <= 4) return 'материала';
    return 'материалов';
  }

  reload(): void {
    void this.service.list({
      page: this.service.page(),
      search: this.searchCtrl.value || undefined,
    });
  }

  clearSearch(): void {
    this.searchCtrl.setValue('');
  }

  onPage(e: PageEvent): void {
    void this.service.list({
      page: e.pageIndex + 1,
      limit: e.pageSize,
      search: this.searchCtrl.value || undefined,
    });
  }

  openCreate(): void {
    this.openDialog(undefined);
  }

  openEdit(material: Material): void {
    this.openDialog(material);
  }

  private openDialog(material: Material | undefined): void {
    const ref = this.dialog.open<MaterialFormDialog, unknown, MaterialFormDialogResult>(
      MaterialFormDialog,
      {
        data: { material },
        autoFocus: 'first-tabbable',
        restoreFocus: true,
      },
    );
    ref.afterClosed().subscribe((result) => {
      if (!result || result.action === 'canceled') return;
      void this.persist(result.values, material?._id);
    });
  }

  private async persist(
    values: MaterialCreateValues,
    id: string | undefined,
  ): Promise<void> {
    const isEdit = !!id;
    const result = isEdit
      ? await this.service.update(id!, values)
      : await this.service.create(values);
    if (result) {
      this.snack.open(isEdit ? 'Изменения сохранены' : 'Материал создан', 'OK', {
        duration: 2500,
      });
    }
  }

  confirmDelete(material: Material): void {
    const ref = this.dialog.open<ConfirmDialogComponent, unknown, boolean>(
      ConfirmDialogComponent,
      {
        data: {
          title: 'Удалить материал?',
          message:
            `«${material.name}» будет перенесён в архив.\n` +
            `Действие можно выполнить только если материал нигде не используется.`,
          confirmLabel: 'Удалить',
          cancelLabel: 'Отмена',
          variant: 'warn',
        },
        autoFocus: 'first-tabbable',
      },
    );
    ref.afterClosed().subscribe((ok) => {
      if (!ok) return;
      void this.service.remove(material._id).then((success) => {
        if (success) this.snack.open('Материал удалён', 'OK', { duration: 2500 });
      });
    });
  }
}
