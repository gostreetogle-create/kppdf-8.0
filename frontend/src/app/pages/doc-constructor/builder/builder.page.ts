import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse, httpResource } from '@angular/common/http';
import {
  Subject,
  debounceTime,
  groupBy,
  mergeMap,
  switchMap,
} from 'rxjs';
import { LucideAngularModule, FileText, Plus, RefreshCw } from 'lucide-angular';
import { TemplateBlocksService } from '../../../shared/services/pi-template-blocks.service';
import { DocumentTemplatesService } from '../../../shared/services/pi-document-templates.service';
import { extractErrorMessage, SilentResult } from '../../../core/silent-http';
import {
  blockKey,
  type DataBindingSource,
  type TemplateBlock,
} from '../../../shared/template-block/template-block.types';
import type { TextBlock } from '../../../shared/services/pi-text-blocks.service';
import type { TableTemplate } from '../../../shared/services/pi-table-templates.service';
import type { DocumentTemplate } from '../../../shared/services/pi-document-templates.service';
import { PiPageHeaderComponent } from '../../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../../shared/page/pi-section.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { SelectComponent } from '../../../shared/ui/select/select.component';
import { PiToastService } from '../../../shared/ui/toast';
import {
  AddBlockPayload,
  BuilderToolPaneComponent,
} from './builder-tool-pane.component';
import { BuilderCanvasComponent } from './builder-canvas.component';
import { BuilderInspectorComponent } from './builder-inspector.component';

/**
 * TZ-86 Phase D.1 — `BuilderPage` (3-pane shell, state orchestrator).
 *
 * Layout (320 + 1fr + 320):
 *   ┌──────────┬──────────────────────────┬──────────────┐
 *   │ Tool     │ Canvas                   │ Inspector    │
 *   │ Pane     │ (cdkDropList)            │              │
 *   │ 280px    │ flex-1                   │ 320px        │
 *   └──────────┴──────────────────────────┴──────────────┘
 *
 * State model:
 *   - `templateId` = route param :id (or null → empty picker state)
 *   - `blocks` = signal<TemplateBlock[]>  — canonical in-memory list
 *   - `selectedId` = signal<string | null>  — drives canvas outline + Inspector
 *
 * Auto-save architecture:
 *   Subject<{_id, patch}> → groupBy(_id) → debounceTime(1500) → switchMap → service.update()
 *
 * Reorder: optimistic update → atomic POST /reorder → on error roll back.
 *
 * Empty state (no :id): template-list picker → navigate to /doc-constructor/builder/:id.
 */
@Component({
  selector: 'app-builder-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LucideAngularModule,
    PiPageHeaderComponent,
    PiSectionComponent,
    ButtonComponent,
    SelectComponent,
    BuilderToolPaneComponent,
    BuilderCanvasComponent,
    BuilderInspectorComponent,
  ],
  template: `
    <pi-page-header
      title="Конструктор документов"
      [subtitle]="headerSubtitle()"
    >
      @if (templateId()) {
        <pi-button
          variant="ghost"
          size="sm"
          (click)="onReload()"
          ariaLabel="Перезагрузить блоки"
        >
          <lucide-icon [img]="RefreshIcon" [size]="14"></lucide-icon>
          Обновить
        </pi-button>
      }
    </pi-page-header>

    @if (!templateId()) {
      <pi-section title="Выберите шаблон" description="Список доступных шаблонов для редактирования">
        @if (templateListRes.isLoading()) {
          <p class="empty-state">Загрузка шаблонов…</p>
        } @else if (templateListRes.error()) {
          <p class="empty-state empty-state--error">
            Не удалось загрузить шаблоны: {{ templateListErrorMessage() }}
          </p>
        } @else if (templateListRes.value() && templateListRes.value()!.length > 0) {
          <div class="picker">
            <pi-select
              [options]="templateOptions()"
              [value]="''"
              (valueChange)="onTemplatePick($event)"
              placeholder="Выберите шаблон…"
            />
          </div>
        } @else {
          <p class="empty-state">
            Нет шаблонов. Создайте шаблон в разделе «Документы» → «Шаблоны».
          </p>
        }
      </pi-section>
    } @else {
      <div class="builder-shell">
        <app-builder-tool-pane (addBlock)="onAddBlock($event)" />

        <app-builder-canvas
          [blocks]="blocks()"
          [selectedId]="selectedId()"
          (select)="onSelect($event)"
          (reorder)="onReorder($event)"
        />

        <app-builder-inspector
          [block]="selectedBlock()"
          (update)="onInspectorUpdate($event)"
          (delete)="onDeleteBlock($event)"
        />
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 0;
      }

      .builder-shell {
        display: flex;
        flex: 1;
        min-height: 0;
        border-top: 1px solid oklch(var(--color-rule));
      }

      .empty-state {
        text-align: center;
        color: oklch(var(--color-muted));
        padding: 32px 16px;
        font-size: 13px;
        margin: 0;
      }

      .empty-state--error {
        color: oklch(var(--color-destructive));
      }

      .picker {
        max-width: 480px;
      }
    `,
  ],
})
export class BuilderPage {
  // DI
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly blocksSvc = inject(TemplateBlocksService);
  private readonly templatesSvc = inject(DocumentTemplatesService);
  private readonly toast = inject(PiToastService);
  private readonly destroyRef = inject(DestroyRef);

  // Icons
  protected readonly FileTextIcon = FileText;
  protected readonly PlusIcon = Plus;
  protected readonly RefreshIcon = RefreshCw;

  // State
  protected readonly templateId = signal<string | null>(null);
  protected readonly blocks = signal<TemplateBlock[]>([]);
  protected readonly selectedId = signal<string | null>(null);
  protected readonly isLoading = signal<boolean>(false);

  // Auto-save Subject — grouped by _id, debounced per group.
  private readonly save$ = new Subject<{ _id: string; patch: Partial<TemplateBlock> }>();

  // Selected block derived
  protected readonly selectedBlock = computed<TemplateBlock | null>(() => {
    const id = this.selectedId();
    if (!id) return null;
    return this.blocks().find((b) => blockKey(b) === id) ?? null;
  });

  protected readonly headerSubtitle = computed<string>(() => {
    const id = this.templateId();
    if (!id) return 'Выберите шаблон для редактирования';
    const count = this.blocks().length;
    return `Шаблон ${id.slice(-6)} · ${count} ${pluralBlocks(count)}`;
  });

  // httpResource for the template picker (only used when no :id).
  protected readonly templateListRes = httpResource<DocumentTemplate[]>(
    () => '/api/document-templates',
    { defaultValue: [] },
  );

  protected readonly templateOptions = computed<{ value: string; label: string }[]>(() => {
    const items = this.templateListRes.value() ?? [];
    return items.map((t) => ({ value: t._id, label: t.name }));
  });

  protected readonly templateListErrorMessage = computed<string>(() => {
    const err = this.templateListRes.error() as HttpErrorResponse | null;
    return err ? extractErrorMessage(err) : '';
  });

  constructor() {
    // 1) Initialize save$ pipeline (groupBy _id → debounce 1500 → switchMap)
    this.save$
      .pipe(
        groupBy((p) => p._id),
        mergeMap((group$) =>
          group$.pipe(
            debounceTime(1500),
            switchMap(({ _id, patch }) =>
              this.blocksSvc.update(_id, patch),
            ),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res) => this.handleSaveResult(res));

    // 2) Watch route param :id → set templateId → fetch blocks
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = params.get('id');
      this.templateId.set(id);
      this.blocks.set([]);
      this.selectedId.set(null);
      if (id) this.loadBlocks(id);
    });
  }

  // ─────────────────────────────────────────────────────────────
  // Initial load
  // ─────────────────────────────────────────────────────────────
  private loadBlocks(id: string): void {
    this.isLoading.set(true);
    this.blocksSvc.listByTemplate(id).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.ok) {
          this.blocks.set(res.data ?? []);
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.toast.error(extractErrorMessage(err));
      },
    });
  }

  // ─────────────────────────────────────────────────────────────
  // Tool pane → add block
  // ─────────────────────────────────────────────────────────────
  protected onAddBlock(payload: AddBlockPayload): void {
    const tid = this.templateId();
    if (!tid) {
      this.toast.error('Сначала выберите шаблон');
      return;
    }
    const newBlock = this.buildBlockFromPayload(tid, payload, this.blocks().length);
    // Optimistic insert (prepend; new blocks appear at the top)
    this.blocks.update((arr) => [newBlock, ...arr]);
    this.selectedId.set(blockKey(newBlock));

    if (!newBlock._id) {
      this.blocksSvc
        .add(tid, {
          type: newBlock.type,
          order: newBlock.order,
          title: newBlock.title,
          content: newBlock.content,
          height: newBlock.height,
          showLine: newBlock.showLine,
          settings: newBlock.settings,
          dataBinding: newBlock.dataBinding,
          isActive: newBlock.isActive,
        })
        .subscribe({
          next: (res) => {
            // Early return on failure so the success branch narrows `res`
            // to `{ok: true, data: TemplateBlock}` before accessing res.data.
            if (!res.ok) {
              this.toast.error(extractErrorMessage(res.error));
              this.blocks.update((arr) => arr.filter((b) => b.tempId !== newBlock.tempId));
              return;
            }
            // Success branch — swap tempId for server _id
            this.blocks.update((arr) =>
              arr.map((b) => (b.tempId === newBlock.tempId ? res.data : b)),
            );
            this.selectedId.set(res.data._id ?? null);
          },
          error: (err: HttpErrorResponse) => {
            this.toast.error(extractErrorMessage(err));
            this.blocks.update((arr) => arr.filter((b) => b.tempId !== newBlock.tempId));
          },
        });
    }
  }

  /**
   * Build a new TemplateBlock from the 4 AddBlockPayload variants.
   * Pinned to BLOCK_TYPES + DATA_BINDING_SOURCES in the types module.
   */
  private buildBlockFromPayload(
    templateId: string,
    payload: AddBlockPayload,
    order: number,
  ): TemplateBlock {
    const tempId = crypto.randomUUID();
    const base = {
      tempId,
      templateId,
      order,
      isActive: true,
      showLine: false,
      dataBinding: null,
    };
    switch (payload.source) {
      case 'block-type':
        return {
          ...base,
          type: payload.type,
          content: '',
        };
      case 'text-block':
        return {
          ...base,
          type: 'text',
          title: payload.textBlock.name,
          content: payload.textBlock.content,
          dataBinding: { source: 'static' as DataBindingSource, value: payload.textBlock._id ?? '' },
        };
      case 'table-template':
        return {
          ...base,
          type: 'table',
          title: payload.tableTemplate.name,
          settings: { tableTemplateId: payload.tableTemplate._id },
        };
      case 'data-binding':
        return {
          ...base,
          type: 'text',
          content: `[${payload.field.label}]`,
          dataBinding: { source: payload.dataSource, field: payload.field.key },
        };
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Canvas → select / reorder
  // ─────────────────────────────────────────────────────────────
  protected onSelect(block: TemplateBlock): void {
    this.selectedId.set(blockKey(block));
  }

  protected onReorder(next: TemplateBlock[]): void {
    const reindexed = next.map((b, i) => ({ ...b, order: i }));
    const previous = this.blocks();
    this.blocks.set(reindexed);

    const tid = this.templateId();
    if (!tid) return;

    const ids = reindexed.filter((b) => b._id).map((b) => b._id!);
    this.blocksSvc
      .reorder(tid, { blockIds: ids })
      .subscribe({
        next: (res) => {
          if (res.ok) {
            this.toast.success('Порядок блоков сохранён');
          } else {
            this.toast.error(extractErrorMessage(res.error));
            this.blocks.set(previous); // rollback
          }
        },
        error: (err: HttpErrorResponse) => {
          this.toast.error(extractErrorMessage(err));
          this.blocks.set(previous); // rollback
        },
      });
  }

  // ─────────────────────────────────────────────────────────────
  // Inspector → update / delete
  // ─────────────────────────────────────────────────────────────
  protected onInspectorUpdate(patch: Partial<TemplateBlock> & { _id: string }): void {
    const { _id, ...rest } = patch;
    this.blocks.update((arr) =>
      arr.map((b) => (b._id === _id ? { ...b, ...rest } : b)),
    );
    this.save$.next({ _id, patch: rest });
  }

  protected onDeleteBlock(id: string): void {
    this.blocks.update((arr) => arr.filter((b) => b._id !== id));
    if (this.selectedId() === id) this.selectedId.set(null);
    this.blocksSvc.remove(id).subscribe({
      next: (res) => {
        if (res.ok) this.toast.success('Блок удалён');
        else {
          this.toast.error(extractErrorMessage(res.error));
          this.loadBlocks(this.templateId() ?? '');
        }
      },
      error: (err: HttpErrorResponse) => this.toast.error(extractErrorMessage(err)),
    });
  }

  // ─────────────────────────────────────────────────────────────
  // Misc handlers
  // ─────────────────────────────────────────────────────────────
  protected onReload(): void {
    const tid = this.templateId();
    if (tid) this.loadBlocks(tid);
  }

  protected onTemplatePick(value: string | string[]): void {
    const id = Array.isArray(value) ? value[0] : value;
    if (id) this.router.navigate(['/doc-constructor/builder', id]);
  }

  /**
   * Auto-save result handler. Uses early-return on `!res.ok` so TypeScript
   * narrows the SilentResult<TemplateBlock> discriminated union to
   * `{ok: false, error: HttpErrorResponse}` before accessing `res.error`.
   */
  private handleSaveResult(res: SilentResult<TemplateBlock>): void {
    if (!res.ok) {
      const code = res.error.status;
      if (code === 409) {
        this.toast.error('Конфликт: шаблон изменён другим пользователем');
      } else {
        this.toast.error(`Ошибка сохранения: ${extractErrorMessage(res.error)}`);
      }
      return;
    }
    this.blocks.update((arr) =>
      arr.map((b) => (b._id === res.data._id ? res.data : b)),
    );
  }
}

// ─────────────────────────────────────────────────────────────
// Russian noun pluralization (1 блок, 2 блока, 5 блоков)
// ─────────────────────────────────────────────────────────────
function pluralBlocks(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'блок';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'блока';
  return 'блоков';
}
