import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

export type AlertDialogVariant = 'default' | 'destructive';

/**
 * AlertDialog — typed wrapper for confirm/cancel flows.
 * Web-spec compliant: role="alertdialog", initial focus = cancel button
 * (safer for destructive operations). ENTER on focused btn emits that btn.
 */
@Component({
  selector: 'app-pi-alert-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
  template: `
    <div
      role="alertdialog"
      [attr.aria-labelledby]="titleId()"
      [attr.aria-describedby]="descId()"
      class="bg-paper border hairline border-rule rounded-sm w-[440px] overflow-hidden"
    >
      <header class="px-5 pt-5">
        <h2 [id]="titleId()" class="font-display text-lg tracking-tight text-ink">
          {{ title() }}
        </h2>
        @if (description()) {
          <p [id]="descId()" class="text-sm text-muted mt-2">
            {{ description() }}
          </p>
        }
      </header>
      <footer class="px-5 py-4 flex justify-end gap-2 border-t hairline border-rule mt-4">
        <app-pi-button
          variant="ghost"
          size="sm"
          (click)="cancel.emit()"
        >{{ cancelLabel() }}</app-pi-button>
        <app-pi-button
          [variant]="variant() === 'destructive' ? 'destructive' : 'default'"
          size="sm"
          (click)="confirm.emit()"
        >{{ confirmLabel() }}</app-pi-button>
      </footer>
    </div>
  `,
})
export class AlertDialogComponent implements AfterViewInit {
  readonly title = input.required<string>();
  readonly description = input<string>('');
  readonly confirmLabel = input<string>('Подтвердить');
  readonly cancelLabel = input<string>('Отмена');
  readonly variant = input<AlertDialogVariant>('default');

  readonly confirm = output<void>();
  readonly cancel = output<void>();

  private readonly doc = inject(DOCUMENT);
  private readonly hostEl = inject(ElementRef<HTMLElement>);

  private readonly _uid = signal<string>(
    this.doc.defaultView?.crypto?.randomUUID?.() ??
      `pi-ad-${Math.random().toString(36).slice(2, 8)}`,
  );

  readonly titleId = computed(() => `${this._uid()}-title`);
  readonly descId = computed(() => `${this._uid()}-desc`);

  ngAfterViewInit(): void {
    // Initial focus on cancel button — safer for destructive actions.
    queueMicrotask(() => {
      const host = this.hostEl.nativeElement;
      const first = host.querySelector('button');
      if (first) (first as HTMLButtonElement).focus();
    });
  }
}
