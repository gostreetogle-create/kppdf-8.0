import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  TemplateRef,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { extractErrorMessage, type SilentResult } from '../../../core/silent-http';
import { PiGroupWorkspaceComponent } from '../../../shared/page/pi-group-workspace.component';
import { PiSectionComponent } from '../../../shared/page/pi-section.component';
import { PiEmptyStateComponent } from '../../../shared/ui/pi-empty-state/pi-empty-state.component';
import { PiRowActionsComponent } from '../../../shared/ui/pi-row-actions/pi-row-actions.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { SwitchComponent } from '../../../shared/ui/switch/switch.component';
import { PiToastService } from '../../../shared/ui/toast';
import { PiDialogService } from '../../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../../shared/ui/dialog/pi-alert-dialog.component';
import { onDialogCloseOnce } from '../../../shared/util/on-dialog-close-once';
import {
  TemplateSetupDialogComponent,
  type TemplateSetupResult,
} from '../builder/template-setup-dialog.component';
import {
  DocumentTemplate,
  DocumentTemplatesService,
} from '../../../shared/services/pi-document-templates.service';
import {
  DocumentTemplateCategoriesService,
  DocumentTemplateCategory,
} from '../../../shared/services/pi-document-template-categories.service';
import { pluralRu } from '../../../shared/util/russian-plural';
import { ColumnDef, TableComponent } from '../../../shared/ui/pi-table.component';
import { DOCUMENTS_TOC_CHIPS } from '../documents/documents-group-chips';

const RU_TEMPLATES = ['шаблон', 'шаблона', 'шаблонов'] as const;
const PAGE_SIZE = 10;

/**
 * Полная документация страницы: docs/pages/templates.page.md
 */
@Component({
  selector: 'app-templates-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PiGroupWorkspaceComponent,
    PiSectionComponent,
    PiEmptyStateComponent,
    PiRowActionsComponent,
    ButtonComponent,
    SwitchComponent,
    TableComponent,
  ],
  template: `
    <app-pi-group-workspace [toc]="toc" tocActiveId="templates" [chips]="chips" activeId="">
      <div tools class="flex items-center gap-form-field flex-wrap w-full">
        <input
          type="search"
          class="pi-input w-72"
          placeholder="Поиск по названию или типу…"
          [value]="searchQuery()"
          (input)="onSearch($event)"
          aria-label="Поиск шаблонов"
        />
        <select
          class="pi-input w-48"
          [value]="categoryFilter()"
          (change)="onCategoryFilter($event)"
          aria-label="Фильтр по категории"
        >
          <option value="">Все категории</option>
          @for (cat of categories(); track cat._id) {
            <option [value]="cat._id">{{ cat.name }}</option>
          }
        </select>
        <app-pi-button
          variant="default"
          (click)="onCreate()"
          [disabled]="creating()"
          data-test="create-template-button"
        >
          {{ creating() ? 'Создание…' : '+ Создать шаблон' }}
        </app-pi-button>
        <span class="text-xs text-muted-foreground"
          >{{ filtered().length }} {{ totalLabel(filtered().length) }}</span
        >
      </div>

      <ng-template #activeTpl let-t>
        <app-pi-switch [checked]="t.isActive" (checkedChange)="onToggleActive(t, $event)" />
      </ng-template>
      <ng-template #defaultTpl let-t>
        @if (t.isDefault) {
          <span class="text-sunrise-warm" aria-label="Шаблон по умолчанию">★</span>
        } @else if (t.isActive) {
          <button
            type="button"
            class="pi-icon-btn pi-focus-ring"
            aria-label="Сделать шаблоном по умолчанию"
            (click)="onSetDefault(t)"
          >
            ☆
          </button>
        } @else {
          <span class="text-muted-foreground">☆</span>
        }
      </ng-template>
      <ng-template #rowActionsTpl let-t>
        <app-pi-row-actions
          [row]="t"
          copyLabel="Дублировать"
          editLabel="Конструктор"
          deleteLabel="Удалить"
          (copy)="onDuplicate($event)"
          (edit)="onEdit($event)"
          (delete)="onDelete($event)"
        />
      </ng-template>

      <app-pi-section title="Каталог" eyebrow="I">
        @if (loading()) {
          <app-pi-empty-state [colspan]="1" message="Загрузка…" state="loading" />
        } @else if (error()) {
          <div
            role="alert"
            class="hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive"
          >
            <p>{{ error() }}</p>
            <app-pi-button class="mt-3" variant="outline" size="sm" (click)="reload()">
              Повторить
            </app-pi-button>
          </div>
        } @else if (filtered().length === 0) {
          <app-pi-empty-state
            [colspan]="1"
            [message]="
              searchQuery() ? 'Ничего не найдено.' : 'Нет шаблонов. Нажмите «Создать шаблон».'
            "
          />
        } @else {
          <div class="hairline rounded-sm overflow-x-auto">
            <app-pi-table
              [data]="pageRows()"
              [columns]="columns"
              [cellTemplates]="cellTemplates()"
              [rowActions]="rowActionsTpl"
              [total]="filtered().length"
              [page]="pageIndex() + 1"
              [pageSize]="PAGE_SIZE"
              (pageChange)="pageIndex.set($event - 1)"
              [localSort]="true"
              [loading]="loading()"
              ariaLabel="Каталог шаблонов"
              data-test="templates-table"
            />
          </div>
        }
      </app-pi-section>
    </app-pi-group-workspace>
  `,
})
export class TemplatesPage {
  protected readonly PAGE_SIZE = PAGE_SIZE;
  protected readonly toc = DOCUMENTS_TOC_CHIPS;
  protected readonly chips = [] as const;

  private readonly svc = inject(DocumentTemplatesService);
  private readonly categoriesSvc = inject(DocumentTemplateCategoriesService);
  private readonly router = inject(Router);
  private readonly toast = inject(PiToastService);
  private readonly dialog = inject(PiDialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  protected readonly items = signal<DocumentTemplate[]>([]);
  protected readonly categories = signal<DocumentTemplateCategory[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly creating = signal(false);
  protected readonly searchQuery = signal('');
  protected readonly categoryFilter = signal('');
  protected readonly pageIndex = signal(0);

  protected readonly columns: ColumnDef<DocumentTemplate>[] = [
    { key: 'name', label: 'Название', cellClass: 'font-medium' },
    { key: 'categoryId', label: 'Категория', accessor: (row) => this.categoryName(row) },
    { key: 'docTypeId', label: 'Тип документа', accessor: (row) => this.docTypeName(row) },
    { key: 'pageSize', label: 'Формат', cellClass: 'font-mono text-xs' },
    { key: 'isActive', label: 'Активен', align: 'center' },
    { key: 'isDefault', label: 'По умолчанию', align: 'center' },
  ];
  @ViewChild('activeTpl', { static: true }) private readonly activeTpl!: TemplateRef<{
    $implicit: DocumentTemplate;
  }>;
  @ViewChild('defaultTpl', { static: true }) private readonly defaultTpl!: TemplateRef<{
    $implicit: DocumentTemplate;
  }>;
  @ViewChild('rowActionsTpl', { static: true }) protected readonly rowActionsTpl!: TemplateRef<{
    $implicit: DocumentTemplate;
  }>;
  protected readonly cellTemplates = computed(() => ({
    isActive: this.activeTpl,
    isDefault: this.defaultTpl,
  }));

  protected readonly filtered = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const catId = this.categoryFilter();
    const list = this.items()
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name, 'ru'));
    let result = list;
    if (catId) {
      result = result.filter(
        (t) =>
          t.categoryId === catId ||
          (typeof t.categoryId === 'object' && t.categoryId._id === catId),
      );
    }
    if (!q) return result;
    return result.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        this.docTypeName(t).toLowerCase().includes(q) ||
        t.pageSize.toLowerCase().includes(q) ||
        this.categoryName(t).toLowerCase().includes(q),
    );
  });

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / PAGE_SIZE)),
  );

  protected readonly pageRows = computed(() => {
    const start = this.pageIndex() * PAGE_SIZE;
    return this.filtered().slice(start, start + PAGE_SIZE);
  });

  constructor() {
    this.reload();
  }

  protected reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.svc
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.loading.set(false);
        if (res.ok) {
          this.items.set(res.data.items ?? []);
        } else {
          this.error.set(extractErrorMessage(res.error));
        }
      });
    this.categoriesSvc
      .list({ activeOnly: true })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (res.ok) {
          this.categories.set(res.data ?? []);
        }
      });
  }

  protected totalLabel(n: number): string {
    return pluralRu(n, RU_TEMPLATES);
  }

  protected onCategoryFilter(e: Event): void {
    this.categoryFilter.set((e.target as HTMLSelectElement).value);
    this.pageIndex.set(0);
  }

  protected onSearch(e: Event): void {
    this.searchQuery.set((e.target as HTMLInputElement).value);
    this.pageIndex.set(0);
  }

  protected rangeLabel(): string {
    const total = this.filtered().length;
    const start = this.pageIndex() * PAGE_SIZE + 1;
    const end = Math.min((this.pageIndex() + 1) * PAGE_SIZE, total);
    return `Показано ${start}–${end} из ${total}`;
  }

  protected prevPage(): void {
    this.pageIndex.update((p) => Math.max(0, p - 1));
  }

  protected nextPage(): void {
    this.pageIndex.update((p) => Math.min(this.totalPages() - 1, p + 1));
  }

  protected docTypeName(t: DocumentTemplate): string {
    const dt = t.docTypeId;
    if (typeof dt === 'object' && dt?.name) return dt.name;
    return '—';
  }

  protected categoryName(t: DocumentTemplate): string {
    const cat = t.categoryId;
    if (typeof cat === 'object' && cat?.name) return cat.name;
    return '—';
  }

  protected onCreate(): void {
    const ref = this.dialog.open<TemplateSetupResult>(TemplateSetupDialogComponent, {
      data: { mode: 'create' },
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (result) => {
      if (!result) return;
      this.createWithSettings(result);
    });
  }

  private createWithSettings(settings: TemplateSetupResult): void {
    if (!settings.categoryId) {
      this.toast.error('Выберите категорию шаблона');
      return;
    }
    this.creating.set(true);

    type SetupId = SilentResult<string>;

    const ensureId = (
      existingId: string | undefined,
      request: import('rxjs').Observable<SilentResult<{ _id: string }>>,
    ): import('rxjs').Observable<SetupId> => {
      if (existingId) return of({ ok: true, data: existingId });
      return request.pipe(map((res): SetupId => (res.ok ? { ok: true, data: res.data._id } : res)));
    };

    // Step 1: read setup data, then create only missing defaults through the
    // document-template service's silent HTTP boundary.
    forkJoin({
      organizations: this.svc.listOrganizations(),
      docTypes: this.svc.listDocTypes(),
    })
      .pipe(
        switchMap(({ organizations, docTypes }) => {
          if (!organizations.ok)
            return of({ kind: 'setup-error' as const, error: organizations.error });
          if (!docTypes.ok) return of({ kind: 'setup-error' as const, error: docTypes.error });

          const orgId = organizations.data.items[0]?._id;
          const docTypeId = docTypes.data[0]?._id;
          return forkJoin({
            orgId: ensureId(
              orgId,
              this.svc.createOrganization({
                name: 'Основная организация',
                shortName: 'Основная',
                // Valid 10-digit INN (checksum) — CreateOrganizationDto requires @IsINN()
                inn: '7707083893',
                isActive: true,
              }),
            ),
            docTypeId: ensureId(
              docTypeId,
              this.svc.createDocType({
                name: 'Коммерческое предложение',
                slug: 'kp',
                description: 'Тип документа по умолчанию',
                isActive: true,
              }),
            ),
          }).pipe(
            switchMap(({ orgId: ensuredOrgId, docTypeId: ensuredDocTypeId }) => {
              if (!ensuredOrgId.ok) {
                return of({ kind: 'setup-error' as const, error: ensuredOrgId.error });
              }
              if (!ensuredDocTypeId.ok) {
                return of({ kind: 'setup-error' as const, error: ensuredDocTypeId.error });
              }
              return this.svc
                .create({
                  name: `Шаблон ${new Date().toLocaleDateString('ru-RU')}`,
                  organizationId: ensuredOrgId.data,
                  docTypeId: ensuredDocTypeId.data,
                  categoryId: settings.categoryId,
                  pageSize: settings.pageSize,
                  orientation: settings.orientation,
                  isActive: true,
                })
                .pipe(map((result) => ({ kind: 'create-result' as const, result })));
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((outcome) => {
        this.creating.set(false);
        if (outcome.kind === 'setup-error') {
          this.toast.error(extractErrorMessage(outcome.error));
          return;
        }
        if (outcome.result.ok) {
          this.toast.success('Шаблон создан. Открываю конструктор…');
          this.router.navigate(['/doc-constructor/builder', outcome.result.data._id]);
        } else {
          this.toast.error(extractErrorMessage(outcome.result.error));
        }
      });
  }

  protected onToggleActive(t: DocumentTemplate, active: boolean): void {
    // Optimistic list update keeps the switch model in sync with row data.
    this.items.update((arr) => arr.map((x) => (x._id === t._id ? { ...x, isActive: active } : x)));
    this.svc.update(t._id, { isActive: active }).subscribe((res) => {
      if (!res.ok) {
        this.toast.error(extractErrorMessage(res.error));
        this.items.update((arr) =>
          arr.map((x) => (x._id === t._id ? { ...x, isActive: !active } : x)),
        );
      }
    });
  }

  protected onSetDefault(t: DocumentTemplate): void {
    if (!t.isActive) {
      this.toast.error('Сначала включите шаблон (Активен), затем назначьте по умолчанию');
      return;
    }
    this.svc.setDefault(t._id).subscribe((res) => {
      if (res.ok) {
        this.toast.success('Шаблон по умолчанию');
        this.reload();
      } else {
        this.toast.error(extractErrorMessage(res.error));
      }
    });
  }

  protected onEdit(t: DocumentTemplate): void {
    this.router.navigate(['/doc-constructor/builder', t._id]);
  }

  protected onDuplicate(t: DocumentTemplate): void {
    const ref = this.dialog.open<TemplateSetupResult>(TemplateSetupDialogComponent, {
      data: { mode: 'duplicate' },
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (result) => {
      if (!result) return;
      this.svc
        .duplicate(t._id)
        .pipe(
          switchMap((duplicateResult) => {
            if (!duplicateResult.ok) {
              return of({ kind: 'duplicate-error' as const, error: duplicateResult.error });
            }
            return this.svc
              .update(duplicateResult.data._id, {
                pageSize: result.pageSize,
                orientation: result.orientation,
              })
              .pipe(
                switchMap((updateResult) => {
                  if (updateResult.ok) {
                    return of({ kind: 'success' as const, id: duplicateResult.data._id });
                  }
                  return this.svc
                    .remove(duplicateResult.data._id)
                    .pipe(
                      map((cleanupResult) =>
                        cleanupResult.ok
                          ? { kind: 'update-error' as const, error: updateResult.error }
                          : { kind: 'cleanup-error' as const, error: cleanupResult.error },
                      ),
                    );
                }),
              );
          }),
        )
        .subscribe((outcome) => {
          if (
            outcome.kind === 'duplicate-error' ||
            outcome.kind === 'update-error' ||
            outcome.kind === 'cleanup-error'
          ) {
            this.toast.error(extractErrorMessage(outcome.error));
            return;
          }
          this.toast.success('Копия создана');
          this.router.navigate(['/doc-constructor/builder', outcome.id]);
        });
    });
  }

  protected onDelete(t: DocumentTemplate): void {
    const ref = this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Удалить шаблон?',
        message: `«${t.name}» и все его блоки будут удалены.`,
        confirmLabel: 'Удалить',
        variant: 'destructive',
      },
    });
    onDialogCloseOnce(ref, this.injector, (ok) => {
      if (!ok) return;
      this.svc.remove(t._id).subscribe((res) => {
        if (res.ok) {
          this.toast.success('Шаблон удалён');
          this.items.update((arr) => arr.filter((x) => x._id !== t._id));
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    });
  }
}
