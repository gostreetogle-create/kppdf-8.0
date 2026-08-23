import { Injectable, computed, signal } from '@angular/core';

import type { WsOrientation } from './proposal-workspace-shell.component';

/** Left rail sections (IA: docs/pages/kp-workspace-rail-ia.md). */
export type WsLeftSection = 'template' | 'catalog' | 'recipient';
/** Right rail sections. Output stays here until ribbon migration (TZ-404+). */
export type WsRightSection = 'params' | 'table' | 'terms' | 'output';
export type WsSection = WsLeftSection | WsRightSection;

const LEFT: readonly WsLeftSection[] = ['template', 'catalog', 'recipient'];

const SECTION_TITLES: Record<WsSection, string> = {
  template: 'Шаблон',
  catalog: 'Каталог',
  recipient: 'Клиент',
  params: 'Параметры',
  table: 'Редактор таблицы',
  terms: 'Условия',
  output: 'Вывод',
};

function isLeft(section: WsSection): section is WsLeftSection {
  return (LEFT as readonly string[]).includes(section);
}

/**
 * TZ-KP-WS-402 — workspace UI state machine (provided per page).
 *
 * Panel model mirrors the demo/shell toggle: one active section at a time
 * (left xor right), `panelOpen` controls the 480px overlay; A4 is untouched.
 * Chrome-rail registration is done by the page from these signals.
 */
@Injectable()
export class ProposalWorkspaceStore {
  readonly activeLeft = signal<WsLeftSection | null>(null);
  readonly activeRight = signal<WsRightSection | null>(null);
  readonly panelOpen = signal(false);
  readonly orientation = signal<WsOrientation>('portrait');
  readonly quotationId = signal<string | null>(null);

  /**
   * TZ-KP-WS-406 — template draft id from the MCP import-todo href
   * (/proposals/workspace?templateDraft=<id>). Opens the template panel
   * preselected on that draft so the manager can finish it inline.
   */
  readonly templateDraftId = signal<string | null>(null);

  readonly panelSide = computed<'left' | 'right'>(() => (this.activeRight() ? 'right' : 'left'));

  readonly activeSection = computed<WsSection | null>(
    () => this.activeLeft() ?? this.activeRight(),
  );
  readonly panelTitle = computed<string>(() => {
    const section = this.activeSection();
    return section ? SECTION_TITLES[section] : '';
  });

  openSection(section: WsSection): void {
    if (isLeft(section)) {
      this.activeLeft.set(section);
      this.activeRight.set(null);
    } else {
      this.activeRight.set(section);
      this.activeLeft.set(null);
    }
    this.panelOpen.set(true);
  }

  /** Toggle: same section while open collapses; anything else switches/opens. */
  toggleSection(section: WsSection): void {
    if (this.panelOpen() && this.activeSection() === section) {
      this.closePanel();
      return;
    }
    this.openSection(section);
  }

  closePanel(): void {
    this.panelOpen.set(false);
  }

  setOrientation(next: WsOrientation): void {
    this.orientation.set(next);
  }
}
