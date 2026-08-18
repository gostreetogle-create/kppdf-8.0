import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import type { ManagerDeskOrderFixture } from './manager-desk.page';

type DeskStatus = ManagerDeskOrderFixture['status'];

const STATUS_LABELS: Record<DeskStatus, string> = {
  draft: 'Черновик',
  in_production: 'В производстве',
  ready: 'Готов',
};

const PRIMARY_CTA_LABELS: Record<DeskStatus, string> = {
  draft: 'Подтвердить',
  in_production: 'К отгрузке',
  ready: 'Отгрузить',
};

@Component({
  selector: 'app-desk-order-tray',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      class="desk-order-tray"
      data-test="desk-order-tray"
      role="region"
      [attr.id]="'desk-order-tray-' + order().id"
      [attr.aria-label]="'Сводка заказа: ' + order().number"
    >
      <span class="desk-order-tray__gold-rail" aria-hidden="true"></span>
      <div class="desk-order-tray__body">
        <section class="desk-order-tray__group" data-test="desk-tray-group-order">
          <div class="desk-order-tray__group-heading">
            <p class="desk-order-tray__eyebrow">Заказ</p>
            <span class="desk-order-tray__number">{{ order().number }}</span>
          </div>
          <dl class="desk-order-tray__facts">
            <div>
              <dt>Клиент</dt>
              <dd>{{ order().clientLabel }}</dd>
            </div>
            <div>
              <dt>Статус</dt>
              <dd class="desk-order-tray__status">{{ statusLabel(order().status) }}</dd>
            </div>
          </dl>
        </section>

        <section class="desk-order-tray__group" data-test="desk-tray-group-execution">
          <div class="desk-order-tray__group-heading">
            <p class="desk-order-tray__eyebrow">Исполнение</p>
            <span class="desk-order-tray__muted">fixture / read-only</span>
          </div>
          <div class="desk-order-tray__actions">
            <button
              type="button"
              class="desk-order-tray__primary"
              disabled
              data-test="desk-primary-cta"
              [attr.aria-label]="primaryCta(order().status) + ' — действие появится после DESK-402'"
              title="Действие появится после DESK-402"
            >
              {{ primaryCta(order().status) }}
            </button>
            <span class="desk-order-tray__disabled-note"
              >Действия подключатся после одобрения каркаса.</span
            >
          </div>
          <div class="desk-order-tray__inline-links" data-test="desk-tray-actions">
            <button
              type="button"
              class="desk-order-tray__stub-link"
              disabled
              data-test="desk-tray-link"
              data-action="supply"
              title="Подключится в DESK-402"
            >
              Снабжение
            </button>
            <button
              type="button"
              class="desk-order-tray__stub-link"
              disabled
              data-test="desk-tray-link"
              data-action="docs"
              title="Подключится в DESK-402"
            >
              Документы
            </button>
          </div>
        </section>

        <section class="desk-order-tray__group" data-test="desk-tray-group-composition">
          <div class="desk-order-tray__group-heading">
            <p class="desk-order-tray__eyebrow">Состав</p>
            <span class="desk-order-tray__muted">2 строки</span>
          </div>
          <div class="desk-order-tray__composition" aria-label="Состав заказа">
            @for (line of order().composition; track $index) {
              <div class="desk-order-tray__composition-row" data-test="desk-composition-row">
                <span class="desk-order-tray__composition-mark" aria-hidden="true"></span>
                <span>{{ line }}</span>
              </div>
            }
          </div>
        </section>
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .desk-order-tray {
        position: relative;
        display: flex;
        min-width: 0;
        border: 1px solid var(--color-rule);
        border-top: 0;
        background: var(--color-paper-2, var(--color-paper));
      }
      .desk-order-tray__gold-rail {
        width: 0.28rem;
        flex: 0 0 0.28rem;
        background: var(--color-sunrise-warm, #c79542);
      }
      .desk-order-tray__body {
        display: grid;
        width: 100%;
        min-width: 0;
        grid-template-columns: minmax(13rem, 1fr) minmax(16rem, 1.2fr) minmax(15rem, 1fr);
        gap: 1rem;
        padding: 1rem;
      }
      .desk-order-tray__group {
        min-width: 0;
      }
      .desk-order-tray__group + .desk-order-tray__group {
        padding-left: 1rem;
        border-left: 1px solid var(--color-rule);
      }
      .desk-order-tray__group-heading {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 0.75rem;
        padding-bottom: 0.45rem;
        border-bottom: 1px solid var(--color-rule);
      }
      .desk-order-tray__eyebrow {
        margin: 0;
        color: var(--color-muted-foreground);
        font-size: 0.68rem;
        letter-spacing: 0.08em;
        line-height: 1.1;
        text-transform: uppercase;
      }
      .desk-order-tray__number {
        font-family: var(--font-display, inherit);
        font-size: 0.86rem;
        font-weight: 700;
      }
      .desk-order-tray__muted,
      .desk-order-tray__disabled-note {
        color: var(--color-muted-foreground);
        font-size: 0.72rem;
      }
      .desk-order-tray__facts {
        display: grid;
        gap: 0.55rem;
        margin: 0.75rem 0 0;
      }
      .desk-order-tray__facts div {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 0.75rem;
      }
      .desk-order-tray__facts dt {
        color: var(--color-muted-foreground);
        font-size: 0.72rem;
      }
      .desk-order-tray__facts dd {
        max-width: 70%;
        margin: 0;
        overflow: hidden;
        font-size: 0.82rem;
        text-align: right;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .desk-order-tray__status {
        color: var(--color-sunrise-warm, #9b6b1e);
      }
      .desk-order-tray__actions {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        margin-top: 0.75rem;
        flex-wrap: wrap;
      }
      .desk-order-tray__primary {
        min-height: 2.25rem;
        padding: 0.45rem 0.8rem;
        border: 1px solid var(--color-rule-strong);
        border-radius: 2px;
        background: var(--color-ink);
        color: var(--color-paper);
        font: inherit;
        font-size: 0.82rem;
        cursor: not-allowed;
        opacity: 0.48;
      }
      .desk-order-tray__inline-links {
        display: flex;
        align-items: center;
        gap: 0.85rem;
        margin-top: 0.9rem;
        flex-wrap: wrap;
      }
      .desk-order-tray__stub-link {
        padding: 0;
        border: 0;
        border-bottom: 1px dotted var(--color-rule-strong);
        background: transparent;
        color: var(--color-muted-foreground);
        font: inherit;
        font-size: 0.78rem;
        cursor: not-allowed;
      }
      .desk-order-tray__composition {
        margin-top: 0.75rem;
      }
      .desk-order-tray__composition-row {
        display: flex;
        align-items: center;
        gap: 0.55rem;
        min-height: 2rem;
        border-bottom: 1px solid var(--color-rule);
        font-size: 0.8rem;
      }
      .desk-order-tray__composition-mark {
        width: 0.4rem;
        height: 0.4rem;
        flex: 0 0 auto;
        background: var(--color-sunrise-warm, #c79542);
      }
      @media (max-width: 900px) {
        .desk-order-tray__body {
          grid-template-columns: 1fr;
        }
        .desk-order-tray__group + .desk-order-tray__group {
          padding-top: 0.9rem;
          padding-left: 0;
          border-top: 1px solid var(--color-rule);
          border-left: 0;
        }
      }
    `,
  ],
})
export class DeskOrderTrayComponent {
  readonly order = input.required<ManagerDeskOrderFixture>();

  protected statusLabel(status: DeskStatus): string {
    return STATUS_LABELS[status];
  }

  protected primaryCta(status: DeskStatus): string {
    return PRIMARY_CTA_LABELS[status];
  }
}
