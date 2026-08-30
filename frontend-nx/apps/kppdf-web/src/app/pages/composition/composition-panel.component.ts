import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { firstValueFrom, type Observable } from 'rxjs';
import {
  PiCompositionService,
  type CompositionLine,
  type CompositionLineUpdateDto,
  type CompositionLineUpsertDto,
  type CompositionParentKind,
  type CompositionTreeNode,
} from '@kppdf/data-access';
import { ButtonComponent } from '@kppdf/ui/button';
import { PiDialogService, AlertDialogComponent } from '@kppdf/ui/dialog';
import { PiStatusBannerComponent } from '@kppdf/ui/status-banner';
import { PiToastService } from '@kppdf/ui/toast';
import { extractErrorMessage, type SilentResult } from '@kppdf/util-http';
import { onDialogCloseOnce } from '../on-dialog-close-once';
import { findCompositionLine } from './composition-line-resolve';
import {
  CompositionTreeComponent,
  type CompositionTreeSelectEvent,
} from './composition-tree.component';
import { canAddIntoNode, kindShort, treeHasProductChild } from './composition-tree.contract';
import {
  CompositionPickerDialogComponent,
  type CompositionPickerDialogData,
  type CompositionPickerResult,
} from './composition-picker-dialog.component';

type CompositionAddTarget = {
  parentKind: CompositionParentKind;
  parentId: string;
};

@Component({
  selector: 'pi-composition-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, PiStatusBannerComponent, CompositionTreeComponent],
  template: `
    <section
      class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,18rem)] gap-3 items-start"
      data-test="composition-panel"
    >
      <div class="hairline rounded-sm bg-paper min-w-0 overflow-hidden">
        <div class="flex flex-wrap items-center justify-between gap-2 px-3 py-2 hairline-b bg-paper-2/50">
          <div>
            <h3 class="font-display text-base tracking-tight m-0">Состав</h3>
            <p class="text-[11px] text-muted-foreground m-0">Клик по строке — выбрать и раскрыть</p>
          </div>
          @if (showComplexBadge()) {
            <span
              class="inline-flex items-center px-2 py-0.5 text-[11px] hairline rounded-sm bg-sunrise-warm/10 text-gold-deep"
              data-test="composition-complex-badge"
              >Комплекс</span
            >
          }
        </div>

        @if (pageError()) {
          <app-pi-status-banner
            variant="error"
            [message]="pageError()!"
            actionLabel="Повторить"
            (action)="reload()"
            data-test="composition-error-banner"
          />
        } @else if (loading()) {
          <p class="py-3 text-center text-xs text-muted-foreground" role="status">Загрузка состава…</p>
        } @else {
          <div class="p-2" data-test="composition-tree-scroll">
            <pi-composition-tree
              [root]="tree()"
              [selectedId]="selectedId()"
              (selectedChange)="onSelect($event)"
            />
          </div>
        }
      </div>

      <aside class="hairline rounded-sm bg-paper p-3 flex flex-col gap-4 lg:sticky lg:top-3" data-test="composition-inspector">
        @if (selected(); as sel) {
          <div class="rounded-sm hairline bg-paper-2/40 px-3 py-3" data-test="composition-inspector-what">
            <p class="text-xs text-muted-foreground m-0 leading-none">{{ kindShort(sel.node.kind) }}</p>
            <p class="mt-1.5 font-display text-base font-medium text-ink leading-snug m-0 break-words" data-test="composition-inspector-name">
              {{ sel.node.name }}
            </p>
          </div>

          @if (sel.depth > 0 && sel.node.lineType) {
            <div class="flex flex-col gap-1.5" data-test="composition-inspector-qty-section">
              <label class="text-xs text-muted-foreground m-0" for="composition-inspector-qty-input">Количество</label>
              <input
                id="composition-inspector-qty-input"
                class="pi-input w-full"
                type="number"
                min="0.0001"
                step="0.001"
                [value]="sel.node.quantity"
                (change)="onQtyChange(sel, $event)"
                data-test="composition-inspector-qty"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs text-muted-foreground m-0" for="composition-inspector-unit-input">Единица</label>
              <input
                id="composition-inspector-unit-input"
                class="pi-input w-full"
                type="text"
                [value]="sel.node.unit ?? ''"
                (change)="onUnitChange(sel, $event)"
                data-test="composition-inspector-unit"
              />
            </div>

            <app-pi-button
              variant="destructive"
              size="sm"
              type="button"
              class="w-full"
              (click)="confirmRemove(sel)"
              data-test="composition-remove-line"
            >
              Удалить строку
            </app-pi-button>
          }
        } @else {
          <p class="text-xs text-muted-foreground m-0">Выберите строку состава</p>
        }

        <app-pi-button
          variant="default"
          size="sm"
          type="button"
          class="w-full"
          [disabled]="!entityId() || !!pageError()"
          (click)="openPicker()"
          data-test="composition-add-line"
        >
          + Из каталога
        </app-pi-button>
      </aside>
    </section>
  `,
})
export class CompositionPanelComponent implements OnInit {
  readonly parentKind = input.required<CompositionParentKind>();
  readonly entityId = input.required<string>();
  /** API `isComplex` on product detail; tree-derived product child also shows badge. */
  readonly isComplex = input(false);

  private readonly composition = inject(PiCompositionService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  protected readonly kindShort = kindShort;
  protected readonly loading = signal(false);
  protected readonly pageError = signal<string | null>(null);
  protected readonly tree = signal<CompositionTreeNode | null>(null);
  protected readonly selected = signal<CompositionTreeSelectEvent | null>(null);
  protected readonly selectedId = signal<string | null>(null);
  private readonly rootLines = signal<CompositionLine[]>([]);
  private readonly parentLinesCache = signal<Map<string, CompositionLine[]>>(new Map());

  protected readonly showComplexBadge = computed(
    () => this.isComplex() || treeHasProductChild(this.tree()),
  );

  ngOnInit(): void {
    void this.reload();
  }

  protected async reload(): Promise<void> {
    const id = this.entityId();
    if (!id) return;
    this.loading.set(true);
    this.pageError.set(null);
    const [treeRes, linesRes] = await Promise.all([
      firstValueFrom(this.treeFor(this.parentKind(), id)),
      firstValueFrom(this.compositionFor(this.parentKind(), id)),
    ]);
    this.loading.set(false);
    if (!treeRes.ok) {
      this.pageError.set(extractErrorMessage(treeRes.error));
      this.tree.set(null);
      this.rootLines.set([]);
      return;
    }
    if (!linesRes.ok) {
      this.pageError.set(extractErrorMessage(linesRes.error));
      this.tree.set(null);
      this.rootLines.set([]);
      return;
    }
    this.tree.set(treeRes.data);
    this.rootLines.set(linesRes.data);
    this.parentLinesCache.set(new Map());
  }

  protected onSelect(event: CompositionTreeSelectEvent): void {
    this.selected.set(event);
    this.selectedId.set(event.node._id);
    if (event.node.kind === 'module') {
      void this.ensureParentLines(event.node._id);
    }
  }

  protected async onQtyChange(sel: CompositionTreeSelectEvent, event: Event): Promise<void> {
    const value = Number((event.target as HTMLInputElement).value);
    if (!Number.isFinite(value) || value <= 0) {
      this.toast.error('Количество должно быть положительным.');
      return;
    }
    await this.patchLine(sel, { quantity: value });
  }

  protected async onUnitChange(sel: CompositionTreeSelectEvent, event: Event): Promise<void> {
    const unit = (event.target as HTMLInputElement).value.trim();
    await this.patchLine(sel, { unit: unit || undefined });
  }

  protected confirmRemove(sel: CompositionTreeSelectEvent): void {
    const ref = this.dialog.open<boolean>(AlertDialogComponent, {
      data: {
        title: 'Удалить строку состава?',
        description: `«${sel.node.name}» будет удалена из состава.`,
        confirmLabel: 'Удалить',
        cancelLabel: 'Отмена',
        destructive: true,
      },
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (confirmed) => {
      if (confirmed) void this.removeLine(sel);
    });
  }

  protected openPicker(): void {
    const target = this.resolveAddTarget();
    if (!target) return;
    const captured = target;
    const ref = this.dialog.open<CompositionPickerResult | null>(CompositionPickerDialogComponent, {
      data: {
        parentKind: captured.parentKind,
        parentId: captured.parentId,
        onAdded: (result) => this.addLine(result, captured),
      } satisfies CompositionPickerDialogData,
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, () => void this.reload());
  }

  private resolveAddTarget(): CompositionAddTarget | null {
    const rootId = this.entityId();
    if (!rootId) return null;
    const rootKind = this.parentKind();
    const sel = this.selected();
    if (sel?.node && canAddIntoNode(rootKind, sel.node)) {
      return {
        parentKind: sel.node.kind === 'module' ? 'module' : 'product',
        parentId: sel.node._id,
      };
    }
    return { parentKind: rootKind, parentId: rootId };
  }

  private async addLine(result: CompositionPickerResult, target: CompositionAddTarget): Promise<void> {
    const dto: CompositionLineUpsertDto = {
      lineType: result.lineType,
      refId: result.refId,
      quantity: result.quantity,
      unit: result.unit,
    };
    const res = await firstValueFrom(this.addLineFor(target.parentKind, target.parentId, dto));
    if (!res.ok) {
      const message = extractErrorMessage(res.error);
      this.pageError.set(message);
      this.toast.error(message);
      throw new Error(message);
    }
    this.toast.success('Добавлено');
    await this.reload();
  }

  private async patchLine(
    sel: CompositionTreeSelectEvent,
    patch: { quantity?: number; unit?: string },
  ): Promise<void> {
    await this.withLine(sel, async (line, parent) => {
      const res = await firstValueFrom(this.updateLineFor(parent.kind, parent._id, line._id, patch));
      if (!res.ok) {
        const message = extractErrorMessage(res.error);
        this.pageError.set(message);
        this.toast.error(message);
        return;
      }
      await this.reload();
    });
  }

  private async removeLine(sel: CompositionTreeSelectEvent): Promise<void> {
    await this.withLine(sel, async (line, parent) => {
      const res = await firstValueFrom(this.removeLineFor(parent.kind, parent._id, line._id));
      if (!res.ok) {
        const message = extractErrorMessage(res.error);
        this.pageError.set(message);
        this.toast.error(message);
        return;
      }
      this.selected.set(null);
      this.selectedId.set(null);
      this.toast.success('Убрано из состава');
      await this.reload();
    });
  }

  private async withLine(
    sel: CompositionTreeSelectEvent,
    run: (line: CompositionLine, parent: CompositionTreeNode) => Promise<void>,
  ): Promise<void> {
    const parent = sel.parent;
    if (!parent || sel.depth === 0) return;

    const lines = await this.linesForParent(parent);
    if (!lines) return;

    const line = findCompositionLine(lines, sel.node);
    if (!line) {
      this.toast.error('Не найдена строка состава.');
      return;
    }
    await run(line, parent);
  }

  private async linesForParent(parent: CompositionTreeNode): Promise<CompositionLine[] | null> {
    const rootId = this.entityId();
    if (parent._id === rootId && parent.kind === this.parentKind()) {
      return this.rootLines();
    }

    const cached = this.parentLinesCache().get(parent._id);
    if (cached) return cached;

    const res = await firstValueFrom(this.compositionFor(parent.kind, parent._id));
    if (!res.ok) {
      const message = extractErrorMessage(res.error);
      this.pageError.set(message);
      this.toast.error(message);
      return null;
    }
    const next = new Map(this.parentLinesCache());
    next.set(parent._id, res.data);
    this.parentLinesCache.set(next);
    return res.data;
  }

  private async ensureParentLines(parentId: string): Promise<void> {
    if (this.parentLinesCache().has(parentId)) return;
    const res = await firstValueFrom(this.composition.getModuleComposition(parentId));
    if (!res.ok) return;
    const next = new Map(this.parentLinesCache());
    next.set(parentId, res.data);
    this.parentLinesCache.set(next);
  }

  private treeFor(kind: CompositionParentKind, id: string): Observable<SilentResult<CompositionTreeNode>> {
    if (kind === 'material') return this.composition.getMaterialTree(id);
    if (kind === 'module') return this.composition.getModuleTree(id);
    return this.composition.getProductTree(id);
  }

  private compositionFor(kind: CompositionParentKind, id: string): Observable<SilentResult<CompositionLine[]>> {
    if (kind === 'material') return this.composition.getMaterialComposition(id);
    if (kind === 'module') return this.composition.getModuleComposition(id);
    return this.composition.getProductComposition(id);
  }

  private addLineFor(
    kind: CompositionParentKind,
    id: string,
    dto: CompositionLineUpsertDto,
  ): Observable<SilentResult<CompositionLine[]>> {
    if (kind === 'material') return this.composition.addMaterialCompositionLine(id, dto);
    if (kind === 'module') return this.composition.addModuleCompositionLine(id, dto);
    return this.composition.addProductCompositionLine(id, dto);
  }

  private updateLineFor(
    kind: CompositionParentKind,
    id: string,
    lineId: string,
    dto: CompositionLineUpdateDto,
  ): Observable<SilentResult<CompositionLine[]>> {
    if (kind === 'material') return this.composition.updateMaterialCompositionLine(id, lineId, dto);
    if (kind === 'module') return this.composition.updateModuleCompositionLine(id, lineId, dto);
    return this.composition.updateProductCompositionLine(id, lineId, dto);
  }

  private removeLineFor(kind: CompositionParentKind, id: string, lineId: string): Observable<SilentResult<void>> {
    if (kind === 'material') return this.composition.removeMaterialCompositionLine(id, lineId);
    if (kind === 'module') return this.composition.removeModuleCompositionLine(id, lineId);
    return this.composition.removeProductCompositionLine(id, lineId);
  }
}
