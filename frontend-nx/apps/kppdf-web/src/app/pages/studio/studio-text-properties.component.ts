import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
  signal,
  viewChild,
  DestroyRef,
  Injector,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { PiRegistryDataSourcesService } from '@kppdf/data-access';
import {
  PiTextBlockCategoriesService,
  PiTextBlocksService,
  type StudioBlock,
  type StudioBlockStyle,
  type TextBlock,
  type StudioBlockAlign,
} from '@kppdf/data-access';
import { ButtonComponent } from '@kppdf/ui/button';
import { PiRichTextEditorComponent } from '@kppdf/ui/rich-text';
import { PiDialogService } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import { onDialogCloseOnce } from '../on-dialog-close-once';
import {
  StudioDataFieldPickerDialogComponent,
  type StudioDataFieldSelection,
} from './studio-data-field-picker-dialog.component';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  LucideAngularModule,
  Braces,
  Save,
} from 'lucide-angular';
import { extractErrorMessage } from '@kppdf/util-http';

const FONT_SIZE_OPTIONS = [6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32] as const;

const FONT_FAMILY_OPTIONS = ['Times New Roman', 'Arial', 'Calibri'] as const;

const FORMULA_OPTIONS = [
  { id: '', label: '— без формулы —', token: '' },
  { id: 'column-sum', label: 'Сумма столбца', token: '{{table.subtotal}}' },
  { id: 'vat', label: 'НДС', token: '{{table.vat}}' },
  { id: 'grand-with-vat', label: 'Итого с НДС', token: '{{table.grand}}' },
] as const;

const ALIGN_OPTIONS: readonly {
  value: StudioBlockAlign;
  label: string;
  icon: typeof AlignLeft;
}[] = [
  { value: 'left', label: 'Слева', icon: AlignLeft },
  { value: 'center', label: 'По центру', icon: AlignCenter },
  { value: 'right', label: 'Справа', icon: AlignRight },
  { value: 'justify', label: 'По ширине', icon: AlignJustify },
];

@Component({
  selector: 'pi-studio-text-properties',
  standalone: true,
  imports: [FormsModule, ButtonComponent, PiRichTextEditorComponent, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="text-props" data-test="studio-text-properties">
      <div class="text-props__library">
        <label class="text-props__field">
          <span class="text-props__label">Категория</span>
          <select
            class="text-props__select"
            [ngModel]="filterCategoryId()"
            (ngModelChange)="onCategoryFilterChange($event)"
            [disabled]="disabled"
            data-test="studio-text-category-filter"
          >
            <option value="">Все категории</option>
            @for (cat of categories(); track cat._id) {
              <option [value]="cat._id">{{ cat.name }}</option>
            }
          </select>
        </label>
        <label class="text-props__field">
          <span class="text-props__label">Из библиотеки</span>
          <select
            class="text-props__select"
            [ngModel]="pickedTextBlockId()"
            (ngModelChange)="onPickTextBlock($event)"
            [disabled]="disabled || loadingTexts()"
            data-test="studio-text-block-picker"
          >
            <option value="">— выберите сохранённый текст —</option>
            @for (tb of textBlocks(); track tb._id) {
              <option [value]="tb._id">{{ tb.name }}</option>
            }
          </select>
        </label>
        @if (libraryHint()) {
          <p class="text-props__hint">{{ libraryHint() }}</p>
        }
      </div>

      <label class="text-props__field">
        <span class="text-props__label">Текст на листе</span>
        <app-pi-rich-text
          [value]="content()"
          (valueChange)="onContentChange($event)"
          [compact]="true"
          [editable]="!disabled"
          placeholder="Напишите текст…"
          data-test="studio-block-content"
        />
      </label>

      <div class="text-props__typo text-props__typo--floating" data-test="studio-typography-controls">
        <div class="text-props__row-2">
          <label class="text-props__field text-props__field--compact">
            <span class="text-props__label">Шрифт</span>
            <select
              class="text-props__select"
              [ngModel]="fontFamily()"
              (ngModelChange)="patchStyle({ fontFamily: $event })"
              [disabled]="disabled"
              data-test="studio-font-family"
            >
              @for (font of fontFamilyOptions; track font) {
                <option [ngValue]="font">{{ font }}</option>
              }
            </select>
          </label>
          <label class="text-props__field text-props__field--compact">
            <span class="text-props__label">Межстр., ×</span>
            <input
              class="text-props__select"
              type="number"
              min="0.8"
              max="3"
              step="0.1"
              [ngModel]="lineHeightInput()"
              (ngModelChange)="onLineHeightChange($event)"
              [disabled]="disabled"
              placeholder="—"
              data-test="studio-line-height"
            />
          </label>
        </div>
        <app-pi-button
          variant="secondary"
          size="sm"
          class="w-full"
          data-test="studio-insert-data-field"
          [disabled]="disabled"
          (click)="openDataFieldPicker()"
        >
          <lucide-angular [img]="bracesIcon" [size]="14" aria-hidden="true" />
          Поле ERP
        </app-pi-button>
        <label class="text-props__field text-props__field--compact">
          <span class="text-props__label">Формула</span>
          <select
            class="text-props__select"
            [ngModel]="selectedFormulaId()"
            (ngModelChange)="onFormulaPick($event)"
            [disabled]="disabled"
            data-test="studio-text-formula-select"
          >
            @for (opt of formulaOptions; track opt.id) {
              <option [value]="opt.id">{{ opt.label }}</option>
            }
          </select>
        </label>
        <label class="text-props__field text-props__field--compact">
          <span class="text-props__label">Формула</span>
          <select
            class="text-props__select"
            [ngModel]="formulaPick()"
            (ngModelChange)="insertFormulaToken($event)"
            [disabled]="disabled"
            data-test="studio-text-formula-select"
          >
            <option value="">— из реестра —</option>
            <option [value]="formulaTokens.subtotal">Сумма столбца</option>
            <option [value]="formulaTokens.vat">НДС</option>
            <option [value]="formulaTokens.grand">Итого с НДС</option>
          </select>
        </label>
        <div class="text-props__row-2">
          <label class="text-props__field text-props__field--compact">
            <span class="text-props__label">Размер, pt</span>
            <select
              class="text-props__select"
              [ngModel]="fontSizePt()"
              (ngModelChange)="patchStyle({ fontSizePt: toFontSize($event) })"
              [disabled]="disabled"
              data-test="studio-font-size"
            >
              @for (size of fontSizeOptions; track size) {
                <option [ngValue]="size">{{ size }}</option>
              }
            </select>
          </label>
          <label class="text-props__field text-props__field--compact">
            <span class="text-props__label">Цвет</span>
            <input
              class="text-props__color"
              type="color"
              [ngModel]="color()"
              (ngModelChange)="patchStyle({ color: $event })"
              [disabled]="disabled"
              data-test="studio-font-color"
            />
          </label>
        </div>
        <div class="text-props__align" role="group" aria-label="Выравнивание блока на листе">
          @for (opt of alignOptions; track opt.value) {
            <button
              type="button"
              class="text-props__align-btn pi-focus-ring"
              [class.text-props__align-btn--active]="align() === opt.value"
              [attr.aria-label]="opt.label"
              [attr.aria-pressed]="align() === opt.value"
              [disabled]="disabled"
              [attr.data-test]="'studio-align-' + opt.value"
              (click)="patchStyle({ align: opt.value })"
            >
              <lucide-angular [img]="opt.icon" [size]="15" aria-hidden="true" />
            </button>
          }
        </div>
      </div>

      <app-pi-button
        variant="secondary"
        size="sm"
        class="w-full"
        data-test="studio-save-text-block"
        [disabled]="disabled"
        (click)="saveToLibrary.emit()"
      >
        <lucide-angular [img]="saveIcon" [size]="14" aria-hidden="true" />
        Сохранить в библиотеку текстов
      </app-pi-button>
    </div>
  `,
  styles: [`
    .text-props { display: flex; flex-direction: column; gap: 10px; }
    .text-props__library {
      display: flex; flex-direction: column; gap: 8px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--color-rule);
    }
    .text-props__field { display: flex; flex-direction: column; gap: 4px; margin: 0; }
    .text-props__field--compact { flex: 1; min-width: 0; }
    .text-props__label {
      font-size: 11px; font-weight: 600;
      color: var(--color-muted-foreground);
    }
    .text-props__select, .text-props__color {
      width: 100%; box-sizing: border-box;
      border: 1px solid var(--color-rule-strong);
      border-radius: var(--radius-sm);
      background: var(--color-paper-2);
      color: var(--color-ink);
      font-size: 13px;
    }
    .text-props__select { padding: 7px 9px; }
    .text-props__color { height: 34px; padding: 2px; cursor: pointer; }
    .text-props__select:disabled, .text-props__color:disabled { opacity: 0.55; }
    .text-props__hint {
      margin: 0; font-size: 11px; line-height: 1.4;
      color: var(--color-muted-foreground);
    }
    .text-props__typo { display: flex; flex-direction: column; gap: 8px; }
    .text-props__typo--floating { padding: 8px; border: 1px solid var(--color-rule-strong); border-radius: var(--radius-sm); background: var(--color-paper-raised); position: relative; }
    .text-props__row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .text-props__align { display: flex; gap: 4px; }
    .text-props__align-btn {
      flex: 1; display: inline-flex; align-items: center; justify-content: center;
      min-height: 32px; padding: 0;
      border: 1px solid var(--color-rule-strong);
      border-radius: var(--radius-sm);
      background: var(--color-paper-2);
      color: var(--color-ink);
      cursor: pointer;
    }
    .text-props__align-btn:hover:not(:disabled) {
      background: var(--color-paper-3);
    }
    .text-props__align-btn--active {
      background: var(--color-gold);
      border-color: var(--color-gold-deep);
      color: var(--color-ink);
    }
    .text-props__align-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  `],
})
export class StudioTextPropertiesComponent implements OnChanges {
  private readonly textBlocksService = inject(PiTextBlocksService);
  private readonly categoriesService = inject(PiTextBlockCategoriesService);
  private readonly registrySources = inject(PiRegistryDataSourcesService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly richText = viewChild(PiRichTextEditorComponent);

  @Input({ required: true }) block!: StudioBlock;
  @Input() disabled = false;
  @Output() readonly contentChange = new EventEmitter<string>();
  @Output() readonly styleChange = new EventEmitter<Partial<StudioBlockStyle>>();
  @Output() readonly applyLibraryText = new EventEmitter<TextBlock>();
  @Output() readonly saveToLibrary = new EventEmitter<void>();

  protected readonly fontSizeOptions = FONT_SIZE_OPTIONS;
  protected readonly fontFamilyOptions = FONT_FAMILY_OPTIONS;
  protected readonly bracesIcon = Braces;
  protected readonly alignOptions = ALIGN_OPTIONS;
  protected readonly saveIcon = Save;
  protected readonly formulaOptions = FORMULA_OPTIONS;

  protected readonly selectedFormulaId = signal('');

  protected readonly content = signal('');
  protected readonly filterCategoryId = signal('');
  protected readonly pickedTextBlockId = signal('');
  protected readonly categories = signal<readonly { _id: string; name: string }[]>([]);
  protected readonly textBlocks = signal<readonly TextBlock[]>([]);
  protected readonly loadingTexts = signal(false);
  protected readonly libraryHint = signal<string | null>(null);
  protected readonly formulaPick = signal('');
  protected readonly formulaTokens = {
    subtotal: '{{table.subtotal}}',
    vat: '{{table.vat}}',
    grand: '{{table.grand}}',
  } as const;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['block']) {
      this.content.set(this.block.content ?? '');
      this.pickedTextBlockId.set('');
    }
  }

  constructor() {
    void this.loadCategories();
    void this.loadTextBlocks();
  }

  protected fontSizePt(): number {
    return this.block.style?.fontSizePt ?? 14;
  }

  protected color(): string {
    return this.block.style?.color ?? '#000000';
  }

  protected align(): StudioBlockAlign {
    return this.block.style?.align ?? 'left';
  }

  protected onContentChange(value: string): void {
    this.content.set(value);
    this.contentChange.emit(value);
  }


  protected fontFamily(): string {
    return this.block.style?.fontFamily ?? FONT_FAMILY_OPTIONS[0];
  }

  protected lineHeightInput(): string {
    const lh = this.block.style?.lineHeight;
    return lh == null ? '' : String(lh);
  }

  protected onLineHeightChange(raw: string | number): void {
    const t = String(raw ?? '').trim();
    if (!t) {
      this.patchStyle({ lineHeight: undefined });
      return;
    }
    const n = Number(t);
    if (!Number.isFinite(n)) return;
    const clamped = Math.min(3, Math.max(0.8, Math.round(n * 10) / 10));
    this.patchStyle({ lineHeight: clamped });
  }

  protected onFormulaPick(id: string): void {
    this.selectedFormulaId.set(id);
    const opt = FORMULA_OPTIONS.find((item) => item.id === id);
    if (!opt?.token) return;
    this.richText()?.saveSelection();
    requestAnimationFrame(() => {
      this.richText()?.insertContent(opt.token);
      this.toast.success(`Вставлено ${opt.token}`);
    });
  }

  protected openDataFieldPicker(): void {
    this.richText()?.saveSelection();
    void firstValueFrom(this.registrySources.list()).then((result) => {
      if (!result.ok) {
        this.toast.error(extractErrorMessage(result.error));
        return;
      }
      const sources = result.data.filter((s) => (s.fields?.length ?? 0) > 0);
      if (sources.length === 0) {
        this.toast.error('Список полей ERP пуст');
        return;
      }
      const ref = this.dialog.open<StudioDataFieldSelection | null>(StudioDataFieldPickerDialogComponent, {
        data: { sources, columnIndex: 0 },
        width: '896px',
        parentDestroyRef: this.destroyRef,
      });
      onDialogCloseOnce(ref, this.injector, (sel) => {
        if (!sel) return;
        const token = `{{${sel.source}.${sel.field.key}}}`;
        requestAnimationFrame(() => {
          this.richText()?.insertContent(token);
          this.toast.success(`Вставлено ${token}`);
        });
      });
    });
  }

  protected insertFormulaToken(token: string): void {
    this.formulaPick.set('');
    if (!token) return;
    requestAnimationFrame(() => {
      this.richText()?.insertContent(token);
      this.toast.success(`Вставлено ${token}`);
    });
  }

  protected patchStyle(patch: Partial<StudioBlockStyle>): void {
    this.styleChange.emit(patch);
  }

  protected toFontSize(value: number | string): number {
    const n = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(n)) return 14;
    return Math.min(96, Math.max(6, Math.round(n)));
  }

  protected onCategoryFilterChange(categoryId: string): void {
    this.filterCategoryId.set(categoryId);
    this.pickedTextBlockId.set('');
    void this.loadTextBlocks();
  }

  protected onPickTextBlock(id: string): void {
    this.pickedTextBlockId.set(id);
    if (!id) return;
    const picked = this.textBlocks().find((tb) => tb._id === id);
    if (picked) this.applyLibraryText.emit(picked);
  }

  private async loadCategories(): Promise<void> {
    const result = await firstValueFrom(this.categoriesService.list());
    if (result.ok) {
      this.categories.set(result.data);
      if (result.data.length === 0) {
        this.libraryHint.set('Категории создаются в реестре «Тексты» → справочник категорий.');
      }
    }
  }

  private async loadTextBlocks(): Promise<void> {
    this.loadingTexts.set(true);
    const categoryId = this.filterCategoryId().trim();
    const result = await firstValueFrom(
      this.textBlocksService.list({
        isActive: true,
        ...(categoryId ? { categoryId } : {}),
      }),
    );
    this.loadingTexts.set(false);
    if (!result.ok) {
      this.libraryHint.set(extractErrorMessage(result.error));
      this.textBlocks.set([]);
      return;
    }
    const sorted = [...result.data].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name, 'ru'),
    );
    this.textBlocks.set(sorted);
    if (sorted.length === 0 && !this.libraryHint()) {
      this.libraryHint.set('Сохранённых текстов пока нет — создайте через кнопку ниже или в реестре «Тексты».');
    }
  }
}
