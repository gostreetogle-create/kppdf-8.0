/**
 * TZ-104.6 — `PiRichTextEditorComponent`
 *
 * Минималистичный редактор для текстовых блоков документа.
 * Жирный/курсив/подчёркивание + выравнивание. Размер — через fontSize колонки.
 * H1–H3 убраны (Stabilization / texts polish): дублировали «Шрифт».
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
import { Placeholder } from '@tiptap/extensions/placeholder';
import { SubstitutionToken, migratePlainTokensToNodes } from './substitution-token.extension';

export function createRichTextExtensions(placeholderText: string) {
  return [
    StarterKit.configure({
      heading: false,
      underline: false,
      bulletList: false,
      orderedList: false,
      code: false,
      codeBlock: false,
      blockquote: false,
      horizontalRule: false,
    }),
    Underline,
    TextAlign.configure({ types: ['paragraph'] }),
    SubstitutionToken,
    Placeholder.configure({
      placeholder: placeholderText,
      emptyEditorClass: 'is-editor-empty',
      emptyNodeClass: 'is-empty',
    }),
  ];
}

/** @deprecated Prefer createRichTextExtensions — kept for rare direct imports. */
export const DEFAULT_EXTENSIONS = createRichTextExtensions('Напишите текст…');

@Component({
  selector: 'app-pi-rich-text',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="pi-rte"
      [attr.data-placeholder]="placeholder()"
      [class.pi-rte--focused]="focused()"
      [class.pi-rte--selected]="selected()"
      [class.pi-rte--compact]="compact()"
      [class.pi-rte--chromeless]="!showToolbar()"
      (mousedown)="onShellMouseDown($event)"
    >
      @if (showToolbar()) {
        <div class="pi-rte-toolbar" role="toolbar" aria-label="Форматирование текста">
          <!-- Inline: bold / italic / underline -->
          <div class="pi-rte-group">
            <button
              type="button"
              class="pi-rte-btn pi-rte-btn--icon"
              [class.is-active]="activeStates().bold"
              (click)="toggleBold()"
              title="Жирный"
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              class="pi-rte-btn pi-rte-btn--icon"
              [class.is-active]="activeStates().italic"
              (click)="toggleItalic()"
              title="Курсив"
            >
              <em>I</em>
            </button>
            <button
              type="button"
              class="pi-rte-btn pi-rte-btn--icon"
              [class.is-active]="activeStates().underline"
              (click)="toggleUnderline()"
              title="Подчёркнутый"
            >
              <u>U</u>
            </button>
          </div>

          <div class="pi-rte-sep"></div>

          <!-- Alignment -->
          <div class="pi-rte-group">
            <button
              type="button"
              class="pi-rte-btn"
              [class.is-active]="activeStates().alignLeft"
              (click)="setTextAlign('left')"
              title="По левому краю"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M1 2h12M1 5h8M1 8h10M1 11h6"
                  stroke="currentColor"
                  stroke-width="1.2"
                  stroke-linecap="round"
                />
              </svg>
            </button>
            <button
              type="button"
              class="pi-rte-btn"
              [class.is-active]="activeStates().alignCenter"
              (click)="setTextAlign('center')"
              title="По центру"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M1 2h12M3 5h8M2 8h10M4 11h6"
                  stroke="currentColor"
                  stroke-width="1.2"
                  stroke-linecap="round"
                />
              </svg>
            </button>
            <button
              type="button"
              class="pi-rte-btn"
              [class.is-active]="activeStates().alignRight"
              (click)="setTextAlign('right')"
              title="По правому краю"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M1 2h12M5 5h8M3 8h10M7 11h6"
                  stroke="currentColor"
                  stroke-width="1.2"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      }

      <div
        #editorEl
        class="pi-rte-editor"
        [class.pi-rte-editor--compact]="compact()"
        (mousedown)="onEditorSurfaceMouseDown($event)"
      ></div>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: inherit;
        --pi-rte-editor-border: oklch(0.22 0.08 260);
        --pi-rte-editor-border-selected: oklch(0.32 0.14 260);
      }
      :host-context(.dark) {
        --pi-rte-editor-border: oklch(0.55 0.1 260);
        --pi-rte-editor-border-selected: oklch(0.65 0.14 260);
      }

      /* ── Container ── */
      .pi-rte {
        position: relative;
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: inherit;
        border: 1.5px solid oklch(var(--color-ink) / 0.85);
        border-radius: 5px;
        background: oklch(var(--color-paper));
        overflow: hidden;
        transition: border-color 140ms ease;
      }
      .pi-rte:hover {
        border-color: oklch(var(--color-ink));
      }
      .pi-rte--focused {
        border-color: oklch(var(--color-ink));
        outline: 3px solid oklch(var(--color-sunrise-glow) / 0.4);
        outline-offset: 0;
      }
      .pi-rte--selected {
        border-color: oklch(var(--color-sunrise-warm));
        outline: 3px solid oklch(var(--color-sunrise-glow) / 0.35);
        outline-offset: 0;
      }
      .pi-rte--chromeless {
        border: none;
        border-radius: 4px;
        outline: none;
        background: transparent;
      }
      .pi-rte--chromeless:hover {
        border-color: transparent;
      }
      .pi-rte--chromeless.pi-rte--selected {
        border-color: transparent;
        outline: none;
      }
      .pi-rte--chromeless .pi-rte-editor {
        background: oklch(var(--color-paper));
        border: 1px solid var(--pi-rte-editor-border);
        border-radius: 4px;
      }
      .pi-rte--chromeless.pi-rte--selected .pi-rte-editor {
        border-color: var(--pi-rte-editor-border-selected);
        background: oklch(var(--color-paper));
      }

      /* ── Toolbar ── */
      .pi-rte-toolbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 5px;
        padding: 6px 8px;
        background: linear-gradient(
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
      }
      .pi-rte-btn:active {
        transform: scale(0.92);
      }
      .pi-rte-btn:focus-visible {
        outline: 2px solid oklch(var(--color-sunrise-warm));
        outline-offset: 1px;
      }
      .pi-rte-btn--icon {
        font-size: 13px;
        line-height: 1;
      }
      .pi-rte-btn sub {
        font-size: 8px;
        vertical-align: sub;
        line-height: 0;
      }

      /* ── Editor content ── */
      .pi-rte-editor {
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        padding: 12px 14px;
        min-height: 52px;
        font-size: 14px;
        line-height: 1.6;
        color: oklch(var(--color-ink));
        outline: none;
        cursor: text;
        background: oklch(var(--color-paper));
      }
      .pi-rte-editor--compact {
        padding: 10px 12px;
        min-height: 38px;
        font-size: 13px;
      }
      .pi-rte-editor p {
        margin: 0 0 6px;
      }
      .pi-rte-editor p:last-child {
        margin-bottom: 0;
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
      :host ::ng-deep .substitution-token {
        display: inline-block;
        padding: 1px 6px;
        margin: 0 1px;
        font-family: ui-monospace, monospace;
        font-size: 11px;
        font-weight: 600;
        color: oklch(var(--color-ink));
        background: oklch(var(--color-paper-2));
        border: 1px solid oklch(var(--color-rule));
        border-radius: 2px;
      }

      .pi-rte-editor .ProseMirror {
        outline: none;
        flex: 1 1 auto;
        min-height: 100%;
        height: 100%;
        cursor: text;
      }
      .pi-rte-editor--compact .ProseMirror {
        min-height: 100%;
      }
      /* TipTap Placeholder extension */
      .pi-rte-editor .ProseMirror p.is-empty:first-child::before,
      .pi-rte-editor .ProseMirror.is-editor-empty p:first-child::before {
        content: attr(data-placeholder);
        float: left;
        color: oklch(var(--color-muted-foreground-strong));
        pointer-events: none;
        height: 0;
        font-weight: 400;
        font-style: italic;
      }
      .pi-rte-editor .ProseMirror.is-editor-empty::before {
        content: none;
      }
    `,
  ],
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
      extensions: createRichTextExtensions(this.placeholder()),
      content: migratePlainTokensToNodes(this.value() || ''),
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
        editor.commands.setContent(migratePlainTokensToNodes(v || ''));
        this.isUpdatingFromOutside = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
  }

  /** Click anywhere in the tall empty panel → focus caret (not only the top line). */
  protected onShellMouseDown(event: MouseEvent): void {
    this.activate.emit();
    const target = event.target as HTMLElement | null;
    if (target?.closest('.pi-rte-toolbar')) return;
  }

  protected onEditorSurfaceMouseDown(event: MouseEvent): void {
    this.activate.emit();
    // Click on padding / empty surface below the paragraph still focuses.
    if (event.target === this.editorEl()?.nativeElement) {
      event.preventDefault();
      this.focusEditor();
    }
  }

  /** Focus this editor instance (used by parent toolbar). */
  focusEditor(): void {
    this.editor?.chain().focus('end').run();
  }

  /** Remember caret before opening a dialog (focus is lost on blur). */
  saveSelection(): void {
    if (!this.editor) return;
    const { from, to } = this.editor.state.selection;
    this.savedSelection = { from, to };
  }

  /** Insert plain text / token at cursor (or saved caret / end). */
  insertContent(text: string): void {
    const ed = this.editor;
    if (!ed) return;

    let chain = ed.chain().focus();
    if (this.savedSelection) {
      const max = ed.state.doc.content.size;
      const from = Math.min(this.savedSelection.from, max);
      const to = Math.min(this.savedSelection.to, max);
      chain = chain.setTextSelection({ from, to });
      this.savedSelection = null;
    }
    const tokenMatch = /^\{\{[\w.]+\}\}$/.exec(text.trim());
    if (tokenMatch) {
      chain
        .insertContent({
          type: 'substitutionToken',
          attrs: { token: tokenMatch[0] },
        })
        .run();
      const posAfter = ed.state.selection.from;
      const docSize = ed.state.doc.content.size;
      const nextChar = posAfter < docSize ? ed.state.doc.textBetween(posAfter, posAfter + 1) : '';
      if (nextChar !== '' && nextChar !== ' ') {
        ed.chain().insertContentAt(posAfter, ' ').run();
      }
    } else {
      chain.insertContent(text).run();
    }
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

  /** Session-scoped undo/redo commands for the document studio. */
  undo(): void {
    this.editor?.chain().focus().undo().run();
  }

  redo(): void {
    this.editor?.chain().focus().redo().run();
  }

  /** Mirror toolbar state for parent-driven chrome. */
  getActiveStates(): ActiveStates {
    return this.activeStates();
  }

  refreshActiveStates(): void {
    this.updateActiveStates();
  }

  // ── Commands (public for parent toolbar) ──
  toggleBold(): void {
    this.editor?.chain().focus().toggleBold().run();
  }
  toggleItalic(): void {
    this.editor?.chain().focus().toggleItalic().run();
  }
  toggleUnderline(): void {
    this.editor?.chain().focus().toggleUnderline().run();
  }
  setTextAlign(align: 'left' | 'center' | 'right'): void {
    this.editor?.chain().focus().setTextAlign(align).run();
  }
  selectAll(): void {
    this.editor?.chain().focus().selectAll().run();
  }

  private updateActiveStates(): void {
    const ed = this.editor;
    if (!ed) return;
    const next: ActiveStates = {
      bold: ed.isActive('bold'),
      italic: ed.isActive('italic'),
      underline: ed.isActive('underline'),
      alignLeft: ed.isActive({ textAlign: 'left' }),
      alignCenter: ed.isActive({ textAlign: 'center' }),
      alignRight: ed.isActive({ textAlign: 'right' }),
    };
    this.activeStates.set(next);
    this.statesChange.emit(next);
  }
}

export interface ActiveStates {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  alignLeft: boolean;
  alignCenter: boolean;
  alignRight: boolean;
}

const DEFAULT_ACTIVE: ActiveStates = {
  bold: false,
  italic: false,
  underline: false,
  alignLeft: false,
  alignCenter: false,
  alignRight: false,
};
