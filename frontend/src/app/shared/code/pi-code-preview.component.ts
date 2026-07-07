import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import json from 'highlight.js/lib/languages/json';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';

export type CodeLanguage = 'html' | 'typescript' | 'css' | 'bash' | 'json';

/**
 * Module-level registration: fires ONCE per app load (when this file is
 * first imported by Angular's lazy-load or eager-load chain). hljs is sync
 * and DOM-free, so this is safe on both browser and any future SSR build.
 */
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('css', css);
hljs.registerLanguage('json', json);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('xml', xml);
// 'html' aliased to 'xml' (hljs convention)
hljs.registerLanguage('html', xml);

/**
 * PiCodePreviewComponent — TZ-78 (highlight.js v11 powered).
 *
 * Features:
 * - Tree-shake imports: only 5 languages bundled (bash/css/json/typescript/xml)
 * - Module-level `hljs.registerLanguage()` runs once per app load (not per
 *   component instance, not per AfterViewInit). Safe on SSR (hljs is sync
 *   + DOM-free; grammar definitions don't touch window/document).
 * - Line numbers sidebar (mono, muted color, hairline-r separator)
 * - Paper & Ink highlight.js theme: scoped to `<app-pi-code-preview>` via
 *   `:host ::ng-deep` so styles die with the component (no global bloat).
 * - `captionTitle` input lets consumers override auto-derived caption.
 * - ariaLabel propagates to <pre>; SSR-safe via `escapeHtml()` fallback for
 *   any unregistered language (prevents XSS via [innerHTML] binding).
 *
 * Standalone + OnPush + signal-based.
 */
@Component({
  selector: 'app-pi-code-preview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure class="hairline rounded-sm overflow-hidden bg-paper-2">
      @if (showCaption()) {
        <figcaption
          class="px-4 py-2 border-b hairline border-rule flex items-center justify-between"
        >
          <span class="eyebrow">{{ captionTitle() || language() }}</span>
          @if (fileName()) {
            <span class="font-mono text-[10px] text-muted-foreground">{{
              fileName()
            }}</span>
          }
        </figcaption>
      }
      <div class="flex">
        @if (showLineNumbers()) {
          <div
            class="px-3 py-4 border-r hairline border-rule font-mono text-[11px] text-muted-foreground select-none text-right"
            aria-hidden="true"
          >
            @for (n of lineNumbers(); track n) {
              <div class="leading-relaxed">{{ n }}</div>
            }
          </div>
        }
        <pre
          class="flex-1 p-4 overflow-auto font-mono text-[12px] leading-relaxed text-ink"
          [attr.aria-label]="ariaLabel()"
        ><code
          [class]="'hljs language-' + language()"
          [innerHTML]="highlightedCode()"
        ></code></pre>
      </div>
    </figure>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      /* Paper & Ink highlight.js theme — scoped to this component only. */
      :host ::ng-deep .hljs {
        color: var(--color-ink);
        background: transparent;
      }
      :host ::ng-deep .hljs-keyword,
      :host ::ng-deep .hljs-selector-tag,
      :host ::ng-deep .hljs-built_in,
      :host ::ng-deep .hljs-name {
        color: var(--color-accent-cool);
        font-weight: 500;
      }
      :host ::ng-deep .hljs-string,
      :host ::ng-deep .hljs-attr,
      :host ::ng-deep .hljs-symbol,
      :host ::ng-deep .hljs-bullet,
      :host ::ng-deep .hljs-link {
        color: var(--color-accent-warm);
      }
      :host ::ng-deep .hljs-number,
      :host ::ng-deep .hljs-literal {
        color: var(--color-ink);
        font-weight: 500;
      }
      :host ::ng-deep .hljs-comment,
      :host ::ng-deep .hljs-quote {
        color: var(--color-muted);
        font-style: italic;
      }
      :host ::ng-deep .hljs-title,
      :host ::ng-deep .hljs-section,
      :host ::ng-deep .hljs-function .hljs-title {
        color: var(--color-ink);
        font-weight: 600;
      }
      :host ::ng-deep .hljs-variable,
      :host ::ng-deep .hljs-template-variable,
      :host ::ng-deep .hljs-attribute {
        color: var(--color-ink);
      }
      :host ::ng-deep .hljs-tag {
        color: var(--color-accent-cool);
      }
      :host ::ng-deep .hljs-deletion {
        color: var(--color-destructive);
      }
      :host ::ng-deep .hljs-addition {
        color: var(--color-accent-warm);
      }
    `,
  ],
})
export class PiCodePreviewComponent {
  readonly code = input.required<string>();
  readonly language = input<CodeLanguage>('html');
  readonly ariaLabel = input<string>('Source code preview');
  readonly showLineNumbers = input<boolean>(true);
  readonly showCaption = input<boolean>(true);
  readonly fileName = input<string | null>(null);
  /** Optional override for the figcaption eyebrow. Falls back to `language()`
   *  when empty string OR null/undefined is passed. */
  readonly captionTitle = input<string | null>(null);

  protected readonly highlightedCode = computed(() => {
    const lang = this.language();
    if (hljs.getLanguage(lang)) {
      return hljs.highlight(this.code(), {
        language: lang,
        ignoreIllegals: true,
      }).value;
    }
    // Fallback: escape HTML so raw text is safe to bind via [innerHTML]
    return this.escapeHtml(this.code());
  });

  protected readonly lineNumbers = computed(() => {
    const lines = this.code().split('\n').length;
    return Array.from({ length: lines }, (_, i) => i + 1);
  });

  private escapeHtml(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
