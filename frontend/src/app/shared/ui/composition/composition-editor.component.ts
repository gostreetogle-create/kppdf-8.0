import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  CompositionTreeNode,
  CompositionLine,
  CompositionLineUpsertDto,
  ProductModulesService,
} from '../../services/pi-product-modules.service';
import { Material, MaterialsService } from '../../services/materials.service';
import { extractErrorMessage } from '../../../core/silent-http';
import { PiToastService } from '../toast';
import { ButtonComponent } from '../button/button.component';
import { CompositionTreeComponent } from './composition-tree.component';

export type CompositionEditorParent = 'product' | 'module';

@Component({
  selector: 'app-composition-editor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, CompositionTreeComponent],
  template: `
    <section class="space-y-3" data-test="composition-editor">
      @if (isComplex()) {
        <span
          class="inline-flex items-center px-2 py-1 text-xs hairline rounded-sm bg-sunrise-warm/10 text-sunrise-warm"
          data-test="composition-complex-badge"
          >Комплекс</span
        >
      }
      @if (warning()) {
        <p
          class="px-3 py-2 text-xs text-sunrise-warm hairline rounded-sm"
          role="status"
          data-test="composition-depth-warning"
        >
          {{ warning() }}
        </p>
      }
      @if (error()) {
        <p
          class="px-3 py-2 text-sm text-destructive hairline rounded-sm"
          role="alert"
          data-test="composition-error"
        >
          {{ error() }}
        </p>
      }
      @if (loading()) {
        <p class="py-2 text-center text-xs text-muted-foreground" role="status">
          Обновление состава…
        </p>
      }
      <app-composition-tree [root]="treeWithKinds()" (expandedChange)="onExpand($event)" />
      @if (lines().length > 0) {
        <div class="space-y-2" data-test="composition-editor-lines">
          <p class="eyebrow">Быстрое редактирование</p>
          @for (line of lines(); track line._id) {
            <div class="flex flex-wrap items-center gap-2 hairline rounded-sm px-3 py-2">
              <span class="min-w-32 flex-1 text-sm">{{ lineLabel(line) }}</span>
              <input
                class="pi-input w-24"
                type="number"
                min="0.0001"
                [value]="line.quantity"
                [attr.aria-label]="'Количество ' + lineLabel(line)"
                (change)="updateQuantity(line, $event)"
                data-test="composition-quantity"
              />
              <app-pi-button
                variant="destructive"
                size="sm"
                type="button"
                (click)="removeLine(line)"
                data-test="composition-remove"
                >Удалить</app-pi-button
              >
            </div>
          }
        </div>
      }
      <div class="hairline rounded-sm p-3 space-y-2" data-test="composition-editor-add">
        <p class="eyebrow">Добавить строку</p>
        <div class="grid grid-cols-1 sm:grid-cols-[8rem_1fr_7rem_auto] gap-2 items-end">
          <label class="block">
            <span class="eyebrow block mb-1">Тип</span>
            <select
              class="pi-input w-full"
              [value]="draftType()"
              (change)="onTypeChange($event)"
              data-test="composition-line-type"
            >
              @for (type of allowedLineTypes(); track type) {
                <option [value]="type">{{ lineTypeLabel(type) }}</option>
              }
            </select>
          </label>
          <label class="block">
            <span class="eyebrow block mb-1">ID элемента</span>
            <input
              class="pi-input w-full"
              [value]="draftRefId()"
              (input)="onRefIdChange($event)"
              placeholder="ObjectId"
              data-test="composition-ref-id"
            />
          </label>
          <label class="block">
            <span class="eyebrow block mb-1">Кол-во</span>
            <input
              class="pi-input w-full"
              type="number"
              min="0.0001"
              [value]="draftQuantity()"
              (input)="onQuantityChange($event)"
              data-test="composition-draft-quantity"
            />
          </label>
          <app-pi-button
            variant="default"
            size="sm"
            type="button"
            (click)="addDraftLine()"
            data-test="composition-add"
          >
            Добавить
          </app-pi-button>
        </div>
        <p class="text-xs text-muted-foreground">
          Для материала укажите ID каталога; сырьё в состав изделия не добавляется.
        </p>
      </div>
      <div class="flex justify-end">
        <app-pi-button
          variant="outline"
          size="sm"
          type="button"
          (click)="reload()"
          data-test="composition-reload"
        >
          Обновить состав
        </app-pi-button>
      </div>
    </section>
  `,
})
export class CompositionEditorComponent {
  readonly parentId = input.required<string>();
  readonly parentKind = input.required<CompositionEditorParent>();

  protected readonly tree = signal<CompositionTreeNode | null>(null);
  protected readonly treeWithKinds = computed(() => this.enrichMaterialKinds(this.tree()));
  protected readonly lines = signal<CompositionLine[]>([]);
  protected readonly loading = signal(false);
  protected readonly warning = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly isComplex = computed(
    () =>
      this.parentKind() === 'product' &&
      (this.tree()?.children ?? []).some((child) => child.kind === 'product'),
  );
  private readonly requestedDepth = signal(1);
  protected readonly draftType = signal<CompositionLineUpsertDto['lineType']>('module');
  protected readonly draftRefId = signal('');
  protected readonly draftQuantity = signal('1');
  private readonly materials = signal<Material[]>([]);

  private readonly service = inject(ProductModulesService);
  private readonly materialsService = inject(MaterialsService);
  private readonly toast = inject(PiToastService);

  constructor() {
    this.materialsService.list({ limit: 200 }).subscribe((response) => {
      if (response.ok) this.materials.set(response.data.items);
    });
    effect(() => {
      const id = this.parentId();
      if (id) this.load();
    });
  }

  protected reload(): void {
    this.load();
  }

  protected allowedLineTypes(): CompositionLineUpsertDto['lineType'][] {
    return this.parentKind() === 'product'
      ? ['module', 'material', 'product']
      : ['module', 'material'];
  }

  protected lineTypeLabel(type: CompositionLineUpsertDto['lineType']): string {
    return type === 'product' ? 'Изделие' : type === 'module' ? 'Модуль' : 'Материал';
  }

  protected lineLabel(line: CompositionLine): string {
    const type = this.lineTypeLabel(line.lineType);
    if (line.lineType !== 'material') return `${type} · ${line.refId}`;
    const material = this.materials().find((item) => item._id === line.refId);
    return material
      ? `${type} · ${material.name} · ${material.materialKind ?? 'тип не указан'}`
      : `${type} · ${line.refId}`;
  }

  protected onTypeChange(event: Event): void {
    this.draftType.set(
      (event.target as HTMLSelectElement).value as CompositionLineUpsertDto['lineType'],
    );
  }

  protected onRefIdChange(event: Event): void {
    this.draftRefId.set((event.target as HTMLInputElement).value);
  }

  protected onQuantityChange(event: Event): void {
    this.draftQuantity.set((event.target as HTMLInputElement).value);
  }

  protected addDraftLine(): void {
    const refId = this.draftRefId().trim();
    const quantity = Number(this.draftQuantity());
    const lineType = this.draftType();
    if (!refId || !Number.isFinite(quantity) || quantity <= 0) {
      this.showMessage('Укажите ID элемента и положительное количество.');
      return;
    }
    if (lineType === 'product' && this.parentKind() === 'module') {
      this.showMessage('Изделие нельзя добавить в состав модуля.');
      return;
    }
    if ((lineType === 'module' || lineType === 'product') && refId === this.parentId()) {
      this.showMessage('Нельзя добавить элемент в состав самого себя.');
      return;
    }
    if (lineType === 'material') {
      const material = this.materials().find((item) => item._id === refId);
      if (this.parentKind() === 'product' && material?.materialKind === 'raw') {
        this.showMessage('Сырьё нельзя добавить непосредственно в состав изделия.');
        return;
      }
    }
    const dto: CompositionLineUpsertDto = { lineType, refId, quantity };
    const request =
      this.parentKind() === 'product'
        ? this.service.addProductCompositionLine(this.parentId(), dto)
        : this.service.addModuleCompositionLine(this.parentId(), dto);
    request.subscribe((response) => {
      if (response.ok) {
        this.draftRefId.set('');
        this.draftQuantity.set('1');
        this.load();
      } else {
        this.showMessage(extractErrorMessage(response.error));
      }
    });
  }

  protected updateQuantity(line: CompositionLine, event: Event): void {
    const quantity = Number((event.target as HTMLInputElement).value);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      this.showMessage('Количество должно быть положительным.');
      return;
    }
    const request =
      this.parentKind() === 'product'
        ? this.service.updateProductCompositionLine(this.parentId(), line._id, { quantity })
        : this.service.updateModuleCompositionLine(this.parentId(), line._id, { quantity });
    request.subscribe((response) =>
      response.ok ? this.load() : this.showMessage(extractErrorMessage(response.error)),
    );
  }

  protected removeLine(line: CompositionLine): void {
    const request =
      this.parentKind() === 'product'
        ? this.service.removeProductCompositionLine(this.parentId(), line._id)
        : this.service.removeModuleCompositionLine(this.parentId(), line._id);
    request.subscribe((response) =>
      response.ok ? this.load() : this.showMessage(extractErrorMessage(response.error)),
    );
  }

  protected onExpand(event: { node: CompositionTreeNode; expanded: boolean }): void {
    if (!event.expanded) return;
    const depth = this.depthOf(event.node);
    if (depth > 5) {
      this.warning.set(
        'Глубина состава больше 5 уровней. Проверьте структуру перед дальнейшим расширением.',
      );
    }
    const nextDepth = Math.min(8, Math.max(1, depth + 2));
    if (nextDepth > this.requestedDepth()) {
      this.requestedDepth.set(nextDepth);
      this.load();
    }
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    const treeRequest =
      this.parentKind() === 'product'
        ? this.service.getProductTree(this.parentId(), this.requestedDepth())
        : this.service.getModuleTree(this.parentId(), this.requestedDepth());
    const lineRequest =
      this.parentKind() === 'product'
        ? this.service.getProductComposition(this.parentId())
        : this.service.getModuleComposition(this.parentId());
    let treeDone = false;
    let lineDone = false;
    const finish = (): void => {
      if (treeDone && lineDone) this.loading.set(false);
    };
    treeRequest.subscribe((response) => {
      treeDone = true;
      if (response.ok) {
        this.tree.set(response.data);
        if (this.hasDepthWarning(response.data))
          this.warning.set('Глубина состава больше 5 уровней. Проверьте структуру.');
      } else this.showMessage(extractErrorMessage(response.error));
      finish();
    });
    lineRequest.subscribe((response) => {
      lineDone = true;
      if (response.ok) this.lines.set(response.data);
      else this.showMessage(extractErrorMessage(response.error));
      finish();
    });
  }

  private showMessage(message: string): void {
    this.error.set(message);
    this.toast.error(message);
  }

  private enrichMaterialKinds(node: CompositionTreeNode | null): CompositionTreeNode | null {
    if (!node) return null;
    return {
      ...node,
      materialKind:
        node.kind === 'material'
          ? this.materials().find((material) => material._id === node._id)?.materialKind
          : undefined,
      children: node.children.map((child) => this.enrichMaterialKinds(child)!),
    };
  }

  private hasDepthWarning(node: CompositionTreeNode, depth = 0): boolean {
    return depth > 5 || node.children.some((child) => this.hasDepthWarning(child, depth + 1));
  }

  private depthOf(target: CompositionTreeNode, node = this.tree(), depth = 0): number {
    if (!node) return -1;
    if (node._id === target._id) return depth;
    for (const child of node.children) {
      const result = this.depthOf(target, child, depth + 1);
      if (result !== -1) return result;
    }
    return -1;
  }
}
