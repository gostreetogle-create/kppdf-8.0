import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { LucideAngularModule } from 'lucide-angular';
import { PiCanvasBlockHandleComponent } from '../../../shared/ui/canvas/pi-canvas-block-handle.component';
import {
  BLOCK_TYPE_LABELS,
  type BlockType,
  type TemplateBlock,
} from '../../../shared/template-block/template-block.types';

/**
 * TZ-86 Phase D.1 — `BlockRenderer` (leaf, presentational).
 *
 * Renders ONE TemplateBlock on the builder canvas. Wraps the content in
 * a `cdkDrag` so the parent `BuilderCanvas` (cdkDropList) can reorder it.
 *
 * Selection model:
 *   - Click anywhere on the block (NOT the drag-handle) → emits `(select)`
 *   - The parent `BuilderPage` keeps a `selectedId` signal and reflects
 *     it back via the `selected` input → 2px ink outline + bg-sunrise-soft
 *
 * Rendering per `type`:
 *   - `header`   → bold H2-like text + optional horizontal hairline rule
 *   - `text`     → raw content as paragraph (no markdown for MVP; can add marked later)
 *   - `table`    → shows a 1-row summary «Таблица: {title}» + binding source label
 *   - `image`    → placeholder «Изображение: {title}» (no upload for MVP)
 *   - `signature`→ centered «Подпись: {title}» with hairline underline
 *
 * Data-binding badge: if `dataBinding` is non-null, show a small sunrise-warm
 * pill «[source.field]» so the user can see at a glance which blocks are
 * dynamic vs static.
 *
 * No service injection. All inputs come from the parent; outputs go back up.
 * This keeps BlockRenderer trivially testable and reusable inside preview
 * panes (Phase F.2).
 */
@Component({
  selector: 'app-block-renderer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkDrag, LucideAngularModule, PiCanvasBlockHandleComponent],
  template: `
    <div
      cdkDrag
      cdkDragLockAxis="y"
      class="group block-renderer"
      [class.is-selected]="selected()"
      [class.is-inactive]="!block().isActive"
      [attr.data-block-type]="block().type"
      [attr.aria-selected]="selected()"
      [attr.role]="'button'"
      [attr.tabindex]="'0'"
      (click)="onSelect($event)"
      (keydown.enter)="onSelect($event)"
      (keydown.space)="onSelect($event)"
    >
      <pi-canvas-block-handle />
      <div class="block-renderer__body">
        <div class="block-renderer__header">
          <span class="block-renderer__type">{{ typeLabel() }}</span>
          @if (bindingBadge()) {
            <span class="block-renderer__binding" [title]="bindingBadgeTooltip()">
              {{ bindingBadge() }}
            </span>
          }
        </div>
        <div class="block-renderer__content">
          {{ renderedContent() }}
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .block-renderer {
        position: relative;
        display: flex;
        gap: 8px;
        align-items: flex-start;
        padding: 10px 12px;
        background: var(--color-paper);
        border: 1px solid var(--color-rule);
        border-radius: 2px;
        cursor: pointer;
        transition: background 120ms ease, border-color 120ms ease;
      }

      .block-renderer:hover {
        background: color-mix(in oklch, var(--color-sunrise-soft) 50%, transparent);
      }

      .block-renderer.is-selected {
        border-color: var(--color-ink);
        border-width: 2px;
        padding: 9px 11px;
      }

      .block-renderer.is-inactive {
        opacity: 0.5;
      }

      .block-renderer__body {
        flex: 1;
        min-width: 0;
      }

      .block-renderer__header {
        display: flex;
        gap: 8px;
        align-items: center;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-muted);
        margin-bottom: 4px;
      }

      .block-renderer__type {
        font-weight: 600;
      }

      .block-renderer__binding {
        background: color-mix(in oklch, var(--color-sunrise-warm) 20%, transparent);
        color: var(--color-sunrise-warm);
        padding: 1px 6px;
        border-radius: 2px;
        font-size: 10px;
        font-family: ui-monospace, monospace;
        text-transform: none;
        letter-spacing: 0;
      }

      .block-renderer__content {
        font-size: 14px;
        color: var(--color-ink);
        line-height: 1.5;
        word-wrap: break-word;
      }

      /* Header variant — larger weight */
      .block-renderer[data-block-type='header'] .block-renderer__content {
        font-size: 18px;
        font-weight: 600;
      }

      /* Signature variant — centered, italic */
      .block-renderer[data-block-type='signature'] {
        align-items: center;
        justify-content: center;
        flex-direction: column;
      }
      .block-renderer[data-block-type='signature'] .block-renderer__content {
        font-style: italic;
        text-align: center;
        border-top: 1px solid var(--color-rule);
        padding-top: 8px;
        width: 100%;
      }

      /* Table variant — content styled as caption */
      .block-renderer[data-block-type='table'] .block-renderer__content {
        font-family: ui-monospace, monospace;
        font-size: 13px;
        color: var(--color-muted);
      }
    `,
  ],
})
export class BlockRendererComponent {
  /** The block to render. */
  readonly block = input.required<TemplateBlock>();
  /** Whether this block is the currently-selected one (drives outline). */
  readonly selected = input<boolean>(false);
  /** Emitted when the user clicks/keys to select this block. */
  readonly select = output<TemplateBlock>();

  protected readonly typeLabel = computed<string>(
    () => BLOCK_TYPE_LABELS[this.block().type] ?? this.block().type,
  );

  protected readonly bindingBadge = computed<string | null>(() => {
    const b = this.block().dataBinding;
    if (!b) return null;
    if (b.source === 'static') return `static: ${b.value ?? ''}`;
    if (b.field) return `${b.source}.${b.field}`;
    return b.source;
  });

  protected readonly bindingBadgeTooltip = computed<string>(() => {
    const b = this.block().dataBinding;
    if (!b) return '';
    const parts: string[] = [b.source];
    if (b.field) parts.push(b.field);
    if (b.format) parts.push(`format: ${b.format}`);
    return parts.join(' · ');
  });

  /**
   * Per-type rendering — for MVP we keep all types text-based (no image
   * upload, no table render). The shape is `{title} · {content}` so the
   * user can see the input even without visual fidelity.
   */
  protected readonly renderedContent = computed<string>(() => {
    const b = this.block();
    const parts: string[] = [];
    if (b.title) parts.push(b.title);
    if (b.content) parts.push(b.content);
    if (!parts.length) {
      // No content — show a placeholder appropriate to the type
      const placeholders: Record<BlockType, string> = {
        header: 'Заголовок без текста',
        text: 'Текстовый блок без содержимого',
        table: 'Таблица без шаблона',
        image: 'Изображение не выбрано',
        signature: 'Место для подписи',
      };
      return placeholders[b.type] ?? '—';
    }
    return parts.join(' · ');
  });

  protected onSelect(event: Event): void {
    event.stopPropagation();
    this.select.emit(this.block());
  }
}
