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
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
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
import { extractErrorMessage } from '../../../core/silent-http';
import { API_BASE_URL } from '../../../core/api.tokens';
import {
  DocumentTemplate,
  DocumentTemplatesService,
} from '../../../shared/services/pi-document-templates.service';
import { pluralRu } from '../../../shared/util/russian-plural';

const RU_TEMPLATES = ['шаблон', 'шаблона', 'шаблонов'] as const;
const PAGE_SIZE = 10;

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
      <app-pi-button variant="default" (click)="onCreate()" [disabled]="creating()" data-test="create-template-button">
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
          [message]="searchQuery() ? 'Ничего не найдено.' : 'Нет шаблонов. Нажмите «Создать шаблон».'"
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
                    <span class="eyebrow hairline rounded-sm px-2 py-0.5 font-mono">{{ t.pageSize }}</span>
                  </td>
                  <td class="pi-cell text-center">
                    <app-pi-switch
                      [checked]="t.isActive"
                      (checkedChange)="onToggleActive(t, $event)"
                    />
                  </td>
                  <td class="pi-cell text-center">
                    @if (t.isDefault) {
                      <span class="text-sunrise-warm" aria-label="Шаблон по умолчанию" title="По умолчанию">★</span>
                    } @else {
                      <button
                        type="button"
                        class="pi-icon-btn pi-focus-ring text-muted-foreground hover:text-sunrise-warm"
                        aria-label="Сделать шаблоном по умолчанию"
                        (click)="onSetDefault(t)"
                      >☆</button>
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
              <app-pi-button variant="outline" size="sm" [disabled]="pageIndex() === 0" (click)="prevPage()">
                ←
              </app-pi-button>
              <app-pi-button variant="outline" size="sm" [disabled]="pageIndex() >= totalPages() - 1" (click)="nextPage()">
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
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
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
    const list = this.items().slice().sort((a, b) => a.name.localeCompare(b.name, 'ru'));
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
    this.svc.list().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
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
    this.creating.set(true);
    forkJoin([
      this.http.get<{ items: { _id: string }[] }>(`${this.baseUrl}/organizations?limit=1`),
      this.http.get<{ _id: string }[]>(`${this.baseUrl}/doc-types`),
    ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ([orgRes, dtRes]) => {
          const orgId = orgRes?.items?.[0]?._id;
          const docTypeId = dtRes?.[0]?._id;
          if (!orgId || !docTypeId) {
            this.toast.error('Сначала создайте организацию и тип документа');
            this.creating.set(false);
            return;
          }
          this.svc
            .create({
              name: `Шаблон ${new Date().toLocaleDateString('ru-RU')}`,
              organizationId: orgId,
              docTypeId,
              pageSize: 'A4',
              isActive: true,
            })
            .subscribe({
              next: (res) => {
                this.creating.set(false);
                if (res.ok) {
                  this.toast.success('Шаблон создан');
                  this.router.navigate(['/doc-constructor/builder', res.data._id]);
                } else {
                  this.toast.error(extractErrorMessage(res.error));
                }
              },
              error: () => this.creating.set(false),
            });
        },
        error: () => this.creating.set(false),
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
    this.http.post(`${this.baseUrl}/document-templates/${t._id}/set-default`, {}).subscribe({
      next: () => {
        this.toast.success('Шаблон по умолчанию');
        this.reload();
      },
      error: (err) => this.toast.error(extractErrorMessage(err)),
    });
  }

  protected onEdit(t: DocumentTemplate): void {
    this.router.navigate(['/doc-constructor/builder', t._id]);
  }

  protected onDuplicate(t: DocumentTemplate): void {
    this.http.post<DocumentTemplate>(`${this.baseUrl}/document-templates/${t._id}/duplicate`, {})
      .subscribe({
        next: (copy) => {
          this.toast.success('Копия создана');
          this.router.navigate(['/doc-constructor/builder', copy._id]);
        },
        error: (err) => this.toast.error(extractErrorMessage(err)),
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
