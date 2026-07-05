import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * PiCodePreviewComponent — TZ-78 (FALLBACK: no highlight.js).
 *
 * **Spec deviation #1:** highlight.js was the spec default, but
 * `pnpm add highlight.js@^11` failed with `ERR_PNPM_PUBLIC_HOIST_PATTERN_DIFF`
 * (same pnpm config blocker that affected TZ-66 charts ngx-charts install).
 * Fallback: plain monospace `<pre><code>` rendering with optional
 * line numbers. Paper & Ink theme via monospace font + paper-2 background.
 *
 * Future TZ-78b: re-attempt install after pnpm config reconcile
 * (`pnpm install` then `pnpm add highlight.js`). For now this works
 * for showing source code without syntax coloring.
 */
@Component({
  selector: 'app-pi-code-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <pre
      class="bg-paper-2 border-t hairline border-rule p-4 overflow-auto mono text-[12px] leading-relaxed text-ink"
      [attr.aria-label]="ariaLabel()"
    ><code class="block whitespace-pre">{{ formattedCode() }}</code></pre>
  `,
})
export class PiCodePreviewComponent {
  readonly code = input.required<string>();
  readonly language = input<'html' | 'typescript' | 'css' | 'bash' | 'json'>('html');
  readonly ariaLabel = input<string>('Source code preview');
  readonly showLineNumbers = input<boolean>(true);

  protected readonly formattedCode = computed(() => {
    const c = this.code();
    if (!this.showLineNumbers()) return c;
    return c
      .split('\n')
      .map((line, i) => `${String(i + 1).padStart(3, ' ')}  ${line}`)
      .join('\n');
  });
}
