/**
 * TZ-104.6 — `PiRichTextEditorComponent`
 *
 * Минималистичный редактор для текстовых блоков документа.
 * Только самое необходимое: заголовки, жирный/курсив/подчёркивание,
 * выравнивание. Без цвета, выделения, списков и шрифтов.
 */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';

export const DEFAULT_EXTENSIONS = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
    underline: false,
    bulletList: false,
    orderedList: false,
    code: false,
    codeBlock: false,
    blockquote: false,
    horizontalRule: false,
  }),
  Underline,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
];

@Component({
  selector: 'app-pi-rich-text',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="pi-rte"
      [class.pi-rte--focused]="focused()"
      [class.pi-rte--selected]="selected()"
      [class.pi-rte--compact]="compact()"
      [class.pi-rte--chromeless]="!showToolbar()"
      (mousedown)="activate.emit()"
    >
      @if (showToolbar()) {
        <div class="pi-rte-toolbar" role="toolbar" aria-label="Форматирование текста">
          <!-- Heading levels -->
          <div class="pi-rte-group">
            <button type="button" class="pi-rte-btn"
              [class.is-active]="activeStates().h1"
              (click)="toggleHeading(1)" title="Заголовок 1">
              H<sub>1</sub>
            </button>
            <button type="button" class="pi-rte-btn"
              [class.is-active]="activeStates().h2"
              (click)="toggleHeading(2)" title="Заголовок 2">
              H<sub>2</sub>
            </button>
            <button type="button" class="pi-rte-btn"
              [class.is-active]="activeStates().h3"
              (click)="toggleHeading(3)" title="Заголовок 3">
              H<sub>3</sub>
            </button>
          </div>

          <div class="pi-rte-sep"></div>

          <!-- Inline: bold / italic / underline -->
          <div class="pi-rte-group">
            <button type="button" class="pi-rte-btn pi-rte-btn--icon"
              [class.is-active]="activeStates().bold"
              (click)="toggleBold()" title="Жирный">
              <strong>B</strong>
            </button>
            <button type="button" class="pi-rte-btn pi-rte-btn--icon"
              [class.is-active]="activeStates().italic"
              (click)="toggleItalic()" title="Курсив">
              <em>I</em>
            </button>
            <button type="button" class="pi-rte-btn pi-rte-btn--icon"
              [class.is-active]="activeStates().underline"
              (click)="toggleUnderline()" title="Подчёркнутый">
              <u>U</u>
            </button>
          </div>

          <div class="pi-rte-sep"></div>

          <!-- Alignment -->
          <div class="pi-rte-group">
            <button type="button" class="pi-rte-btn"
              [class.is-active]="activeStates().alignLeft"
              (click)="setTextAlign('left')" title="По левому краю">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 2h12M1 5h8M1 8h10M1 11h6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
              </svg>
            </button>
            <button type="button" class="pi-rte-btn"
              [class.is-active]="activeStates().alignCenter"
              (click)="setTextAlign('center')" title="По центру">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 2h12M3 5h8M2 8h10M4 11h6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
              </svg>
            </button>
            <button type="button" class="pi-rte-btn"
              [class.is-active]="activeStates().alignRight"
              (click)="setTextAlign('right')" title="По правому краю">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 2h12M5 5h8M3 8h10M7 11h6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      }

      <div #editorEl class="pi-rte-editor" [class.pi-rte-editor--compact]="compact()"></div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    /* ── Container ── */
    .pi-rte {
      position: relative;
      border: 1.5px solid oklch(var(--color-ink) / 0.85);
      border-radius: 5px;
      background: oklch(var(--color-paper));
      overflow: hidden;
      transition: border-color 140ms ease, box-shadow 140ms ease;
    }
    .pi-rte:hover {
      border-color: oklch(var(--color-ink));
    }
    .pi-rte--focused {
      border-color: oklch(var(--color-ink));
      box-shadow:
        0 0 0 3px oklch(var(--color-sunrise-glow) / 0.4),
        0 6px 18px oklch(0 0 0 / 0.06);
    }
    .pi-rte--selected {
      border-color: oklch(var(--color-sunrise-warm));
      box-shadow:
        0 0 0 3px oklch(var(--color-sunrise-glow) / 0.35),
        0 4px 12px oklch(0 0 0 / 0.08);
    }
    .pi-rte--chromeless {
      border: none;
      border-radius: 4px;
      box-shadow: none;
      background: transparent;
    }
    .pi-rte--chromeless:hover {
      border-color: transparent;
    }
    .pi-rte--chromeless.pi-rte--selected {
      border-color: transparent;
      box-shadow: none;
    }
    .pi-rte--chromeless .pi-rte-editor {
      background: oklch(var(--color-paper));
      border: 1px solid oklch(var(--color-ink) / 0.2);
      border-radius: 4px;
      box-shadow: inset 0 1px 3px oklch(0 0 0 / 0.06);
    }
    .pi-rte--chromeless.pi-rte--selected .pi-rte-editor {
      border-color: oklch(var(--color-ink) / 0.35);
      background: oklch(var(--color-paper));
    }

    /* ── Toolbar ── */
    .pi-rte-toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 5px;
      padding: 6px 8px;
      background:
        linear-gradient(
          to bottom,
          oklch(var(--color-paper-2)),
          oklch(var(--color-paper))
        );
      border-bottom: 1px solid oklch(var(--color-rule));
      user-select: none;
    }
    .pi-rte--compact .pi-rte-toolbar {
      padding: 4px 6px;
      gap: 4px;
    }

    .pi-rte-group {
      display: flex;
      align-items: center;
      gap: 1px;
      padding: 2px;
      background: oklch(var(--color-paper));
      border: 1px solid oklch(var(--color-rule));
      border-radius: 5px;
    }

    .pi-rte-sep {
      width: 1px;
      height: 18px;
      background: oklch(var(--color-rule));
      margin: 0 2px;
      flex-shrink: 0;
    }

    .pi-rte-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 26px;
      height: 24px;
      padding: 0 6px;
      font-size: 11px;
      font-weight: 600;
      font-family: inherit;
      background: transparent;
      color: oklch(var(--color-ink));
      border: 1px solid transparent;
      border-radius: 3px;
      cursor: pointer;
      transition:
        background 110ms ease,
        color 110ms ease,
        border-color 110ms ease,
        box-shadow 110ms ease,
        transform 80ms ease;
      line-height: 1;
    }
    .pi-rte-btn:hover {
      background: oklch(var(--color-sunrise-soft));
      border-color: oklch(var(--color-rule));
    }
    .pi-rte-btn.is-active {
      background: oklch(var(--color-ink));
      color: oklch(var(--color-paper));
      border-color: oklch(var(--color-ink));
      box-shadow:
        0 0 0 2px oklch(var(--color-sunrise-glow) / 0.5),
        0 1px 2px oklch(0 0 0 / 0.12);
    }
    .pi-rte-btn:active {
      transform: scale(0.92);
    }
    .pi-rte-btn:focus-visible {
      outline: 2px solid oklch(var(--color-sunrise-warm));
      outline-offset: 1px;
    }
    .pi-rte-btn--icon { font-size: 13px; line-height: 1; }
    .pi-rte-btn sub { font-size: 8px; vertical-align: sub; line-height: 0; }

    /* ── Editor content ── */
    .pi-rte-editor {
      padding: 12px 14px;
      min-height: 52px;
      font-size: 14px;
      line-height: 1.6;
      color: oklch(var(--color-ink));
      outline: none;
      cursor: text;
      background: oklch(var(--color-paper));
      box-shadow: inset 0 1px 2px oklch(0 0 0 / 0.05);
    }
    .pi-rte-editor--compact {
      padding: 10px 12px;
      min-height: 38px;
      font-size: 13px;
      box-shadow: inset 0 1px 2px oklch(0 0 0 / 0.04);
    }
    .pi-rte-editor--compact {
      padding: 10px 12px;
      min-height: 38px;
      font-size: 13px;
    }
    .pi-rte-editor p { margin: 0 0 6px; }
    .pi-rte-editor p:last-child { margin-bottom: 0; }
    .pi-rte-editor h1 { font-size: 18px; font-weight: 700; margin: 0 0 6px; line-height: 1.2; }
    .pi-rte-editor h2 { font-size: 15px; font-weight: 600; margin: 0 0 4px; line-height: 1.3; }
    .pi-rte-editor h3 { font-size: 14px; font-weight: 600; margin: 0 0 4px; line-height: 1.3; }
    .pi-rte-editor strong { font-weight: 700; }
    .pi-rte-editor em { font-style: italic; }
    .pi-rte-editor u { text-decoration: underline; }

    .pi-rte-editor .ProseMirror {
      outline: none;
      min-height: 52px;
    }
    .pi-rte-editor--compact .ProseMirror {
      min-height: 38px;
    }
    /* TipTap placeholder */
    .pi-rte-editor .ProseMirror p.is-editor-empty:first-child::before {
      content: attr(data-placeholder);
      float: left;
      color: oklch(var(--color-muted-foreground-strong));
      pointer-events: none;
      height: 0;
      font-weight: 400;
      font-style: italic;
    }
  `],
})
export class PiRichTextEditorComponent implements AfterViewInit, OnDestroy {
  readonly value = model<string>('');
  readonly placeholder = input<string>('Напишите текст…');
  readonly editable = input<boolean>(true);
  readonly showToolbar = input<boolean>(true);
  readonly compact = input<boolean>(false);
  /** Parent-driven selection ring (multi-column editor). */
  readonly selected = input<boolean>(false);
  readonly activate = output<void>();
  readonly statesChange = output<ActiveStates>();
  readonly focused = signal<boolean>(false);

  readonly activeStates = signal<ActiveStates>(DEFAULT_ACTIVE);

  private readonly editorEl = viewChild<ElementRef<HTMLDivElement>>('editorEl');
  private editor: Editor | null = null;
  private isUpdatingFromOutside = false;
  /** Caret saved before modal dialogs steal focus. */
  private savedSelection: { from: number; to: number } | null = null;

  ngAfterViewInit(): void {
    const el = this.editorEl()?.nativeElement;
    if (!el) return;

    this.editor = new Editor({
      element: el,
      extensions: DEFAULT_EXTENSIONS,
      content: this.value() || '',
      editorProps: {
        attributes: { 'data-placeholder': this.placeholder() },
      },
      onUpdate: () => {
        if (this.isUpdatingFromOutside) return;
        this.value.set(this.editor!.getHTML());
      },
      onSelectionUpdate: () => this.updateActiveStates(),
      onFocus: () => {
        this.focused.set(true);
        this.activate.emit();
        this.updateActiveStates();
      },
      onBlur: () => {
        this.focused.set(false);
      },
    });
  }

  constructor() {
    effect(() => {
      const v = this.value();
      const editor = this.editor;
      if (!editor) return;
      if (editor.getHTML() !== v) {
        this.isUpdatingFromOutside = true;
        editor.commands.setContent(v || '');
        this.isUpdatingFromOutside = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
  }

  /** Focus this editor instance (used by parent toolbar). */
  focusEditor(): void {
    this.editor?.chain().focus().run();
  }

  /** Remember caret before opening a dialog (focus is lost on blur). */
  saveSelection(): void {
    if (!this.editor) return;
    const { from, to } = this.editor.state.selection;
    this.savedSelection = { from, to };
  }

  /** Insert plain text / token at cursor (or saved caret). */
  insertContent(text: string): void {
    const ed = this.editor;
    if (!ed) return;

    let chain = ed.chain().focus();
    if (this.savedSelection) {
      chain = chain.setTextSelection(this.savedSelection);
      this.savedSelection = null;
    }
    chain.insertContent(text).run();
    this.syncValueFromEditor();
  }

  private syncValueFromEditor(): void {
    const ed = this.editor;
    if (!ed) return;
    const html = ed.getHTML();
    if (this.value() === html) return;
    this.isUpdatingFromOutside = true;
    this.value.set(html);
    this.isUpdatingFromOutside = false;
  }

  /** Mirror toolbar state for parent-driven chrome. */
  getActiveStates(): ActiveStates {
    return this.activeStates();
  }

  refreshActiveStates(): void {
    this.updateActiveStates();
  }

  // ── Commands (public for parent toolbar) ──
  toggleBold(): void { this.editor?.chain().focus().toggleBold().run(); }
  toggleItalic(): void { this.editor?.chain().focus().toggleItalic().run(); }
  toggleUnderline(): void { this.editor?.chain().focus().toggleUnderline().run(); }
  toggleHeading(level: 1 | 2 | 3): void { this.editor?.chain().focus().toggleHeading({ level }).run(); }
  setTextAlign(align: 'left' | 'center' | 'right'): void { this.editor?.chain().focus().setTextAlign(align).run(); }

  private updateActiveStates(): void {
    const ed = this.editor;
    if (!ed) return;
    const next: ActiveStates = {
      bold: ed.isActive('bold'),
      italic: ed.isActive('italic'),
      underline: ed.isActive('underline'),
      h1: ed.isActive('heading', { level: 1 }),
      h2: ed.isActive('heading', { level: 2 }),
      h3: ed.isActive('heading', { level: 3 }),
      alignLeft: ed.isActive({ textAlign: 'left' }),
      alignCenter: ed.isActive({ textAlign: 'center' }),
      alignRight: ed.isActive({ textAlign: 'right' }),
    };
    this.activeStates.set(next);
    this.statesChange.emit(next);
  }
}

export interface ActiveStates {
  bold: boolean; italic: boolean; underline: boolean;
  h1: boolean; h2: boolean; h3: boolean;
  alignLeft: boolean; alignCenter: boolean; alignRight: boolean;
}

const DEFAULT_ACTIVE: ActiveStates = {
  bold: false, italic: false, underline: false,
  h1: false, h2: false, h3: false,
  alignLeft: false, alignCenter: false, alignRight: false,
};
