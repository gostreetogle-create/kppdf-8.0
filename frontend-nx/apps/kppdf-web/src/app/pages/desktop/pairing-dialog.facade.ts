/**
 * TZ-NX-DESKTOP-PAIRING-FACADE — domain facade for `PairingDialogComponent`.
 *
 * Owns: key issue/revoke/list, compat lookup, download-URL/version
 * resolution, and clipboard copy — moved as-is from the dialog. No
 * pairing/API rule change.
 *
 * Unlike `RegistryDetailPanelFacade`, this dialog has no `input.required<T>()`
 * — `PI_DIALOG_DATA`/`PI_DIALOG_REF` are real DI tokens, injectable directly
 * in the facade's own constructor, so no `bind(host)` indirection is needed.
 */
import { Injectable, inject, signal } from '@angular/core';
import {
  DESKTOP_DOWNLOAD_URL,
  PiDesktopPairingService,
  type DesktopCompatInfo,
  type DesktopPairingKeyMeta,
  type DesktopPairingTtl,
} from '@kppdf/data-access';
import { extractErrorMessage } from '@kppdf/util-http';
import { PI_DIALOG_DATA, PI_DIALOG_REF, type DialogRef } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';

export const DESKTOP_INSTALLER_UNAVAILABLE_HINT = 'Установщик скоро будет на сервере';
export const DESKTOP_DOWNLOAD_LABEL = 'Скачать Desktop';
/** TZD-59 (legacy): shown instead of a meaningless version placeholder when compat lookup failed. */
export const DESKTOP_COMPAT_UNAVAILABLE_HINT = 'Не удалось проверить версию';

export type DesktopCompatStatus = 'loading' | 'ready' | 'error';

export interface PairingDialogData {
  readonly apiBaseUrl: string;
  readonly username: string;
}

function normalizeDownloadUrl(value: string): string {
  return value.trim();
}

function parseSemverFromDownloadUrl(url: string): string | null {
  const match = url.match(/-v(\d+\.\d+\.\d+)/i);
  return match?.[1] ?? null;
}

function formatVersionLabel(version: string): string {
  const trimmed = version.trim();
  return trimmed.startsWith('v') ? trimmed : `v${trimmed}`;
}

function looksLikeBuildDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}/.test(value) || /^\d{8}$/.test(value);
}

function openDownload(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}

@Injectable()
export class PairingDialogFacade {
  private readonly data = inject<PairingDialogData>(PI_DIALOG_DATA);
  private readonly ref = inject<DialogRef<void>>(PI_DIALOG_REF);
  private readonly toast = inject(PiToastService);
  private readonly pairingApi = inject(PiDesktopPairingService);
  private readonly configuredDownloadUrlInjected = inject(DESKTOP_DOWNLOAD_URL);

  readonly configuredDownloadUrl = normalizeDownloadUrl(this.configuredDownloadUrlInjected);
  readonly installerUnavailableHint = DESKTOP_INSTALLER_UNAVAILABLE_HINT;
  readonly pairingJson = signal<string>('');
  readonly copied = signal(false);
  readonly copyError = signal<string | null>(null);
  readonly issuing = signal(false);
  readonly keys = signal<DesktopPairingKeyMeta[]>([]);
  readonly compat = signal<DesktopCompatInfo | null>(null);
  readonly compatStatus = signal<DesktopCompatStatus>('loading');

  ttl: DesktopPairingTtl = '30d';
  label = '';

  init(): void {
    this.reloadKeys();
    this.reloadCompat();
  }

  onIssue(): void {
    this.issuing.set(true);
    this.pairingApi
      .issue({
        ttl: this.ttl,
        label: this.label.trim() || undefined,
        apiBaseUrl: this.data.apiBaseUrl,
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

  onRevoke(k: DesktopPairingKeyMeta): void {
    this.pairingApi.revoke(k.id).subscribe((res) => {
      if (!res.ok) {
        this.toast.error(extractErrorMessage(res.error));
        return;
      }
      this.toast.success('Ключ отозван и удалён из списка');
      this.reloadKeys();
    });
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  onCopy(): void {
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

  effectiveDownloadUrl(): string {
    const compatUrl = normalizeDownloadUrl(this.compat()?.downloadUrl ?? '');
    if (compatUrl) return compatUrl;
    return this.configuredDownloadUrl;
  }

  /** Empty string when the version is genuinely unknown — never a literal `v?` placeholder. */
  desktopVersionLabel(): string {
    const fromUrl = parseSemverFromDownloadUrl(this.effectiveDownloadUrl());
    if (fromUrl) return formatVersionLabel(fromUrl);
    const recommended = this.compat()?.recommendedDesktopVersion?.trim();
    if (recommended) return formatVersionLabel(recommended);
    return '';
  }

  downloadButtonLabel(): string {
    const version = this.desktopVersionLabel();
    return version ? `${DESKTOP_DOWNLOAD_LABEL} ${version}` : DESKTOP_DOWNLOAD_LABEL;
  }

  versionSubtitle(): string | null {
    if (this.compatStatus() === 'error') return DESKTOP_COMPAT_UNAVAILABLE_HINT;
    const c = this.compat();
    if (!c) return null;
    const min = formatVersionLabel(c.minDesktopVersion);
    const buildId = c.serverBuildId?.trim();
    if (buildId && looksLikeBuildDate(buildId)) {
      return `Актуальная сборка · мин. ${min} · от ${buildId}`;
    }
    return `Актуальная сборка · мин. ${min}`;
  }

  onDownload(): void {
    const url = this.effectiveDownloadUrl();
    if (url) {
      openDownload(url);
    }
  }

  onClose(): void {
    this.ref.close();
  }

  private reloadKeys(): void {
    this.pairingApi.list().subscribe((res) => {
      if (res.ok) this.keys.set(res.data);
    });
  }

  private reloadCompat(): void {
    this.compatStatus.set('loading');
    this.pairingApi.compat().subscribe({
      next: (res) => {
        if (res.ok) {
          this.compat.set(res.data);
          this.compatStatus.set('ready');
          return;
        }
        this.compat.set(null);
        this.compatStatus.set('error');
      },
      error: () => {
        this.compat.set(null);
        this.compatStatus.set('error');
      },
    });
  }
}
