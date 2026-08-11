import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Copy, Check } from 'lucide-angular';

import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import type { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { PiDialogComponent } from '../../shared/ui/dialog/pi-dialog.component';
import { PiToastService } from '../../shared/ui/toast/pi-toast.service';
import { DESKTOP_DOWNLOAD_URL } from '../../core/desktop-download-url';
import { extractErrorMessage } from '../../core/silent-http';
import {
  DesktopPairingService,
  type DesktopPairingKeyMeta,
  type DesktopPairingTtl,
} from '../../shared/services/pi-desktop-pairing.service';
import { ButtonComponent } from '../../shared/ui/button/button.component';

const DESKTOP_INSTALLER_UNAVAILABLE_HINT = 'Установщик скоро будет на сервере';

export interface PairingDialogData {
  apiBaseUrl: string;
  username: string;
}

function normalizeDownloadUrl(value: string): string {
  return value.trim();
}

function openDownload(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * TZD-21: issue desktop pairing key (TTL) + copy packet + list/revoke.
 * Does NOT embed session access JWT.
 */
@Component({
  selector: 'app-pairing-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, PiDialogComponent, FormsModule, ButtonComponent],
  template: `
    <app-pi-dialog
      title="Подключить десктоп"
      [variant]="'content'"
      [width]="'lg'"
      (userClose)="onClose()"
    >
      <div body class="space-y-5">
        <p class="text-sm text-muted-foreground leading-relaxed m-0">
          Выпустите ключ для Desktop / MCP. Новый ключ <strong>не отключает</strong> старые.
          Отозванный — сразу недействителен.
          <strong>Не передавайте пакет третьим лицам.</strong>
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3" data-test="pairing-issue-form">
          <label class="block">
            <span class="eyebrow block mb-1">Срок действия</span>
            <select class="pi-input w-full" [(ngModel)]="ttl" name="ttl" data-test="pairing-ttl">
              <option value="1d">1 день</option>
              <option value="7d">7 дней</option>
              <option value="30d">30 дней</option>
              <option value="90d">90 дней</option>
              <option value="never">Без срока</option>
            </select>
          </label>
          <label class="block">
            <span class="eyebrow block mb-1">Метка (опц.)</span>
            <input
              class="pi-input w-full"
              type="text"
              [(ngModel)]="label"
              name="label"
              maxlength="64"
              placeholder="Office PC"
              data-test="pairing-label"
            />
          </label>
        </div>

        @if (ttl === 'never') {
          <p class="text-xs text-sunrise-warm m-0" role="status" data-test="pairing-never-warn">
            Без срока: отзовите ключ вручную при увольнении или утере ПК.
          </p>
        }

        <div class="flex flex-wrap items-center gap-3">
          <app-pi-button
            variant="default"
            type="button"
            [disabled]="issuing()"
            (click)="onIssue()"
            data-test="pairing-issue-button"
          >
            {{ issuing() ? 'Выпуск…' : 'Выпустить ключ' }}
          </app-pi-button>
          <app-pi-button
            variant="secondary"
            type="button"
            [disabled]="!pairingJson()"
            (click)="onCopy()"
            data-test="pairing-copy-button"
            [attr.aria-label]="copied() ? 'Скопировано' : 'Скопировать пакет в буфер'"
          >
            <span class="inline-flex items-center gap-2">
              <lucide-angular
                [img]="copied() ? checkIcon : copyIcon"
                [size]="14"
                aria-hidden="true"
              />
              {{ copied() ? 'Скопировано' : 'Скопировать' }}
            </span>
          </app-pi-button>
          @if (copied()) {
            <span class="text-xs text-muted-foreground" role="status">✓ в буфере</span>
          }
        </div>

        @if (pairingJson()) {
          <div class="space-y-2">
            <p class="eyebrow m-0">Пакет паринга</p>
            <pre
              class="bg-paper-2 rounded-sm p-4 text-xs font-mono text-ink leading-relaxed
                     overflow-x-auto max-h-48 overflow-y-auto hairline
                     whitespace-pre select-all"
              [attr.aria-label]="'JSON-пакет паринга'"
              data-test="pairing-json-block"
              >{{ pairingJson() }}</pre>
            @if (copyError()) {
              <p class="text-xs text-destructive" role="alert" data-test="pairing-copy-error">
                {{ copyError() }}
              </p>
            }
          </div>
        }

        <div class="space-y-2" data-test="pairing-keys-list">
          <p class="eyebrow m-0">Ваши ключи</p>
          @if (keys().length === 0) {
            <p class="text-sm text-muted-foreground m-0">Пока нет выпущенных ключей.</p>
          } @else {
            <ul class="m-0 p-0 list-none space-y-2">
              @for (k of keys(); track k.id) {
                <li
                  class="hairline rounded-sm px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-sm"
                  [attr.data-test]="'pairing-key-' + k.id"
                >
                  <div class="min-w-0">
                    <span class="font-medium">{{ k.label }}</span>
                    <span class="ml-2 font-mono text-xs text-muted-foreground"
                      >{{ k.tokenPrefix }}…</span
                    >
                    <span class="block text-xs text-muted-foreground">
                      @if (!k.expiresAt) {
                        без срока
                      } @else {
                        до {{ formatDate(k.expiresAt) }}
                      }
                    </span>
                  </div>
                  <button
                    type="button"
                    class="text-xs text-destructive hover:underline"
                    (click)="onRevoke(k)"
                    data-test="pairing-revoke"
                  >
                    Отозвать
                  </button>
                </li>
              }
            </ul>
          }
        </div>
      </div>

      <div footer class="flex justify-between items-center w-full gap-3">
        <div class="flex flex-col gap-1 min-w-0">
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
export class PairingDialogComponent implements OnInit {
  protected readonly copyIcon = Copy;
  protected readonly checkIcon = Check;

  private readonly data = inject(PI_DIALOG_DATA) as PairingDialogData | string;
  private readonly ref = inject<DialogRef<void>>(PI_DIALOG_REF);
  private readonly toast = inject(PiToastService);
  private readonly pairingApi = inject(DesktopPairingService);
  private readonly configuredDownloadUrl = inject(DESKTOP_DOWNLOAD_URL);

  protected readonly downloadUrl = normalizeDownloadUrl(this.configuredDownloadUrl);
  protected readonly installerUnavailableHint = DESKTOP_INSTALLER_UNAVAILABLE_HINT;
  protected readonly pairingJson = signal<string>('');
  protected readonly copied = signal(false);
  protected readonly copyError = signal<string | null>(null);
  protected readonly issuing = signal(false);
  protected readonly keys = signal<DesktopPairingKeyMeta[]>([]);

  protected ttl: DesktopPairingTtl = '30d';
  protected label = '';

  ngOnInit(): void {
    this.reloadKeys();
  }

  protected onIssue(): void {
    const ctx = this.ctx();
    if (!ctx) {
      this.toast.error('Нет данных паринга — закройте диалог и откройте снова.');
      return;
    }
    this.issuing.set(true);
    this.pairingApi
      .issue({
        ttl: this.ttl,
        label: this.label.trim() || undefined,
        apiBaseUrl: ctx.apiBaseUrl,
      })
      .subscribe((res) => {
        this.issuing.set(false);
        if (!res.ok) {
          this.toast.error(extractErrorMessage(res.error));
          return;
        }
        this.pairingJson.set(JSON.stringify(res.data.pairing, null, 2));
        this.copied.set(false);
        this.toast.success('Ключ выпущен');
        this.reloadKeys();
      });
  }

  protected onRevoke(k: DesktopPairingKeyMeta): void {
    this.pairingApi.revoke(k.id).subscribe((res) => {
      if (!res.ok) {
        this.toast.error(extractErrorMessage(res.error));
        return;
      }
      this.toast.success('Ключ отозван и удалён из списка');
      this.reloadKeys();
    });
  }

  protected formatDate(iso: string): string {
    return new Date(iso).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  protected onCopy(): void {
    const json = this.pairingJson();
    if (!json) {
      this.copyError.set('Сначала выпустите ключ.');
      return;
    }
    this.copyError.set(null);

    if (typeof navigator?.clipboard?.writeText !== 'function') {
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

  private ctx(): PairingDialogData | null {
    if (typeof this.data === 'string') {
      // Legacy: raw JSON string — no longer used for issue; keep username/base from parse if needed
      return null;
    }
    if (this.data?.apiBaseUrl && this.data?.username) return this.data;
    return null;
  }

  private reloadKeys(): void {
    this.pairingApi.list().subscribe((res) => {
      if (res.ok) this.keys.set(res.data);
    });
  }
}
