import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * Coerce an unknown error payload into the shape the banner template expects.
 *
 * - `null | undefined` → null (banner hidden)
 * - `string` → `{ message: string }`
 * - `{ message, canRetry? }` → passed through (boolean canRetry preserved)
 * - `Error` instance → `{ message: error.message }`
 * - HttpErrorResponse-like (`{ error: { message } }` or `{ error: string }`)
 *   → message extracted from nested `.error`
 * - everything else → `{ message: String(raw) }`
 */
export function toBannerError(raw: unknown): { message: string; canRetry?: boolean } | null {
  if (raw === null || raw === undefined) return null;

  if (typeof raw === 'string') return { message: raw };

  if (typeof raw === 'object' && raw !== null && 'message' in raw) {
    const obj = raw as { message: unknown; canRetry?: unknown };
    // Already the right shape — pass through (coerce message to string just in case).
    if (
      typeof obj.message === 'string' &&
      (obj.canRetry === undefined || typeof obj.canRetry === 'boolean')
    ) {
      return { message: obj.message, canRetry: obj.canRetry };
    }
    return {
      message: typeof obj.message === 'string' ? obj.message : String(obj.message ?? ''),
      canRetry: typeof obj.canRetry === 'boolean' ? obj.canRetry : undefined,
    };
  }

  if (raw instanceof Error) return { message: raw.message };

  // HttpErrorResponse-like: { error: { message } } or { error: 'string' }
  if (typeof raw === 'object' && raw !== null && 'error' in raw) {
    const err = (raw as { error: unknown }).error;
    if (typeof err === 'object' && err !== null && 'message' in err) {
      return { message: String((err as { message: unknown }).message ?? '') };
    }
    if (typeof err === 'string') return { message: err };
  }

  return { message: String(raw) };
}

@Component({
  selector: 'app-error-banner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (error(); as e) {
      <div
        role="alert"
        aria-live="polite"
        class="mb-6 border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive flex items-start gap-3"
      >
        <span class="shrink-0 mt-0.5">⚠</span>
        <span class="flex-1">{{ e.message }}</span>
        @if (e.canRetry) {
          <button
            type="button"
            class="text-xs underline underline-offset-2 hover:text-destructive/80 shrink-0"
            (click)="retry.emit()"
          >
            Повторить
          </button>
        }
      </div>
    }
  `,
})
export class ErrorBannerComponent {
  /** Accepts string | {message, canRetry?} | null; coerced via toBannerError. */
  readonly error = input<
    { message: string; canRetry?: boolean } | null,
    string | { message: string; canRetry?: boolean } | null
  >(null, { transform: toBannerError });
  readonly retry = output<void>();
}
