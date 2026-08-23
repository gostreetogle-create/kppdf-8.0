import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse, httpResource } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, FileUp, Monitor, Inbox } from 'lucide-angular';

import { PiDialogService } from '../../../../shared/ui/dialog/pi-dialog.service';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { API_BASE_URL } from '../../../../core/api.tokens';
import { AuthService } from '../../../../core/auth.service';
import { DesktopPairingService } from '../../../../shared/services/pi-desktop-pairing.service';
import { PairingDialogComponent } from '../../../desktop/pairing-dialog.component';
import { extractErrorMessage } from '../../../../core/silent-http';

interface ImportTodoListResponse {
  items: Array<{ status: 'open' | 'done' }>;
}

/**
 * TZ-KP-WS-406 — template panel section «Из файла (AI)».
 *
 * Explains the Desktop+MCP path (MVP: file content is NOT auto-converted to
 * blocks — the human finishes the draft in the workspace/builder). CTA logic:
 *  - paired (desktop pairing key exists) → «Создать черновик шаблона»
 *    deep-links to /import-todos instructions;
 *  - not paired → CTA «Подключить десктоп» reuses the global pairing dialog.
 * Pending import-todos badge links to /import-todos.
 */
@Component({
  selector: 'app-workspace-ai-draft',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, RouterLink, LucideAngularModule],
  template: `
    <div class="kp-ws-ai-draft" data-test="kp-ws-ai-draft">
      <div class="kp-ws-ai-draft__head">
        <lucide-angular [img]="fileUpIcon" [size]="16" aria-hidden="true" />
        <h4>Из файла (AI)</h4>
      </div>
      <p class="kp-ws-ai-draft__text">
        Черновик шаблона создаёт агент Desktop-приложения (MCP) из файла; вы доводите его здесь или
        в конструкторе. Контент файла не конвертируется автоматически.
      </p>

      @if (paired() === false) {
        <app-pi-button
          variant="outline"
          size="sm"
          (click)="openPairing()"
          data-test="kp-ws-ai-pairing-cta"
        >
          <lucide-angular [img]="monitorIcon" [size]="14" aria-hidden="true" /> Подключить десктоп
        </app-pi-button>
      } @else {
        <a class="kp-ws-ai-draft__link" routerLink="/import-todos" data-test="kp-ws-ai-create-cta">
          <lucide-angular [img]="fileUpIcon" [size]="14" aria-hidden="true" />
          Создать черновик шаблона
        </a>
      }

      <a class="kp-ws-ai-draft__badge" routerLink="/import-todos" data-test="kp-ws-ai-todos-badge">
        <lucide-angular [img]="inboxIcon" [size]="14" aria-hidden="true" />
        <span>{{ pendingLabel() }}</span>
      </a>
    </div>
  `,
  styles: `
    :host {
      display: block;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--color-rule);
    }
    .kp-ws-ai-draft {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .kp-ws-ai-draft__head {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .kp-ws-ai-draft__head h4 {
      margin: 0;
      font-size: 0.85rem;
    }
    .kp-ws-ai-draft__text {
      margin: 0;
      font-size: 0.75rem;
      line-height: 1.4;
      color: var(--color-muted-foreground, #6b7280);
    }
    .kp-ws-ai-draft__link {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      align-self: flex-start;
      font-size: 0.8rem;
      color: var(--color-ink);
      text-decoration: none;
      border: 1px solid var(--color-rule);
      border-radius: 0.375rem;
      padding: 0.35rem 0.6rem;
    }
    .kp-ws-ai-draft__link:hover {
      border-color: var(--color-ink);
    }
    .kp-ws-ai-draft__badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      align-self: flex-start;
      font-size: 0.75rem;
      color: var(--color-muted-foreground, #6b7280);
      text-decoration: none;
    }
    .kp-ws-ai-draft__badge:hover {
      color: var(--color-ink);
    }
  `,
})
export class ProposalWorkspaceAiDraftComponent {
  protected readonly fileUpIcon = FileUp;
  protected readonly monitorIcon = Monitor;
  protected readonly inboxIcon = Inbox;

  private readonly pairingApi = inject(DesktopPairingService);
  private readonly dialog = inject(PiDialogService);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly auth = inject(AuthService);

  /** null = unknown (still loading), true/false = resolved. */
  protected readonly paired = signal<boolean | null>(null);
  protected readonly pairingError = signal<string | null>(null);

  protected readonly todosRes = httpResource<ImportTodoListResponse>(() => ({
    url: `${this.baseUrl}/import-todos`,
  }));

  protected readonly pendingCount = computed(() => {
    const err = this.todosRes.error() as HttpErrorResponse | undefined;
    if (err) return 0;
    return (this.todosRes.value()?.items ?? []).filter((t) => t.status === 'open').length;
  });

  protected readonly pendingLabel = computed(() => {
    const count = this.pendingCount();
    const base = count > 0 ? `${count} задание(й) на импорт` : 'Заданий на импорт нет';
    return `${base} · открыть /import-todos`;
  });

  constructor() {
    this.pairingApi.list().subscribe((res) => {
      if (!res.ok) {
        this.pairingError.set(extractErrorMessage(res.error));
        this.paired.set(false);
        return;
      }
      const active = (res.data ?? []).some((k) => !k.revokedAt);
      this.paired.set(active);
    });
  }

  /** TZD-21: reuse the global pairing dialog (same contract as app layout). */
  protected openPairing(): void {
    const user = this.auth.user();
    if (!user?.username) {
      this.pairingError.set('Профиль пользователя ещё не загружен — попробуйте позже.');
      return;
    }
    this.dialog.open(PairingDialogComponent, {
      data: {
        apiBaseUrl: this.resolveApiBaseUrl(),
        username: user.username,
      },
      width: 'lg',
      ariaLabel: 'Паринг десктопа',
    });
  }

  private resolveApiBaseUrl(): string {
    const token = this.baseUrl;
    if (/^https?:\/\//.test(token)) {
      try {
        return new URL(token).origin;
      } catch {
        // fall through
      }
    }
    return window.location.origin;
  }
}
