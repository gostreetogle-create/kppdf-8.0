import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  QueryList,
  ViewChildren,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import {
  TextBlockCategory,
  TextBlockCategoriesService,
} from '../../../shared/services/pi-text-block-categories.service';
import { TextBlock, TextBlocksService } from '../../../shared/services/pi-text-blocks.service';

export interface ProposalTerm {
  text: string;
  sortOrder: number;
}

const TERM_VARIABLES = [
  { token: '{{client_name}}', label: 'Клиент' },
  { token: '{{kp_number}}', label: 'Номер КП' },
  { token: '{{total_price}}', label: 'Итого' },
  { token: '{{date}}', label: 'Дата' },
  { token: '{{valid_until}}', label: 'Действует до' },
  { token: '{{prepayment_percent}}', label: 'Предоплата' },
  { token: '{{production_days}}', label: 'Изготовление' },
  { token: '{{delivery_days}}', label: 'Поставка' },
] as const;

@Component({
  selector: 'app-proposal-create-terms',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ButtonComponent],
  template: `
    <div class="terms" data-test="kp-terms-panel">
      <div class="terms__heading">
        <div>
          <h3>Условия</h3>
          <p class="text-xs text-muted-foreground m-0" data-test="kp-hint-terms">
            Тексты условий — в это КП. «Библиотека» — общие блоки на будущее.
          </p>
        </div>
        <app-pi-button
          type="button"
          variant="ghost"
          size="sm"
          [disabled]="readOnly()"
          (click)="toggleLibrary()"
        >
          Взять из библиотеки
        </app-pi-button>
      </div>

      @if (libraryOpen()) {
        <section class="terms__library" data-test="kp-terms-library">
          <strong>Текстовые блоки</strong>
          <select
            class="pi-input terms__category"
            [ngModel]="selectedCategoryId()"
            (ngModelChange)="selectCategory($event)"
            [disabled]="readOnly()"
            aria-label="Категория текстов"
            data-test="kp-terms-category"
          >
            <option value="">Все категории</option>
            @for (category of categories(); track category._id) {
              <option [value]="category._id">{{ category.name }}</option>
            }
          </select>
          @if (blocks().length === 0) {
            <span>Активных заготовок пока нет.</span>
          }
          @for (block of blocks(); track block._id) {
            <div class="terms__library-row">
              <span>{{ block.name }}</span>
              <app-pi-button
                type="button"
                variant="outline"
                size="sm"
                [disabled]="readOnly()"
                (click)="addFromLibrary(block)"
                >Добавить</app-pi-button
              >
            </div>
          }
        </section>
      }

      @for (term of terms(); track $index; let index = $index) {
        <article class="terms__row" [attr.data-test]="'kp-term-' + index">
          <div class="terms__row-head">
            <span>Условие {{ index + 1 }}</span>
            <span class="terms__row-actions">
              <app-pi-button
                type="button"
                variant="ghost"
                size="icon"
                [disabled]="readOnly() || index === 0"
                ariaLabel="Выше"
                (click)="move(index, -1)"
                >↑</app-pi-button
              >
              <app-pi-button
                type="button"
                variant="ghost"
                size="icon"
                [disabled]="readOnly() || index === terms().length - 1"
                ariaLabel="Ниже"
                (click)="move(index, 1)"
                >↓</app-pi-button
              >
              <app-pi-button
                type="button"
                variant="ghost"
                size="icon"
                [disabled]="readOnly()"
                ariaLabel="Удалить условие"
                (click)="remove(index)"
                >×</app-pi-button
              >
            </span>
          </div>
          <textarea
            #termEditor
            class="pi-input terms__textarea"
            rows="2"
            [ngModel]="term.text"
            (ngModelChange)="changeText(index, $event)"
            (select)="rememberCursor(index, $event)"
            (blur)="rememberCursor(index, $event)"
            [disabled]="readOnly()"
            [attr.data-test]="'kp-term-editor-' + index"
          ></textarea>
          <div class="terms__variables">
            <span>Вставить:</span>
            @for (variable of variables; track variable.token) {
              <button
                type="button"
                class="terms__variable"
                [disabled]="readOnly()"
                (click)="insertVariable(index, variable.token)"
              >
                {{ variable.label }}
              </button>
            }
          </div>
        </article>
      }

      @if (terms().length === 0) {
        <p class="terms__empty" data-test="kp-terms-empty">Добавьте первое условие.</p>
      }
      <app-pi-button
        type="button"
        variant="outline"
        size="sm"
        [disabled]="readOnly()"
        data-test="kp-terms-add"
        ariaLabel="Добавить условие"
        (click)="add()"
        >Добавить условие…</app-pi-button
      >
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-height: 0;
    }
    .terms {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      height: 100%;
      overflow: auto;
    }
    .terms__heading,
    .terms__row-head,
    .terms__library-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }
    h3,
    p {
      margin: 0;
    }
    h3 {
      font-size: 0.9rem;
    }
    .terms__heading p,
    .terms__library,
    .terms__empty,
    .terms__variables {
      color: var(--color-muted-foreground, #6b7280);
      font-size: 0.7rem;
    }
    .terms__row,
    .terms__library {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
      padding: 0.65rem;
      border: 1px solid var(--color-rule);
      background: color-mix(in oklch, var(--color-paper, #fff) 90%, transparent);
    }
    .terms__row-head {
      font-size: 0.72rem;
      color: var(--color-muted-foreground, #6b7280);
    }
    .terms__row-actions {
      display: inline-flex;
      gap: 0.15rem;
    }
    .terms__textarea {
      min-height: 3.2rem;
      resize: vertical;
      line-height: 1.35;
    }
    .terms__variables {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.25rem;
    }
    .terms__variable {
      padding: 0.1rem 0.3rem;
      border: 1px solid var(--color-rule);
      background: transparent;
      color: var(--color-ink);
      cursor: pointer;
      font-size: 0.68rem;
    }
    .terms__variable:hover {
      border-color: var(--color-gold-deep);
      background: var(--color-gold-soft, #f7edc8);
    }
    .terms__library {
      gap: 0.45rem;
    }
    .terms__category {
      width: 100%;
      min-height: 2rem;
      font-size: 0.72rem;
    }
  `,
})
export class ProposalCreateTermsComponent {
  readonly terms = input<ProposalTerm[]>([]);
  readonly readOnly = input(false);
  /** TZ-KP-WS-405 — bump to reload the text-block library after an inline create/edit. */
  readonly libraryRefresh = input(0);
  readonly termsChange = output<ProposalTerm[]>();

  protected readonly libraryOpen = signal(false);
  protected readonly blocks = signal<TextBlock[]>([]);
  protected readonly categories = signal<TextBlockCategory[]>([]);
  protected readonly selectedCategoryId = signal('');
  protected readonly variables = TERM_VARIABLES;
  private readonly textBlocks = inject(TextBlocksService);
  private readonly textCategories = inject(TextBlockCategoriesService);
  private readonly cursorPositions = new Map<number, number>();

  @ViewChildren('termEditor') private editors!: QueryList<ElementRef<HTMLTextAreaElement>>;

  constructor() {
    this.textCategories.list({ activeOnly: true }).subscribe((res) => {
      if (res.ok) this.categories.set(res.data ?? []);
    });
    effect(() => {
      void this.libraryRefresh();
      this.loadBlocks();
    });
  }

  protected selectCategory(categoryId: string): void {
    this.selectedCategoryId.set(categoryId);
    this.loadBlocks();
  }

  private loadBlocks(): void {
    const categoryId = this.selectedCategoryId();
    this.textBlocks
      .list({ activeOnly: true, ...(categoryId ? { categoryId } : {}) })
      .subscribe((res) => {
        if (res.ok) this.blocks.set(res.data.items ?? []);
      });
  }

  protected toggleLibrary(): void {
    if (!this.readOnly()) this.libraryOpen.update((value) => !value);
  }

  protected add(text = ''): void {
    if (this.readOnly()) return;
    this.emit([...this.terms(), { text, sortOrder: this.terms().length }]);
  }

  protected addFromLibrary(block: TextBlock): void {
    const text = block.content ?? block.columns?.map((column) => column.content).join('\n') ?? '';
    this.add(text.replace(/<[^>]+>/g, ''));
    this.libraryOpen.set(true);
  }

  protected changeText(index: number, text: string): void {
    if (this.readOnly()) return;
    this.emit(
      this.terms().map((term, termIndex) => (termIndex === index ? { ...term, text } : term)),
    );
  }

  protected move(index: number, direction: -1 | 1): void {
    if (this.readOnly()) return;
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= this.terms().length) return;
    const next = [...this.terms()];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    this.emit(next.map((term, sortOrder) => ({ ...term, sortOrder })));
  }

  protected remove(index: number): void {
    if (this.readOnly()) return;
    this.emit(
      this.terms()
        .filter((_, termIndex) => termIndex !== index)
        .map((term, sortOrder) => ({ ...term, sortOrder })),
    );
  }

  protected rememberCursor(index: number, event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.cursorPositions.set(index, target.selectionStart ?? target.value.length);
  }

  protected insertVariable(index: number, token: string): void {
    if (this.readOnly()) return;
    const term = this.terms()[index];
    if (!term) return;
    const position = this.cursorPositions.get(index) ?? term.text.length;
    const text = `${term.text.slice(0, position)}${token}${term.text.slice(position)}`;
    this.cursorPositions.set(index, position + token.length);
    this.changeText(index, text);
    queueMicrotask(() => {
      const editor = this.editors?.get(index)?.nativeElement;
      if (!editor) return;
      editor.focus();
      editor.setSelectionRange(position + token.length, position + token.length);
    });
  }

  private emit(terms: ProposalTerm[]): void {
    this.termsChange.emit(terms.map((term, sortOrder) => ({ text: term.text, sortOrder })));
  }
}
