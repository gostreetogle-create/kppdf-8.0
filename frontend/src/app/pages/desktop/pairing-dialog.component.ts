import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { LucideAngularModule, Copy, Check } from 'lucide-angular';

import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import type { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { PiDialogComponent } from '../../shared/ui/dialog/pi-dialog.component';
import { PiToastService } from '../../shared/ui/toast/pi-toast.service';
import { DESKTOP_DOWNLOAD_URL } from '../../core/desktop-download-url';

const DESKTOP_INSTALLER_UNAVAILABLE_HINT = 'Установщик скоро будет на сервере';

function normalizeDownloadUrl(value: string): string {
  return value.trim();
}

function openDownload(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * TZD-05: pairing-dialog — shows the JSON pairing packet for desktop connection.
 *
 * Opened via PiDialogService.open(PairingDialogComponent, { data: pairingJsonString }).
 * Displays a read-only monospace JSON block + Copy (clipboard) + Close.
 *
 * Design:
 *  - variant="content" (T3): wide dialog, scrollable body, sticky footer.
 *  - Uses lucide Monitor icon for the header.
 *  - Copy → navigator.clipboard.writeText → toast "Скопировано".
 *  - Close emits no result.
 */
@Component({
  selector: 'app-pairing-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, PiDialogComponent],
  template: `
    <app-pi-dialog
      title="Подключить десктоп"
      [variant]="'content'"
      [width]="'lg'"
      (userClose)="onClose()"
    >
      <div body class="space-y-4">
        <p class="text-sm text-muted-foreground leading-relaxed">
          Скопируйте этот JSON и вставьте в десктоп-компаньон KPPDF. Пакет содержит URL сервера,
          токен доступа и срок действия.
          <strong>Не передавайте этот пакет третьим лицам.</strong>
        </p>

        <!-- read-only JSON block -->
        <div class="relative">
          <pre
            class="bg-paper-2 rounded-sm p-4 text-xs font-mono text-ink leading-relaxed
                   overflow-x-auto max-h-64 overflow-y-auto hairline
                   whitespace-pre select-all"
            [attr.aria-label]="'JSON-пакет паринга'"
            data-test="pairing-json-block"
            >{{ pairingJson() }}</pre>
        </div>

        @if (copyError()) {
          <p class="text-xs text-destructive" role="alert" data-test="pairing-copy-error">
            {{ copyError() }}
          </p>
        }
      </div>

      <div footer class="flex justify-between items-center w-full gap-3">
        <div class="flex flex-col gap-1 min-w-0">
          <span class="text-xs text-muted-foreground">
            {{ copied() ? '✓ Скопировано' : '' }}
          </span>
          @if (!downloadUrl) {
            <span class="text-xs text-muted-foreground" data-test="pairing-download-hint">
              {{ installerUnavailableHint }}
            </span>
          }
        </div>
        <div class="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            class="pi-btn pi-btn-outline pi-focus-ring"
            [disabled]="!downloadUrl"
            [attr.aria-label]="downloadUrl ? 'Скачать приложение' : installerUnavailableHint"
            (click)="onDownload()"
            data-test="pairing-download-button"
          >
            Скачать приложение
          </button>
          <button
            type="button"
            class="pi-btn pi-btn-ink pi-focus-ring flex items-center gap-2"
            [attr.aria-label]="copied() ? 'Скопировано' : 'Скопировать в буфер обмена'"
            (click)="onCopy()"
            data-test="pairing-copy-button"
          >
            <lucide-angular
              [img]="copied() ? checkIcon : copyIcon"
              [size]="14"
              aria-hidden="true"
            />
            {{ copied() ? 'Скопировано' : 'Скопировать' }}
          </button>
          <button
            type="button"
            class="pi-btn pi-btn-outline pi-focus-ring"
            (click)="onClose()"
            data-test="pairing-close-button"
          >
            Закрыть
          </button>
        </div>
      </div>
    </app-pi-dialog>
  `,
})
export class PairingDialogComponent {
  protected readonly copyIcon = Copy;
  protected readonly checkIcon = Check;

  private readonly data: string = inject(PI_DIALOG_DATA) as string;
  private readonly ref = inject<DialogRef<void>>(PI_DIALOG_REF);
  private readonly toast = inject(PiToastService);
  private readonly configuredDownloadUrl = inject(DESKTOP_DOWNLOAD_URL);

  protected readonly downloadUrl = normalizeDownloadUrl(this.configuredDownloadUrl);
  protected readonly installerUnavailableHint = DESKTOP_INSTALLER_UNAVAILABLE_HINT;
  protected readonly pairingJson = signal<string>(this.data ?? '{}');
  protected readonly copied = signal(false);
  protected readonly copyError = signal<string | null>(null);

  protected onCopy(): void {
    const json = this.pairingJson();
    if (!json || json === '{}') {
      this.copyError.set('Нет данных для копирования.');
      return;
    }
    this.copyError.set(null);

    if (typeof navigator?.clipboard?.writeText !== 'function') {
      // Fallback: legacy execCommand (HTTP-only or older browsers)
      try {
        const ta = document.createElement('textarea');
        ta.value = json;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        this.copied.set(true);
        this.toast.success('Скопировано в буфер обмена');
        return;
      } catch {
        this.copyError.set(
          'Не удалось скопировать. Выделите текст вручную (Ctrl+A) и нажмите Ctrl+C.',
        );
        return;
      }
    }

    navigator.clipboard
      .writeText(json)
      .then(() => {
        this.copied.set(true);
        this.toast.success('Скопировано в буфер обмена');
      })
      .catch(() => {
        this.copyError.set(
          'Не удалось скопировать. Выделите текст вручную (Ctrl+A) и нажмите Ctrl+C.',
        );
      });
  }

  protected onDownload(): void {
    if (this.downloadUrl) {
      openDownload(this.downloadUrl);
    }
  }

  protected onClose(): void {
    this.ref.close();
  }
}
