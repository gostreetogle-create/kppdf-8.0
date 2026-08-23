import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse, httpResource } from '@angular/common/http';
import { LucideAngularModule, Check, ExternalLink, RefreshCw, Inbox } from 'lucide-angular';
import { PiGroupWorkspaceComponent } from '../../shared/page/pi-group-workspace.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PiToastService } from '../../shared/ui/toast/pi-toast.service';
import { extractErrorMessage } from '../../core/silent-http';
import { API_BASE_URL } from '../../core/api.tokens';
import { pluralize } from '../../shared/util/format';
import { ImportTodosService, type ImportTodo } from './import-todos.service';

/**
 * TZD-29 — manager import todos («что доделать после импорта»).
 *
 * Thin list page: open/done filter, «Готово» button (PATCH status),
 * href link when present. No heavy design; chrome = PiGroupWorkspace.
 */
export interface ImportTodoListResponse {
  items: ImportTodo[];
  total: number;
  page: number;
  limit: number;
}

type StatusFilter = 'all' | 'open' | 'done';

const STATUS_CHIPS = [
  { id: 'all', label: 'Все' },
  { id: 'open', label: 'Открытые' },
  { id: 'done', label: 'Выполненные' },
] as const;

@Component({
  selector: 'app-import-todos-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, PiGroupWorkspaceComponent, ButtonComponent, DatePipe],
  template: `
    <app-pi-group-workspace [chips]="[]" activeId="import-todos">
      <div tools class="flex items-center gap-form-field flex-wrap w-full">
        <div class="flex items-center gap-1">
          @for (chip of statusChips; track chip.id) {
            <button
              type="button"
              class="group-chip inline-flex items-center px-2.5 py-0.5 text-xs leading-5
                     rounded-sm transition-colors pi-focus-ring cursor-pointer"
              [class.bg-ink]="statusFilter() === chip.id"
              [class.text-paper]="statusFilter() === chip.id"
              [class.text-ink]="statusFilter() !== chip.id"
              [class.hover:bg-paper-2]="statusFilter() !== chip.id"
              [attr.aria-pressed]="statusFilter() === chip.id"
              (click)="setFilter(chip.id)"
              [attr.data-test]="'filter-' + chip.id"
            >
              {{ chip.label }}
            </button>
          }
        </div>
        <span class="flex-1"></span>
        <span class="text-xs text-muted-foreground">
          {{ visibleTotal() }} {{ todoLabel(visibleTotal()) }}
        </span>
        <app-pi-button variant="ghost" size="sm" (click)="reload()" data-test="reload-button">
          <lucide-icon [img]="RefreshIcon" [size]="14"></lucide-icon> Обновить
        </app-pi-button>
      </div>

      @if (error()) {
        <div
          role="alert"
          class="mb-6 border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive"
        >
          {{ error() }}
        </div>
      }

      @if (loading()) {
        <div class="py-10 text-center text-sm text-muted-foreground" role="status">Загрузка…</div>
      } @else if (filtered().length === 0) {
        <div
          class="max-w-lg mx-auto mt-4 p-8 pi-dashed-panel flex flex-col items-center gap-2 text-center"
          role="status"
          data-test="import-todos-empty"
        >
          <lucide-icon [img]="InboxIcon" [size]="20" class="text-muted-foreground"></lucide-icon>
          <p class="text-sm text-muted-foreground m-0 leading-relaxed">
            {{ emptyMessage() }}
          </p>
        </div>
      } @else {
        <ul class="space-y-2" data-test="import-todos-list">
          @for (todo of filtered(); track todo.id) {
            <li
              class="hairline rounded-sm px-4 py-3 flex items-start gap-3 bg-paper"
              [class.opacity-60]="todo.status === 'done'"
            >
              <div class="flex-1 min-w-0">
                <p
                  class="m-0 text-sm font-medium leading-snug"
                  [class.line-through]="todo.status === 'done'"
                >
                  {{ todo.title }}
                </p>
                @if (todo.body) {
                  <p
                    class="m-0 mt-1 text-xs text-muted-foreground leading-relaxed whitespace-pre-line"
                  >
                    {{ todo.body }}
                  </p>
                }
                <p class="m-0 mt-1 text-[11px] text-muted-foreground font-mono">
                  {{ todo.createdAt ? (todo.createdAt | date: 'dd.MM.yyyy HH:mm') : '—' }}
                </p>
              </div>
              <div class="flex items-center gap-1 shrink-0">
                @if (todo.href) {
                  <a
                    [href]="todo.href"
                    class="pi-icon-btn pi-focus-ring"
                    [attr.aria-label]="'Открыть: ' + todo.title"
                    title="Открыть связанную страницу"
                  >
                    <lucide-icon [img]="ExternalLinkIcon" [size]="14"></lucide-icon>
                  </a>
                }
                @if (todo.status === 'open') {
                  <app-pi-button
                    variant="default"
                    size="sm"
                    (click)="markDone(todo)"
                    [attr.data-test]="'done-button-' + todo.id"
                  >
                    <lucide-icon [img]="CheckIcon" [size]="14"></lucide-icon> Готово
                  </app-pi-button>
                }
              </div>
            </li>
          }
        </ul>
      }
    </app-pi-group-workspace>
  `,
})
export class ImportTodosPage {
  protected readonly statusChips = STATUS_CHIPS;
  protected readonly RefreshIcon = RefreshCw;
  protected readonly CheckIcon = Check;
  protected readonly ExternalLinkIcon = ExternalLink;
  protected readonly InboxIcon = Inbox;

  private readonly baseUrl = inject(API_BASE_URL);
  private readonly todosService = inject(ImportTodosService);
  private readonly toast = inject(PiToastService);

  protected readonly statusFilter = signal<StatusFilter>('open');

  protected readonly listRes = httpResource<ImportTodoListResponse>(() => ({
    url: `${this.baseUrl}/import-todos`,
  }));

  protected readonly loading = computed(() => this.listRes.isLoading());
  protected readonly error = computed<string | null>(() => {
    const err = this.listRes.error() as HttpErrorResponse | undefined;
    return err ? extractErrorMessage(err) : null;
  });

  protected readonly items = computed<ImportTodo[]>(() => this.listRes.value()?.items ?? []);

  protected readonly filtered = computed<ImportTodo[]>(() => {
    const f = this.statusFilter();
    if (f === 'all') return this.items();
    return this.items().filter((t) => t.status === f);
  });

  protected readonly visibleTotal = computed(() => this.filtered().length);

  protected readonly listTotal = computed(() => this.listRes.value()?.total ?? 0);

  protected readonly emptyMessage = computed(() => {
    if (this.listTotal() === 0) {
      return 'Задачи появляются после импорта из Desktop. Для шаблона КП используйте Desktop → Импорт или создайте шаблон в Конструкторе документов.';
    }
    if (this.statusFilter() === 'open') {
      return 'Нет открытых задач импорта. Когда агент создаст todo — он появится здесь.';
    }
    return 'Ничего не найдено.';
  });

  protected setFilter(f: StatusFilter): void {
    this.statusFilter.set(f);
  }

  protected reload(): void {
    this.listRes.reload();
  }

  protected markDone(todo: ImportTodo): void {
    this.todosService.markDone(todo.id).subscribe((res) => {
      if (res.ok) {
        this.toast.success('Задача выполнена');
        this.listRes.reload();
      } else {
        this.toast.error(extractErrorMessage(res.error));
      }
    });
  }

  protected todoLabel(n: number): string {
    return pluralize(n, ['задача', 'задачи', 'задач']);
  }
}
