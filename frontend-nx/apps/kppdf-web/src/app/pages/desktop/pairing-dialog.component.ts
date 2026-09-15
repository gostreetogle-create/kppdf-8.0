import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Copy, Check } from 'lucide-angular';
import type { DesktopPairingKeyMeta } from '@kppdf/data-access';
import { ButtonComponent } from '@kppdf/ui/button';
import { PiDialogComponent } from '@kppdf/ui/dialog';
import { PairingDialogFacade } from './pairing-dialog.facade';
export type { PairingDialogData } from './pairing-dialog.facade';

/**
 * TZD-72 — NX port of `frontend/src/app/pages/desktop/pairing-dialog.component.ts`.
 * TZD-21: issue desktop pairing key (TTL) + copy packet + list/revoke.
 * Does NOT embed session access JWT. Reached only via the AppShell button,
 * which renders only for `caps.hasAny(['desktop:admin'])`.
 *
 * TZ-NX-DESKTOP-PAIRING-FACADE — issue/revoke/list/compat/copy orchestration
 * moved to `PairingDialogFacade`; this component stays a thin host.
 */
@Component({
  selector: 'app-pairing-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PairingDialogFacade],
  imports: [LucideAngularModule, PiDialogComponent, FormsModule, ButtonComponent],
  template: `
    <app-pi-dialog
      title="Подключить десктоп"
      variant="content"
      width="lg"
      [showClose]="true"
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
              placeholder="Офисный ПК"
              data-test="pairing-label"
            />
          </label>
        </div>

        @if (ttl === 'never') {
          <p class="text-xs text-sunrise-warm m-0" role="status" data-test="pairing-never-warn">
            Без срока: отзовите ключ вручную при увольнении или утере ПК.
          </p>
        }

        <div class="flex flex-wrap items-start justify-between gap-3" data-test="pairing-toolbar">
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
          <div class="flex flex-col items-end gap-1 min-w-0">
            <app-pi-button
              variant="secondary"
              type="button"
              [disabled]="!effectiveDownloadUrl()"
              (click)="onDownload()"
              data-test="pairing-download-button"
              [attr.aria-label]="
                effectiveDownloadUrl() ? downloadButtonLabel() : installerUnavailableHint
              "
            >
              {{ downloadButtonLabel() }}
            </app-pi-button>
            @if (versionSubtitle(); as subtitle) {
              <span
                class="text-xs text-muted-foreground text-right"
                data-test="pairing-compat-hint"
              >
                {{ subtitle }}
              </span>
            }
            @if (!effectiveDownloadUrl()) {
              <span
                class="text-xs text-muted-foreground text-right"
                data-test="pairing-download-hint"
              >
                {{ installerUnavailableHint }}
              </span>
            }
          </div>
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
              >{{ pairingJson() }}</pre
            >
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

      <div footer class="flex justify-end w-full">
        <app-pi-button
          variant="outline"
          type="button"
          (click)="onClose()"
          data-test="pairing-close-button"
        >
          Закрыть
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class PairingDialogComponent implements OnInit {
  protected readonly copyIcon = Copy;
  protected readonly checkIcon = Check;

  protected readonly facade = inject(PairingDialogFacade);

  protected readonly installerUnavailableHint = this.facade.installerUnavailableHint;
  protected readonly pairingJson = this.facade.pairingJson;
  protected readonly copied = this.facade.copied;
  protected readonly copyError = this.facade.copyError;
  protected readonly issuing = this.facade.issuing;
  protected readonly keys = this.facade.keys;

  protected get ttl() {
    return this.facade.ttl;
  }
  protected set ttl(value) {
    this.facade.ttl = value;
  }

  protected get label() {
    return this.facade.label;
  }
  protected set label(value) {
    this.facade.label = value;
  }

  ngOnInit(): void {
    this.facade.init();
  }

  protected onIssue(): void {
    this.facade.onIssue();
  }

  protected onRevoke(k: DesktopPairingKeyMeta): void {
    this.facade.onRevoke(k);
  }

  protected formatDate(iso: string): string {
    return this.facade.formatDate(iso);
  }

  protected onCopy(): void {
    this.facade.onCopy();
  }

  protected effectiveDownloadUrl(): string {
    return this.facade.effectiveDownloadUrl();
  }

  protected downloadButtonLabel(): string {
    return this.facade.downloadButtonLabel();
  }

  protected versionSubtitle(): string | null {
    return this.facade.versionSubtitle();
  }

  protected onDownload(): void {
    this.facade.onDownload();
  }

  protected onClose(): void {
    this.facade.onClose();
  }
}
