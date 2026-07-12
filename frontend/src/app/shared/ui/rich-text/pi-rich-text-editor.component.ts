/**
 * TZ-104.6 — `PiRichTextEditorComponent`.
 *
 * Wraps TipTap (ProseMirror-based) as an Angular signal-based component.
 * Each instance manages its own Editor + toolbar. Supports two-way binding
 * of HTML content via `value` model().
 *
 * Extensions:
 *   - StarterKit (bold, italic, heading, bulletList, orderedList, code)
 *   - Underline
 *   - TextAlign (paragraph + heading)
 *   - Color
 *   - FontFamily
 *   - Highlight (background color)
 *
 * Toolbar toggles button active state by subscribing to Editor `onSelectionUpdate`.
 */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Highlight from '@tiptap/extension-highlight';
import { LucideAngularModule } from 'lucide-angular';

export const DEFAULT_EXTENSIONS = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
    // Underline is added explicitly below — disable from StarterKit to avoid
    // TipTap's "Duplicate extension names" warning.
    underline: false,
  }),
  Underline,
  TextStyle,
  Color,
  FontFamily,
  Highlight.configure({ multicolor: true }),
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
];

export const FONT_FAMILIES = [
  { label: 'Основной', value: 'Inter, sans-serif' },
  { label: 'Моноширинный', value: '"JetBrains Mono", monospace' },
  { label: 'Serif', value: 'Georgia, serif' },
] as const;

@Component({
  selector: 'app-pi-rich-text',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  template: `
    <div class="pi-rte" [class.pi-rte--focused]="focused()" [class.pi-rte--borderless]="!showToolbar()">
      @if (showToolbar()) {
        <div class="pi-rte-toolbar" role="toolbar" aria-label="Форматирование текста">
          <!-- Block type -->
          <div class="pi-rte-group">
            <button
              type="button"
              class="pi-rte-btn"
              [class.is-active]="activeStates().heading1"
              (click)="toggleHeading(1)"
              title="Заголовок 1"
              aria-label="Заголовок 1"
            >H1</button>
            <button
              type="button"
              class="pi-rte-btn"
              [class.is-active]="activeStates().heading2"
              (click)="toggleHeading(2)"
              title="Заголовок 2"
              aria-label="Заголовок 2"
            >H2</button>
            <button
              type="button"
              class="pi-rte-btn"
              [class.is-active]="activeStates().heading3"
              (click)="toggleHeading(3)"
              title="Заголовок 3"
              aria-label="Заголовок 3"
            >H3</button>
          </div>

          <div class="pi-rte-sep"></div>

          <!-- Inline formatting -->
          <div class="pi-rte-group">
            <button
              type="button"
              class="pi-rte-btn pi-rte-btn--icon"
              [class.is-active]="activeStates().bold"
              (click)="toggleBold()"
              title="Жирный"
              aria-label="Жирный"
            ><strong>B</strong></button>
            <button
              type="button"
              class="pi-rte-btn pi-rte-btn--icon"
              [class.is-active]="activeStates().italic"
              (click)="toggleItalic()"
              title="Курсив"
              aria-label="Курсив"
            ><em>I</em></button>
            <button
              type="button"
              class="pi-rte-btn pi-rte-btn--icon"
              [class.is-active]="activeStates().underline"
              (click)="toggleUnderline()"
              title="Подчёркнутый"
              aria-label="Подчёркнутый"
            ><u>U</u></button>
          </div>

          <div class="pi-rte-sep"></div>

          <!-- Alignment -->
          <div class="pi-rte-group">
            <button
              type="button"
              class="pi-rte-btn pi-rte-btn--icon"
              [class.is-active]="activeStates().alignLeft"
              (click)="setTextAlign('left')"
              title="По левому краю"
              aria-label="По левому краю"
            >≡</button>
            <button
              type="button"
              class="pi-rte-btn pi-rte-btn--icon"
              [class.is-active]="activeStates().alignCenter"
              (click)="setTextAlign('center')"
              title="По центру"
              aria-label="По центру"
            >≡</button>
            <button
              type="button"
              class="pi-rte-btn pi-rte-btn--icon"
              [class.is-active]="activeStates().alignRight"
              (click)="setTextAlign('right')"
              title="По правому краю"
              aria-label="По правому краю"
            >≡</button>
          </div>

          <div class="pi-rte-sep"></div>

          <!-- List -->
          <div class="pi-rte-group">
            <button
              type="button"
              class="pi-rte-btn pi-rte-btn--icon"
              [class.is-active]="activeStates().bulletList"
              (click)="toggleBulletList()"
              title="Маркированный список"
              aria-label="Маркированный список"
            >•≡</button>
            <button
              type="button"
              class="pi-rte-btn pi-rte-btn--icon"
              [class.is-active]="activeStates().orderedList"
              (click)="toggleOrderedList()"
              title="Нумерованный список"
              aria-label="Нумерованный список"
            >1≡</button>
          </div>

          <div class="pi-rte-sep"></div>

          <!-- Font family -->
          <select
            class="pi-rte-select"
            [value]="activeStates().fontFamily"
            (change)="setFontFamily($event)"
            title="Шрифт"
            aria-label="Шрифт"
          >
            @for (opt of fontFamilies; track opt.value) {
              <option [value]="opt.value">{{ opt.label }}</option>
            }
          </select>

          <!-- Text color -->
          <input
            type="color"
            class="pi-rte-color"
            [value]="activeStates().color || '#000000'"
            (input)="setColor($event)"
            title="Цвет текста"
            aria-label="Цвет текста"
          />

          <!-- Highlight color -->
          <input
            type="color"
            class="pi-rte-color"
            [value]="activeStates().highlight || '#ffff00'"
            (input)="setHighlight($event)"
            title="Выделение текста"
            aria-label="Выделение текста"
          />
        </div>
      }

      <div
        #editorEl
        class="pi-rte-editor"
        [attr.contenteditable]="editable()"
      ></div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .pi-rte {
        border: 1px solid oklch(var(--color-rule));
        border-radius: 2px;
        background: oklch(var(--color-paper));
        overflow: hidden;
      }

      .pi-rte--focused {
        border-color: oklch(var(--color-ink));
      }

      .pi-rte--borderless {
        border: none;
      }

      /* ── Toolbar ── */
      .pi-rte-toolbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 2px;
        padding: 4px 6px;
        background: oklch(var(--color-paper-2));
        border-bottom: 1px solid oklch(var(--color-rule));
        user-select: none;
      }

      .pi-rte-group {
        display: flex;
        align-items: center;
        gap: 1px;
      }

      .pi-rte-sep {
        width: 1px;
        height: 20px;
        background: oklch(var(--color-rule));
        margin: 0 4px;
        flex-shrink: 0;
      }

      .pi-rte-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 28px;
        height: 28px;
        padding: 0 4px;
        font-size: 11px;
        font-weight: 600;
        font-family: inherit;
        background: transparent;
        color: oklch(var(--color-ink));
        border: 1px solid transparent;
        border-radius: 2px;
        cursor: pointer;
        transition: all 80ms ease;
      }

      .pi-rte-btn:hover {
        background: oklch(var(--color-sunrise-soft));
      }

      .pi-rte-btn.is-active {
        background: oklch(var(--color-ink));
        color: oklch(var(--color-paper));
      }

      .pi-rte-btn--icon {
        font-size: 13px;
      }

      .pi-rte-select {
        height: 28px;
        font-size: 11px;
        padding: 0 6px;
        background: transparent;
        color: oklch(var(--color-ink));
        border: 1px solid transparent;
        border-radius: 2px;
        cursor: pointer;
        font-family: inherit;
      }

      .pi-rte-select:hover {
        background: oklch(var(--color-sunrise-soft));
      }

      .pi-rte-color {
        width: 28px;
        height: 28px;
        padding: 2px;
        border: 1px solid transparent;
        border-radius: 2px;
        cursor: pointer;
        background: transparent;
      }

      .pi-rte-color:hover {
        background: oklch(var(--color-sunrise-soft));
      }

      .pi-rte-color::-webkit-color-swatch-wrapper {
        padding: 2px;
      }

      .pi-rte-color::-webkit-color-swatch {
        border: 1px solid oklch(var(--color-rule));
        border-radius: 1px;
      }

      /* ── Editor content ── */
      .pi-rte-editor {
        padding: 12px 14px;
        min-height: 60px;
        font-size: 14px;
        line-height: 1.6;
        color: oklch(var(--color-ink));
        outline: none;
        cursor: text;
      }

      .pi-rte-editor p {
        margin: 0 0 8px;
      }

      .pi-rte-editor p:last-child {
        margin-bottom: 0;
      }

      .pi-rte-editor h1 {
        font-size: 22px;
        font-weight: 700;
        margin: 0 0 8px;
        line-height: 1.2;
      }

      .pi-rte-editor h2 {
        font-size: 18px;
        font-weight: 600;
        margin: 0 0 6px;
        line-height: 1.3;
      }

      .pi-rte-editor h3 {
        font-size: 16px;
        font-weight: 600;
        margin: 0 0 6px;
        line-height: 1.3;
      }

      .pi-rte-editor ul,
      .pi-rte-editor ol {
        margin: 0 0 8px;
        padding-left: 20px;
      }

      .pi-rte-editor li {
        margin-bottom: 4px;
      }

      .pi-rte-editor strong {
        font-weight: 700;
      }

      .pi-rte-editor em {
        font-style: italic;
      }

      .pi-rte-editor u {
        text-decoration: underline;
      }

      .pi-rte-editor .ProseMirror {
        outline: none;
        min-height: 60px;
      }

      /* Placeholder */
      .pi-rte-editor .ProseMirror p.is-editor-empty:first-child::before {
        content: attr(data-placeholder);
        float: left;
        color: oklch(var(--color-muted));
        pointer-events: none;
        height: 0;
      }
    `,
  ],
})
export class PiRichTextEditorComponent implements AfterViewInit, OnDestroy {
  /** Two-way binding: HTML content. */
  readonly value = model<string>('');

  /** Placeholder text when editor is empty. */
  readonly placeholder = input<string>('Напишите текст…');

  /** Whether the editor is editable. */
  readonly editable = input<boolean>(true);

  /** Whether to show the toolbar above the editor. */
  readonly showToolbar = input<boolean>(true);

  /** Whether the editor has focus. */
  readonly focused = signal<boolean>(false);

  /** Active formatting states (for toolbar button highlights). */
  readonly activeStates = signal<ActiveStates>(DEFAULT_ACTIVE);

  /** Font family options for the select dropdown. */
  protected readonly fontFamilies = FONT_FAMILIES;

  private readonly editorEl = viewChild<ElementRef<HTMLDivElement>>('editorEl');

  private editor: Editor | null = null;
  private isUpdatingFromOutside = false;

  ngAfterViewInit(): void {
    const el = this.editorEl()?.nativeElement;
    if (!el) return;

    this.editor = new Editor({
      element: el,
      extensions: DEFAULT_EXTENSIONS,
      content: this.value() || '',
      editorProps: {
        attributes: {
          'data-placeholder': this.placeholder(),
        },
      },
      onUpdate: () => {
        if (this.isUpdatingFromOutside) return;
        this.value.set(this.editor!.getHTML());
      },
      onSelectionUpdate: () => {
        this.updateActiveStates();
      },
      onFocus: () => {
        this.focused.set(true);
        this.updateActiveStates();
      },
      onBlur: () => {
        this.focused.set(false);
      },
    });
  }

  constructor() {
    // Sync external value changes → editor content
    effect(() => {
      const v = this.value();
      const editor = this.editor;
      if (!editor) return;
      const current = editor.getHTML();
      if (current !== v) {
        this.isUpdatingFromOutside = true;
        editor.commands.setContent(v || '');
        this.isUpdatingFromOutside = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
  }

  // ── Toolbar commands ──

  protected toggleBold(): void {
    this.editor?.chain().focus().toggleBold().run();
  }

  protected toggleItalic(): void {
    this.editor?.chain().focus().toggleItalic().run();
  }

  protected toggleUnderline(): void {
    this.editor?.chain().focus().toggleUnderline().run();
  }

  protected toggleHeading(level: 1 | 2 | 3): void {
    this.editor?.chain().focus().toggleHeading({ level }).run();
  }

  protected toggleBulletList(): void {
    this.editor?.chain().focus().toggleBulletList().run();
  }

  protected toggleOrderedList(): void {
    this.editor?.chain().focus().toggleOrderedList().run();
  }

  protected setTextAlign(align: 'left' | 'center' | 'right'): void {
    this.editor?.chain().focus().setTextAlign(align).run();
  }

  protected setFontFamily(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    if (value === 'default') {
      this.editor?.chain().focus().unsetFontFamily().run();
    } else {
      this.editor?.chain().focus().setFontFamily(value).run();
    }
  }

  protected setColor(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.editor?.chain().focus().setColor(value).run();
  }

  protected setHighlight(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.editor?.chain().focus().toggleHighlight({ color: value }).run();
  }

  // ── State tracker ──

  private updateActiveStates(): void {
    const ed = this.editor;
    if (!ed) return;
    this.activeStates.set({
      bold: ed.isActive('bold'),
      italic: ed.isActive('italic'),
      underline: ed.isActive('underline'),
      heading1: ed.isActive('heading', { level: 1 }),
      heading2: ed.isActive('heading', { level: 2 }),
      heading3: ed.isActive('heading', { level: 3 }),
      bulletList: ed.isActive('bulletList'),
      orderedList: ed.isActive('orderedList'),
      alignLeft: ed.isActive({ textAlign: 'left' }),
      alignCenter: ed.isActive({ textAlign: 'center' }),
      alignRight: ed.isActive({ textAlign: 'right' }),
      fontFamily: (ed.getAttributes('textStyle') as Record<string, string>)['fontFamily'] ?? '',
      color: (ed.getAttributes('textStyle') as Record<string, string>)['color'] ?? '',
      highlight: (ed.getAttributes('highlight') as Record<string, string>)['color'] ?? '',
    });
  }
}

// ── Types ──

export interface ActiveStates {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  heading1: boolean;
  heading2: boolean;
  heading3: boolean;
  bulletList: boolean;
  orderedList: boolean;
  alignLeft: boolean;
  alignCenter: boolean;
  alignRight: boolean;
  fontFamily: string;
  color: string;
  highlight: string;
}

const DEFAULT_ACTIVE: ActiveStates = {
  bold: false,
  italic: false,
  underline: false,
  heading1: false,
  heading2: false,
  heading3: false,
  bulletList: false,
  orderedList: false,
  alignLeft: false,
  alignCenter: false,
  alignRight: false,
  fontFamily: '',
  color: '',
  highlight: '',
};
