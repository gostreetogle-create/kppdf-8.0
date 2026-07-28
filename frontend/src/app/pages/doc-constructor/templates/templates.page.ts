import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, forkJoin, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { PiPageHeaderComponent } from '../../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../../shared/page/pi-section.component';
import { PiToolbarComponent } from '../../../shared/page/pi-toolbar.component';
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
import { extractErrorMessage } from '../../../core/silent-http';
import {
  DocumentTemplate,
  DocumentTemplatesService,
} from '../../../shared/services/pi-document-templates.service';
import { OrganizationsService } from '../../../shared/services/organizations.service';
import { DocTypesService } from '../../../shared/services/doc-types.service';
import { pluralRu } from '../../../shared/util/russian-plural';

const RU_TEMPLATES = ['шаблон', 'шаблона', 'шаблонов'] as const;
const PAGE_SIZE = 10;

/**
 * Полная документация страницы: docs/pages/templates.page.md
 *
 * TZ-232.F: нет ни одного raw `HttpClient` вызова в этом компоненте. Все
 * обращения к backend идут через типизированные {@link OrganizationsService},
 * {@link DocTypesService} и {@link DocumentTemplatesService} сервисы,
 * которые возвращают discriminated {@link SilentResult} union — ошибки
 * приходят как `{ok:false, error:HttpErrorResponse}`, а не через RxJS
 * `error`-channel. Это разблокирует full ESLint-применение правила
 * `@pi-dsl/no-raw-http-in-components`.
 */
@Component({
  selector: 'app-templates-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PiPageHeaderComponent,
    PiSectionComponent,
    PiToolbarComponent,
    PiEmptyStateComponent,
    PiRowActionsComponent,
    ButtonComponent,
    SwitchComponent,
  ],
  template: `
    <app-pi-page-header
      eyebrow="раздел · конструктор документов"
      title="Реестр шаблонов"
      description="Шаблоны документов: тип, формат страницы, активность. Откройте конструктор для сборки блоков."
    />

    <app-pi-toolbar>
      <input
        type="search"
        class="pi-input w-72"
        placeholder="Поиск по названию или типу…"
        [value]="searchQuery()"
        (input)="onSearch($event)"
        aria-label="Поиск шаблонов"
      />
      <app-pi-button
        variant="default"
        (click)="onCreate()"
        [disabled]="creating()"
        data-test="create-template-button"
      >
        {{ creating() ? 'Создание…' : '+ Создать шаблон' }}
      </app-pi-button>
      <span hint>{{ filtered().length }} {{ totalLabel(filtered().length) }}</span>
    </app-pi-toolbar>

    <app-pi-section title="Каталог" eyebrow="I">
      @if (loading()) {
        <app-pi-empty-state [colspan]="1" message="Загрузка…" state="loading" />
      } @else if (filtered().length === 0) {
        <app-pi-empty-state
          [colspan]="1"
          [message]="
            searchQuery() ? 'Ничего не найдено.' : 'Нет шаблонов. Нажмите «Создать шаблон».'
          "
        />
      } @else {
        <div class="hairline rounded-sm overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="hairline-b">
              <tr>
                <th class="pi-cell eyebrow text-left">Название</th>
                <th class="pi-cell eyebrow text-left">Тип документа</th>
                <th class="pi-cell eyebrow text-left w-24">Формат</th>
                <th class="pi-cell eyebrow text-center w-24">Активен</th>
                <th class="pi-cell eyebrow text-center w-28">По умолчанию</th>
                <th class="pi-cell eyebrow text-right w-40">Действия</th>
              </tr>
            </thead>
            <tbody>
              @for (t of pageRows(); track t._id) {
                <tr class="pi-table-row pi-table-row-odd group" [class.opacity-50]="!t.isActive">
                  <td class="pi-cell font-medium">{{ t.name }}</td>
                  <td class="pi-cell text-muted-foreground">{{ docTypeName(t) }}</td>
                  <td class="pi-cell">
                    <span class="eyebrow hairline rounded-sm px-2 py-0.5 font-mono">{{
                      t.pageSize
                    }}</span>
                  </td>
                  <td class="pi-cell text-center">
                    <app-pi-switch
                      [checked]="t.isActive"
                      (checkedChange)="onToggleActive(t, $event)"
                    />
                  </td>
                  <td class="pi-cell text-center">
                    @if (t.isDefault) {
                      <span
                        class="text-sunrise-warm"
                        aria-label="Шаблон по умолчанию"
                        title="По умолчанию"
                        >★</span
                      >
                    } @else {
                      <button
                        type="button"
                        class="pi-icon-btn pi-focus-ring text-muted-foreground hover:text-sunrise-warm"
                        aria-label="Сделать шаблоном по умолчанию"
                        (click)="onSetDefault(t)"
                      >
                        ☆
                      </button>
                    }
                  </td>
                  <td class="pi-cell text-right">
                    <app-pi-row-actions
                      [row]="t"
                      documentLabel="Дублировать"
                      editLabel="Конструктор"
                      deleteLabel="Удалить"
                      (document)="onDuplicate($event)"
                      (edit)="onEdit($event)"
                      (delete)="onDelete($event)"
                    />
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (filtered().length > PAGE_SIZE) {
          <div class="mt-4 flex items-center justify-between gap-4">
            <span class="eyebrow text-muted-foreground">{{ rangeLabel() }}</span>
            <div class="flex gap-2">
              <app-pi-button
                variant="outline"
                size="sm"
                [disabled]="pageIndex() === 0"
                (click)="prevPage()"
              >
                ←
              </app-pi-button>
              <app-pi-button
                variant="outline"
                size="sm"
                [disabled]="pageIndex() >= totalPages() - 1"
                (click)="nextPage()"
              >
                →
              </app-pi-button>
            </div>
          </div>
        }
      }
    </app-pi-section>
  `,
})
export class TemplatesPage {
  protected readonly PAGE_SIZE = PAGE_SIZE;

  private readonly svc = inject(DocumentTemplatesService);
  private readonly orgSvc = inject(OrganizationsService);
  private readonly docTypeSvc = inject(DocTypesService);
  private readonly router = inject(Router);
  private readonly toast = inject(PiToastService);
  private readonly dialog = inject(PiDialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  protected readonly items = signal<DocumentTemplate[]>([]);
  protected readonly loading = signal(true);
  protected readonly creating = signal(false);
  protected readonly searchQuery = signal('');
  protected readonly pageIndex = signal(0);

  protected readonly filtered = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const list = this.items()
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name, 'ru'));
    if (!q) return list;
    return list.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        this.docTypeName(t).toLowerCase().includes(q) ||
        t.pageSize.toLowerCase().includes(q),
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

  private reload(): void {
    this.loading.set(true);
    this.svc
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          if (res.ok) this.items.set(res.data.items ?? []);
        },
        error: () => this.loading.set(false),
      });
  }

  protected totalLabel(n: number): string {
    return pluralRu(n, RU_TEMPLATES);
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

  protected onCreate(): void {
    const ref = this.dialog.open<TemplateSetupResult>(TemplateSetupDialogComponent, {
      data: { mode: 'create' },
    });
    onDialogCloseOnce(ref, this.injector, (result) => {
      if (!result) return;
      this.createWithSettings(result);
    });
  }

  /**
   * Pipeline:
   * 1) Parallel lookup: 1 organization (paginated) + all doc-types.
   * 2) For each missing entity, auto-create the project default ('Основная
   *    организация' / 'Коммерческое предложение' with slug 'kp'). Failures
   *    in this auto-create branch throw inside the map() so they propagate
   *    to the outer error handler — we do NOT silently create a broken
   *    template with a missing FK.
   * 3) Once both ids exist, POST the DocumentTemplate (inactive).
   * 4) Navigate to the builder for the new template on success.
   */
  private createWithSettings(settings: TemplateSetupResult): void {
    this.creating.set(true);

    forkJoin({
      orgs: this.orgSvc.list({ page: 1, limit: 1 }),
      docTypes: this.docTypeSvc.list(),
    })
      .pipe(
        switchMap(({ orgs, docTypes }) => {
          const existingOrgId =
            orgs.ok && orgs.data.items.length > 0 ? orgs.data.items[0]._id : null;
          const existingDocTypeId =
            docTypes.ok && docTypes.data.items.length > 0
              ? docTypes.data.items[0]._id
              : null;

          const ensureDocType$: Observable<string> = existingDocTypeId
            ? of(existingDocTypeId)
            : this.docTypeSvc
                .create({
                  name: 'Коммерческое предложение',
                  slug: 'kp',
                  description: 'Тип документа по умолчанию',
                  isActive: true,
                } as never)
                .pipe(
                  map((res) => {
                    if (!res.ok) throw res.error;
                    return res.data._id;
                  }),
                );

          const ensureOrg$: Observable<string> = existingOrgId
            ? of(existingOrgId)
            : this.orgSvc
                .create({
                  name: 'Основная организация',
                  shortName: 'Основная',
                  isActive: true,
                } as never)
                .pipe(
                  map((res) => {
                    if (!res.ok) throw res.error;
                    return res.data._id;
                  }),
                );

          return forkJoin({ docTypeId: ensureDocType$, orgId: ensureOrg$ });
        }),
        switchMap(({ docTypeId: dtId, orgId: oId }) =>
          this.svc.create({
            name: `Шаблон ${new Date().toLocaleDateString('ru-RU')}`,
            organizationId: oId,
            docTypeId: dtId,
            pageSize: settings.pageSize,
            orientation: settings.orientation,
            isActive: false,
          }),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (res) => {
          this.creating.set(false);
          if (res.ok) {
            this.toast.success('Шаблон создан (неактивен). Откройте конструктор.');
            this.router.navigate(['/doc-constructor/builder', res.data._id]);
          } else {
            this.toast.error(extractErrorMessage(res.error));
          }
        },
        error: (err: HttpErrorResponse) => {
          this.creating.set(false);
          this.toast.error(extractErrorMessage(err));
        },
      });
  }

  protected onToggleActive(t: DocumentTemplate, active: boolean): void {
    this.svc.update(t._id, { isActive: active }).subscribe({
      next: (res) => {
        if (res.ok) {
          this.items.update((arr) =>
            arr.map((x) => (x._id === t._id ? { ...x, isActive: active } : x)),
          );
        }
      },
    });
  }

  protected onSetDefault(t: DocumentTemplate): void {
    this.svc.setDefault(t._id).subscribe({
      next: (res) => {
        if (res.ok) {
          this.toast.success('Шаблон по умолчанию');
          this.reload();
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      },
      error: (err: HttpErrorResponse) => this.toast.error(extractErrorMessage(err)),
    });
  }

  protected onEdit(t: DocumentTemplate): void {
    this.router.navigate(['/doc-constructor/builder', t._id]);
  }

  protected onDuplicate(t: DocumentTemplate): void {
    const ref = this.dialog.open<TemplateSetupResult>(TemplateSetupDialogComponent, {
      data: { mode: 'duplicate' },
    });
    onDialogCloseOnce(ref, this.injector, (result) => {
      if (!result) return;
      this.svc.duplicate(t._id).subscribe({
        next: (dupRes) => {
          if (!dupRes.ok) {
            this.toast.error(extractErrorMessage(dupRes.error));
            return;
          }
          const copy = dupRes.data;
          // Apply chosen format/orientation to the duplicate; navigate even
          // if the post-create patch fails (the copy exists either way).
          this.svc
            .update(copy._id, {
              pageSize: result.pageSize,
              orientation: result.orientation,
            })
            .subscribe({
              next: () => {
                this.toast.success('Копия создана');
                this.router.navigate(['/doc-constructor/builder', copy._id]);
              },
              error: () => {
                this.toast.success('Копия создана');
                this.router.navigate(['/doc-constructor/builder', copy._id]);
              },
            });
        },
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
      this.svc.remove(t._id).subscribe({
        next: (res) => {
          if (res.ok) {
            this.toast.success('Шаблон удалён');
            this.items.update((arr) => arr.filter((x) => x._id !== t._id));
          }
        },
      });
    });
  }
}

