import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { httpResource } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import {
  BookOpen,
  Factory,
  FileText,
  Filter,
  LayoutGrid,
  Notebook,
  Package,
  Pencil,
  ShoppingCart,
  Users,
} from 'lucide-angular';
import { PiChromeToolsService } from '../../shared/chrome/pi-chrome-tools.service';
import type { PiChromeToolItem } from '../../shared/chrome/pi-chrome-tools.types';
import {
  PiGroupWorkspaceComponent,
  type GroupChip,
} from '../../shared/page/pi-group-workspace.component';
import { PiToastService } from '../../shared/ui/toast';
import { extractErrorMessage } from '../../core/silent-http';
import { AuthService } from '../../core/auth.service';
import { API_BASE_URL } from '../../core/api.tokens';
import { pluralize } from '../../shared/util/format';
import { createLookupTable } from '../../shared/util/lookup-table';
import { createSearchState } from '../../shared/util/search';
import { Counterparty, CounterpartyService } from '../../shared/services/pi-counterparty.service';
import {
  DeskNotesService,
  type DeskNote,
  type DeskNoteKind,
} from '../../shared/services/desk-notes.service';
import { Order, OrderStatus } from '../orders/orders.service';
import { OrderFormPanelComponent } from '../orders/order-form-panel.component';
import { OrderHubTrayComponent } from '../orders/order-hub-tray.component';
import { DESK_WORKFLOW_CHIPS } from './desk-workflow-chips';

type DeskPanelSide = 'left' | 'right';

export type ManagerDeskPanel =
  'create' | 'edit' | 'filter' | 'summary' | 'client' | 'bom' | 'docs' | 'supply' | 'notebook';

const STATUS_LABELS: Record<OrderStatus, string> = {
  draft: 'Черновик',
  confirmed: 'Подтверждён',
  in_production: 'В производстве',
  ready: 'Готов',
  shipped: 'Отгружен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

/** Lifecycle order for the filter/summary flyouts. */
const ALL_STATUSES: OrderStatus[] = [
  'draft',
  'confirmed',
  'in_production',
  'ready',
  'shipped',
  'delivered',
  'cancelled',
];

/**
 * 410: default «Активные» — production ACTIVE minus draft/shipped/
 * cancelled/delivered (business sense: show the work queue, not history).
 */
const ACTIVE_STATUSES: OrderStatus[] = ['confirmed', 'in_production', 'ready'];

const STATUS_ALL_TOKEN = 'all';

const DEFAULT_VISIBLE_LIMIT = 20;

function parseStatusFilter(raw: string | null | undefined): Set<OrderStatus> {
  if (!raw || raw.trim() === '') return new Set(ACTIVE_STATUSES);
  const value = raw.trim();
  if (value === STATUS_ALL_TOKEN) return new Set(ALL_STATUSES);
  const parsed = value
    .split(',')
    .map((s) => s.trim())
    .filter((s): s is OrderStatus => (ALL_STATUSES as string[]).includes(s));
  return parsed.length > 0 ? new Set(parsed) : new Set(ACTIVE_STATUSES);
}

function serializeStatusFilter(set: Set<OrderStatus>): string {
  if (set.size === ALL_STATUSES.length) return STATUS_ALL_TOKEN;
  return ALL_STATUSES.filter((s) => set.has(s)).join(',');
}

/** Date desc (created/updated fallback) — same field family as /orders. */
function orderDateDesc(a: Order, b: Order): number {
  const av = a.date ?? a.createdAt ?? a.updatedAt ?? '';
  const bv = b.date ?? b.createdAt ?? b.updatedAt ?? '';
  const at = av ? Date.parse(av) : NaN;
  const bt = bv ? Date.parse(bv) : NaN;
  if (Number.isNaN(at) && Number.isNaN(bt)) return 0;
  if (Number.isNaN(at)) return 1;
  if (Number.isNaN(bt)) return -1;
  return bt - at;
}

const PANEL_LABELS: Record<ManagerDeskPanel, string> = {
  create: 'Создать заказ',
  edit: 'Редактировать заказ',
  filter: 'Фильтр заказов',
  summary: 'Сводка',
  client: 'Клиент',
  bom: 'Состав',
  docs: 'Документы',
  supply: 'Снабжение',
  notebook: 'Блокнот',
};

const LEFT_PANELS = new Set<ManagerDeskPanel>(['create', 'filter', 'summary', 'notebook']);
const RIGHT_PANELS = new Set<ManagerDeskPanel>(['edit', 'client', 'bom', 'docs', 'supply']);
const CHROME_OWNER = 'manager-desk';

type DeskView = 'desk' | 'gantt' | 'combine';

const VIEW_LABELS: Record<DeskView, string> = {
  desk: 'Стол',
  gantt: 'Гант',
  combine: 'Комбайн',
};

const STUDIO_ROUTES: Record<Exclude<DeskView, 'desk'>, string> = {
  gantt: '/production',
  combine: '/design/combine',
};

function isDeskView(value: string | null): value is DeskView {
  return value === 'desk' || value === 'gantt' || value === 'combine';
}

type DeskChromeTool = PiChromeToolItem & { disabled?: boolean };

/**
 * Manager desk — live order queue (TZ-DESK-402).
 *
 * The queue reads `GET /orders` (flat array, same source as `/orders`). Create
 * and edit reuse `OrderFormPanelComponent` + `OrdersService` — one write-path.
 * Invalid `?orderId=` shows a RU toast, clears the query, and never crashes.
 */
@Component({
  selector: 'app-manager-desk-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OrderHubTrayComponent, OrderFormPanelComponent, PiGroupWorkspaceComponent],
  template: `
    <div class="manager-desk" data-test="manager-desk">
      <app-pi-group-workspace
        [chips]="workflowChips()"
        activeId="desk"
        dataTestPrefix="desk-workflow"
      >
        <div tools class="flex items-center gap-2 flex-wrap w-full">
          <input
            id="desk-search"
            type="search"
            name="desk-search"
            [value]="searchQuery()"
            (input)="onSearchInput($event)"
            placeholder="Поиск: номер, клиент…"
            aria-label="Поиск заказов"
            data-test="desk-search-input"
            class="pi-input w-64"
          />
          <span class="text-xs text-muted-foreground" data-test="desk-order-count">
            {{ sortedOrders().length }} {{ totalLabel(sortedOrders().length) }}
          </span>
          @if (expandedOrder(); as order) {
            <span class="text-muted-foreground" aria-hidden="true">/</span>
            <span
              class="font-display text-base tracking-tight text-ink truncate max-w-[min(40rem,70vw)]"
              aria-current="page"
              data-test="desk-order-crumb"
            >
              {{ order.number }}
            </span>
            @if (view() !== 'desk') {
              <span class="text-muted-foreground" aria-hidden="true">/</span>
              <span
                class="font-display text-base tracking-tight text-ink whitespace-nowrap"
                data-test="desk-view-crumb"
              >
                {{ viewLabel() }}
              </span>
            }
          }
        </div>

        <main class="manager-desk__center" aria-labelledby="desk-queue-heading">
          <h1 id="desk-queue-heading" class="sr-only">Очередь заказов</h1>
          @if (view() === 'desk') {
            <section class="manager-desk__queue" data-test="desk-order-queue">
              @if (listError()) {
                <p role="alert" class="manager-desk__queue-error" data-test="desk-queue-error">
                  {{ listError() }}
                </p>
              }

              <div class="manager-desk__orders" role="list" aria-label="Заказы на столе">
                @if (loading() && orders().length === 0) {
                  <p class="manager-desk__empty">Загрузка заказов…</p>
                } @else if (visibleOrders().length === 0) {
                  <p class="manager-desk__empty" data-test="desk-queue-empty">
                    {{ orders().length === 0 ? 'Нет заказов.' : 'Нет заказов по фильтру.' }}
                  </p>
                }
                @for (order of visibleOrders(); track order._id) {
                  <div
                    class="manager-desk__order-item"
                    role="listitem"
                    [attr.id]="'desk-order-' + order._id"
                  >
                    <button
                      type="button"
                      class="manager-desk__order-row"
                      [class.manager-desk__order-row--expanded]="expandedId() === order._id"
                      [attr.aria-expanded]="expandedId() === order._id"
                      [attr.aria-controls]="'order-hub-tray-' + order._id"
                      [attr.data-status]="order.status"
                      data-test="desk-order-row"
                      (click)="toggleOrder(order._id)"
                    >
                      <span class="manager-desk__order-disclosure" aria-hidden="true">
                        {{ expandedId() === order._id ? '▾' : '▸' }}
                      </span>
                      <span class="manager-desk__order-number">{{ order.number }}</span>
                      <span class="manager-desk__client">{{ clientLabel(order) }}</span>
                      <span class="manager-desk__status">{{ statusLabel(order.status) }}</span>
                    </button>

                    @if (expandedId() === order._id) {
                      <app-order-hub-tray
                        [order]="order"
                        mode="desk"
                        [clientLabel]="clientLabel(order)"
                        (openSupply)="onOpenSupply()"
                        (openDocs)="onOpenDocs()"
                        (createDocument)="onCreateDocument($event)"
                        (addLines)="onAddLines()"
                      />
                    }
                  </div>
                }
                @if (remainingCount() > 0) {
                  <button
                    type="button"
                    class="manager-desk__more"
                    data-test="desk-show-more"
                    (click)="showMore()"
                  >
                    Показать ещё {{ remainingCount() }}
                  </button>
                }
              </div>
            </section>
          } @else {
            <section class="manager-desk__view" [attr.data-test]="'desk-' + view() + '-view'">
              <h2 class="manager-desk__view-title">{{ viewLabel() }}</h2>
              @if (expandedOrder(); as order) {
                <p class="manager-desk__view-copy">
                  {{ order.number }} — «{{ viewLabel() }}» откроется в студии (embed отложен).
                </p>
                <a
                  [routerLink]="viewStudioRoute()"
                  [queryParams]="viewStudioQuery()"
                  class="manager-desk__view-link"
                  data-test="desk-view-open-studio"
                >
                  Открыть «{{ viewLabel() }}»
                </a>
              } @else {
                <p class="manager-desk__view-copy">
                  Раскройте заказ в очереди, чтобы открыть «{{ viewLabel() }}» для него.
                </p>
              }
            </section>
          }
        </main>
      </app-pi-group-workspace>

      @if (panel()) {
        <button
          type="button"
          class="manager-desk__backdrop"
          data-test="desk-flyout-backdrop"
          aria-label="Закрыть панель"
          (click)="closePanel()"
        ></button>
        <aside
          class="manager-desk__flyout"
          [class.manager-desk__flyout--left]="panelSide() === 'left'"
          [class.manager-desk__flyout--right]="panelSide() === 'right'"
          [class.manager-desk__flyout--wide]="panel() === 'create' || panel() === 'edit'"
          [attr.id]="'desk-flyout-' + panel()"
          data-test="desk-flyout"
          [attr.data-panel]="panel()"
          [attr.data-side]="panelSide()"
          [attr.aria-label]="panelTitle()"
          aria-modal="true"
          role="dialog"
        >
          <div class="manager-desk__flyout-heading">
            <div>
              <p class="manager-desk__eyebrow">Панель стола</p>
              <h2>{{ panelTitle() }}</h2>
            </div>
            <button
              type="button"
              class="manager-desk__close"
              data-test="desk-flyout-close"
              aria-label="Закрыть"
              title="Закрыть"
              (click)="closePanel()"
            >
              Закрыть
            </button>
          </div>

          @if (panel() === 'create') {
            <app-order-form-panel (saved)="onOrderSaved($event)" (cancelled)="closePanel()" />
          } @else if (panel() === 'edit') {
            <app-order-form-panel
              [order]="expandedOrder()"
              (saved)="onOrderSaved($event)"
              (cancelled)="closePanel()"
            />
          } @else if (panel() === 'filter') {
            <div class="flex flex-col gap-4" data-test="desk-filter">
              <div class="flex gap-2">
                <button
                  type="button"
                  class="min-h-touch px-3 py-1.5 border border-rule-strong rounded-sm bg-transparent text-ink text-sm cursor-pointer"
                  data-test="desk-filter-preset-active"
                  (click)="setStatusPreset('active')"
                >
                  Активные
                </button>
                <button
                  type="button"
                  class="min-h-touch px-3 py-1.5 border border-rule-strong rounded-sm bg-transparent text-ink text-sm cursor-pointer"
                  data-test="desk-filter-preset-all"
                  (click)="setStatusPreset('all')"
                >
                  Все
                </button>
              </div>
              <fieldset class="flex flex-col gap-1.5 border-0 p-0 m-0">
                <legend class="manager-desk__eyebrow">Статус</legend>
                @for (status of statuses; track status) {
                  <label class="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      [checked]="statusFilter().has(status)"
                      (change)="toggleStatus(status)"
                      [attr.data-test]="'desk-filter-status-' + status"
                    />
                    <span>{{ statusLabel(status) }}</span>
                  </label>
                }
              </fieldset>
              <button
                type="button"
                class="min-h-touch px-3 py-1.5 border border-rule-strong rounded-sm bg-ink text-paper text-sm cursor-pointer"
                data-test="desk-refresh"
                (click)="refresh()"
              >
                Обновить
              </button>
            </div>
          } @else if (panel() === 'summary') {
            <div class="flex flex-col gap-1" data-test="desk-summary">
              <p class="manager-desk__flyout-note">
                Сводка по текущему поиску (без учёта статус-фильтра).
              </p>
              @for (status of statuses; track status) {
                <div
                  class="flex items-baseline justify-between gap-4 py-1 border-b hairline text-sm"
                >
                  <span>{{ statusLabel(status) }}</span>
                  <span class="font-mono" [attr.data-test]="'desk-summary-count-' + status">
                    {{ summaryCounts()[status] ?? 0 }}
                  </span>
                </div>
              }
            </div>
          } @else if (panel() === 'notebook') {
            <div class="flex flex-col gap-4" data-test="desk-notebook">
              @if (expandedOrder(); as order) {
                @if (notesError()) {
                  <p role="alert" class="manager-desk__queue-error" data-test="desk-notebook-error">
                    {{ notesError() }}
                  </p>
                }
                <div class="flex flex-col gap-2" data-test="desk-notebook-list">
                  @if (notes().length === 0) {
                    <p class="manager-desk__flyout-note">Заметок у заказа пока нет.</p>
                  }
                  @for (note of notes(); track note._id) {
                    <div
                      class="manager-desk__note"
                      [class.manager-desk__note--done]="!!note.isDone"
                      data-test="desk-note"
                    >
                      <div class="manager-desk__note-top">
                        <span class="manager-desk__note-anchor" data-test="desk-note-anchor">
                          {{ noteAnchorLabel(note) }}
                        </span>
                        <span class="manager-desk__note-meta">
                          {{ noteAuthorLabel(note) }} · {{ noteDateLabel(note) }}
                        </span>
                      </div>
                      <p class="manager-desk__note-text">{{ note.text }}</p>
                      <div class="manager-desk__note-actions">
                        @if (note.kind === 'checklist') {
                          <label class="manager-desk__note-done">
                            <input
                              type="checkbox"
                              [checked]="!!note.isDone"
                              (change)="onNoteToggleDone(note)"
                              data-test="desk-note-toggle"
                            />
                            готово
                          </label>
                        }
                        <button
                          type="button"
                          class="manager-desk__note-delete"
                          data-test="desk-note-delete"
                          (click)="onNoteDelete(note)"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  }
                </div>
                <div class="flex flex-col gap-2" data-test="desk-note-form">
                  <textarea
                    class="pi-input w-full"
                    rows="3"
                    [value]="noteText()"
                    (input)="onNoteTextInput($event)"
                    placeholder="Заметка к заказу…"
                    aria-label="Текст заметки"
                    data-test="desk-note-text"
                  ></textarea>
                  <div class="flex gap-2 flex-wrap">
                    <select
                      class="pi-input"
                      [value]="noteKind()"
                      (change)="onNoteKindChange($event)"
                      aria-label="Тип заметки"
                      data-test="desk-note-kind"
                    >
                      <option value="note">Заметка</option>
                      <option value="checklist">Чек-лист</option>
                      <option value="reminder">Напоминание</option>
                    </select>
                    <select
                      class="pi-input"
                      [value]="noteLineId() ?? ''"
                      (change)="onNoteLineChange($event)"
                      aria-label="Якорь заметки"
                      data-test="desk-note-anchor-select"
                    >
                      <option value="">Заказ</option>
                      @for (item of order.items ?? []; track item.lineId ?? item.productId) {
                        <option [value]="item.lineId ?? item.productId">
                          {{ item.productName ?? 'Линия' }}
                        </option>
                      }
                    </select>
                  </div>
                  <button
                    type="button"
                    class="min-h-touch px-3 py-1.5 border border-rule-strong rounded-sm bg-ink text-paper text-sm cursor-pointer disabled:opacity-50"
                    [disabled]="!noteText().trim()"
                    data-test="desk-note-submit"
                    (click)="onNoteCreate()"
                  >
                    Добавить
                  </button>
                </div>
              } @else {
                <p class="manager-desk__flyout-note">
                  Раскройте заказ в очереди, чтобы видеть и добавлять его заметки.
                </p>
              }
            </div>
          } @else {
            <p class="manager-desk__flyout-copy">Здесь будет панель (в следующей волне)</p>
            <p class="manager-desk__flyout-note">
              Каркас готов; данные и действия подключаются дальше.
            </p>
          }
        </aside>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100%;
        color: var(--color-ink);
      }
      .manager-desk {
        position: relative;
        min-height: calc(100dvh - 3.5rem);
      }
      .manager-desk__center {
        min-width: 0;
      }
      .manager-desk__queue {
        border: 1px solid var(--color-rule);
        background: var(--color-paper-raised, var(--color-paper));
      }
      .manager-desk__view {
        padding: 1.25rem;
        border: 1px solid var(--color-rule);
        background: var(--color-paper-raised, var(--color-paper));
      }
      .manager-desk__view-title {
        margin: 0 0 0.5rem;
        font-family: var(--font-display, inherit);
        font-size: 1.2rem;
        font-weight: 650;
        letter-spacing: -0.025em;
      }
      .manager-desk__view-copy {
        margin: 0 0 0.75rem;
        color: var(--color-muted-foreground);
        font-size: 0.85rem;
        line-height: 1.5;
      }
      .manager-desk__view-link {
        color: var(--color-sunrise-warm, #9b6b1e);
        font-size: 0.88rem;
        text-decoration: underline;
        text-underline-offset: 2px;
      }
      .manager-desk__queue-error {
        margin: 0;
        padding: 0.75rem 1rem;
        border-bottom: 1px solid var(--color-rule);
        background: var(--color-destructive-soft, oklch(0.93 0.04 25));
        color: var(--color-destructive);
        font-size: 0.82rem;
      }
      .manager-desk__orders {
        display: flex;
        max-height: min(60vh, calc(100dvh - 8rem));
        flex-direction: column;
        gap: 0.45rem;
        overflow-y: auto;
        padding: 1rem;
      }
      .manager-desk__empty {
        margin: 0;
        padding: 0.75rem 0;
        color: var(--color-muted-foreground);
        font-size: 0.85rem;
      }
      .manager-desk__more {
        min-height: 2.25rem;
        width: 100%;
        padding: 0.4rem 0.8rem;
        border: 1px dashed var(--color-rule-strong);
        border-radius: 2px;
        background: transparent;
        color: var(--color-ink);
        font: inherit;
        font-size: 0.82rem;
        cursor: pointer;
      }
      .manager-desk__more:hover {
        background: var(--color-paper-2, #f2f0ea);
      }
      .manager-desk__order-item {
        min-width: 0;
      }
      .manager-desk__order-row {
        display: grid;
        grid-template-columns: auto minmax(5rem, 0.25fr) minmax(0, 1fr) auto;
        align-items: center;
        gap: 0.7rem;
        width: 100%;
        min-height: 3.25rem;
        padding: 0.65rem 0.8rem;
        border: 1px solid var(--color-rule);
        border-radius: 2px;
        background: var(--color-paper);
        color: inherit;
        cursor: pointer;
        text-align: left;
        transition:
          border-color 120ms ease,
          background-color 120ms ease;
      }
      .manager-desk__order-row:hover,
      .manager-desk__order-row--expanded {
        border-color: var(--color-sunrise-warm, #c79542);
        background: var(--color-sunrise-soft, #fff6df);
      }
      .manager-desk__order-row--expanded {
        border-bottom-color: transparent;
      }
      .manager-desk__order-disclosure {
        display: inline-flex;
        width: 1.2rem;
        align-items: center;
        justify-content: center;
        color: var(--color-sunrise-warm, #9b6b1e);
        font-size: 0.9rem;
      }
      .manager-desk__order-number {
        font-family: var(--font-display, inherit);
        font-weight: 700;
      }
      .manager-desk__client {
        min-width: 0;
        overflow: hidden;
        color: var(--color-muted-foreground);
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .manager-desk__status {
        color: var(--color-sunrise-warm, #9b6b1e);
        font-size: 0.78rem;
        white-space: nowrap;
      }
      .manager-desk__flyout-heading {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 1rem;
      }
      .manager-desk__flyout h2 {
        margin: 0;
        font-family: var(--font-display, inherit);
        font-size: 1.2rem;
        font-weight: 650;
        letter-spacing: -0.025em;
      }
      .manager-desk__flyout-note {
        margin: 0;
        color: var(--color-muted-foreground);
        font-size: 0.78rem;
      }
      .manager-desk__eyebrow {
        margin: 0 0 0.3rem;
        color: var(--color-muted-foreground);
        font-size: 0.68rem;
        letter-spacing: 0.08em;
        line-height: 1.1;
        text-transform: uppercase;
      }
      .manager-desk__backdrop {
        position: fixed;
        inset: 0 0 0 3.5rem;
        z-index: 40;
        border: 0;
        padding: 0;
        background: oklch(0.22 0.02 260 / 0.18);
        cursor: default;
      }
      .manager-desk__flyout {
        position: fixed;
        top: 3.5rem;
        bottom: 0;
        z-index: 50;
        display: flex;
        width: min(25rem, calc(100vw - 4.5rem));
        flex-direction: column;
        gap: 1.25rem;
        overflow: auto;
        padding: 1.25rem;
        border: 1px solid var(--color-rule-strong);
        background: var(--color-paper-raised, var(--color-paper));
      }
      .manager-desk__flyout--wide {
        width: min(48rem, calc(100vw - 4.5rem));
      }
      .manager-desk__flyout--right {
        right: 0;
        border-right: 0;
      }
      .manager-desk__flyout--left {
        left: 4rem;
        border-left: 0;
      }
      .manager-desk__close {
        min-height: 2.25rem;
        padding: 0.45rem 0.8rem;
        border: 1px solid var(--color-rule-strong);
        border-radius: 2px;
        background: transparent;
        color: var(--color-ink);
        font: inherit;
        font-size: 0.82rem;
        cursor: pointer;
        white-space: nowrap;
      }
      .manager-desk__close:hover {
        background: var(--color-paper-2, #f2f0ea);
      }
      .manager-desk__flyout-copy {
        margin: 0;
        padding: 1rem;
        border: 1px dashed var(--color-rule-strong);
        color: var(--color-muted-foreground);
        font-size: 0.9rem;
        line-height: 1.5;
      }
      .manager-desk__note {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        padding: 0.6rem 0.7rem;
        border: 1px solid var(--color-rule);
        border-radius: 2px;
        background: var(--color-paper);
      }
      .manager-desk__note--done {
        opacity: 0.62;
      }
      .manager-desk__note--done .manager-desk__note-text {
        text-decoration: line-through;
      }
      .manager-desk__note-top {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 0.5rem;
      }
      .manager-desk__note-anchor {
        color: var(--color-sunrise-warm, #9b6b1e);
        font-size: 0.7rem;
        font-weight: 600;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }
      .manager-desk__note-meta {
        color: var(--color-muted-foreground);
        font-size: 0.68rem;
        white-space: nowrap;
      }
      .manager-desk__note-text {
        margin: 0;
        font-size: 0.85rem;
        line-height: 1.45;
        white-space: pre-wrap;
        word-break: break-word;
      }
      .manager-desk__note-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
      }
      .manager-desk__note-done {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        color: var(--color-muted-foreground);
        font-size: 0.72rem;
        cursor: pointer;
      }
      .manager-desk__note-delete {
        border: 0;
        padding: 0;
        background: transparent;
        color: var(--color-destructive, #b3261e);
        font: inherit;
        font-size: 0.72rem;
        cursor: pointer;
        text-decoration: underline;
        text-underline-offset: 2px;
      }
      @media (max-width: 900px) {
        .manager-desk__order-row {
          grid-template-columns: auto minmax(4.5rem, auto) minmax(0, 1fr);
        }
        .manager-desk__status {
          grid-column: 3;
        }
        .manager-desk__flyout {
          width: min(25rem, calc(100vw - 1rem));
        }
        .manager-desk__flyout--wide {
          width: min(46rem, calc(100vw - 1rem));
        }
        .manager-desk__flyout--left {
          left: 0.5rem;
        }
      }
    `,
  ],
})
export class ManagerDeskPage {
  protected readonly expandedId = signal<string | null>(null);
  protected readonly panel = signal<ManagerDeskPanel | null>(null);
  protected readonly view = signal<DeskView>('desk');

  /** 408: блокнот — заметки к раскрытому заказу (anchor order/line). */
  protected readonly notes = signal<DeskNote[]>([]);
  protected readonly notesError = signal<string | null>(null);
  protected readonly noteText = signal('');
  protected readonly noteKind = signal<DeskNoteKind>('note');
  protected readonly noteLineId = signal<string | null>(null);

  /** 410: debounced search + client-side filter/sort/slice pipeline. */
  private readonly search = createSearchState(300);
  protected readonly searchQuery = this.search.searchQuery;
  protected readonly statusFilter = signal<Set<OrderStatus>>(new Set(ACTIVE_STATUSES));
  protected readonly visibleLimit = signal(DEFAULT_VISIBLE_LIMIT);
  protected readonly statuses = ALL_STATUSES;

  protected readonly listRes = httpResource<Order[]>(() => ({ url: `${this.baseUrl}/orders` }));
  protected readonly orders = computed<Order[]>(() => this.listRes.value() ?? []);
  protected readonly loading = computed<boolean>(() => this.listRes.isLoading());
  protected readonly listError = computed<string | null>(() => {
    const err = this.listRes.error() as
      import('@angular/common/http').HttpErrorResponse | undefined;
    return err ? extractErrorMessage(err) : null;
  });

  protected readonly expandedOrder = computed(
    () => this.orders().find((order) => order._id === this.expandedId()) ?? null,
  );

  /** Search only (number/client/notes/address) — before the status filter. */
  protected readonly searchedOrders = computed<Order[]>(() => {
    const rows = this.orders();
    const q = this.search.debouncedSearch().trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((order) => {
      const cp = this.counterpartiesLookup.byId()[this.counterpartyIdOf(order)];
      const hay = [
        order.number,
        order.deliveryAddress,
        order.notes,
        cp?.name,
        cp?.shortName,
        cp?.inn,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  });

  protected readonly filteredOrders = computed<Order[]>(() => {
    const set = this.statusFilter();
    return this.searchedOrders().filter((order) => set.has(order.status));
  });

  /** Default date/created/updated desc — same field family as /orders. */
  protected readonly sortedOrders = computed<Order[]>(() =>
    this.filteredOrders().slice().sort(orderDateDesc),
  );

  protected readonly visibleOrders = computed<Order[]>(() =>
    this.sortedOrders().slice(0, this.visibleLimit()),
  );

  protected readonly remainingCount = computed<number>(() =>
    Math.max(0, this.sortedOrders().length - this.visibleLimit()),
  );

  /** Read-only status histogram over the search-filtered set (no status filter). */
  protected readonly summaryCounts = computed<Record<OrderStatus, number>>(() => {
    const counts = {} as Record<OrderStatus, number>;
    for (const status of ALL_STATUSES) counts[status] = 0;
    for (const order of this.searchedOrders()) {
      counts[order.status] = (counts[order.status] ?? 0) + 1;
    }
    return counts;
  });

  /**
   * Daily workflow chips. The combine studio keeps its orderId query when a
   * row is expanded; everything else is the static constant.
   */
  protected readonly workflowChips = computed<readonly GroupChip[]>(() => {
    const order = this.expandedOrder();
    if (!order) return DESK_WORKFLOW_CHIPS;
    return DESK_WORKFLOW_CHIPS.map((chip) =>
      chip.id === 'combine' || chip.id === 'gantt'
        ? { ...chip, queryParams: { ...chip.queryParams, orderId: order._id } }
        : chip,
    );
  });

  protected readonly panelSide = computed<DeskPanelSide | null>(() => {
    const panel = this.panel();
    if (!panel) return null;
    return LEFT_PANELS.has(panel) ? 'left' : 'right';
  });

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly chromeTools = inject(PiChromeToolsService);
  private readonly toast = inject(PiToastService);
  private readonly auth = inject(AuthService);
  private readonly notesService = inject(DeskNotesService);
  private readonly counterpartyService = inject(CounterpartyService);
  private readonly counterpartiesLookup = createLookupTable<Counterparty>(
    this.counterpartyService.list({ limit: 200 }),
  );

  private readonly rawOrderId = signal<string | null>(null);
  private readonly rawPanel = signal<string | null>(null);
  private readonly rawStatus = signal<string | null>(null);
  private readonly rawView = signal<string | null>(null);
  private readonly pendingScrollId = signal<string | null>(null);

  constructor() {
    this.counterpartiesLookup.load();
    this.destroyRef.onDestroy(() => this.search.destroy());

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.rawOrderId.set(params.get('orderId'));
      this.rawPanel.set(params.get('panel'));
      this.rawStatus.set(params.get('status'));
      this.rawView.set(params.get('view'));
      this.reconcile();
    });

    // When orders finish loading, reconcile the pending query state.
    effect(() => {
      this.orders();
      untracked(() => this.reconcile());
    });

    // Scroll the freshly created/expanded row into view once the list has it.
    effect(() => {
      const id = this.pendingScrollId();
      const orders = this.orders();
      if (id && orders.some((order) => order._id === id)) {
        untracked(() => {
          this.pendingScrollId.set(null);
          this.scrollToOrder(id);
        });
      }
    });

    effect(() => {
      this.expandedOrder();
      this.panel();
      untracked(() => this.syncChromeTools());
    });

    // 408: when the notebook is open, load notes for the expanded order.
    effect(() => {
      const panel = this.panel();
      const order = this.expandedOrder();
      if (panel === 'notebook' && order) {
        untracked(() => this.loadNotes(order._id));
      }
    });
  }

  // Page-owned registry cleanup for app chrome rails.
  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  ngOnDestroy(): void {
    this.chromeTools.clear(CHROME_OWNER);
  }

  protected statusLabel(status: OrderStatus): string {
    return STATUS_LABELS[status];
  }

  protected totalLabel(n: number): string {
    return pluralize(n, ['заказ', 'заказа', 'заказов']);
  }

  protected clientLabel(order: Order): string {
    const value = order.counterpartyId;
    if (value && typeof value !== 'string' && value.name) {
      return value.name.trim() || '—';
    }
    const id = this.counterpartyIdOf(order);
    if (!id) return '—';
    const cp = this.counterpartiesLookup.byId()[id];
    return cp?.shortName ?? cp?.name ?? '—';
  }

  protected panelTitle(): string {
    const panel = this.panel();
    return panel ? PANEL_LABELS[panel] : '';
  }

  protected viewLabel(): string {
    return VIEW_LABELS[this.view()];
  }

  protected viewStudioRoute(): string {
    const view = this.view();
    return view === 'desk' ? '/production' : STUDIO_ROUTES[view];
  }

  protected viewStudioQuery(): Record<string, string | null> {
    return { orderId: this.expandedOrder()?._id ?? null, from: 'desk' };
  }

  protected toggleOrder(id: string): void {
    if (!this.orders().some((order) => order._id === id)) return;
    const nextId = this.expandedId() === id ? null : id;
    this.expandedId.set(nextId);
    this.panel.set(null);
    this.navigateQuery(nextId, null);
  }

  protected onSearchInput(event: Event): void {
    this.search.onSearchInput(event);
    this.visibleLimit.set(DEFAULT_VISIBLE_LIMIT);
  }

  protected toggleStatus(status: OrderStatus): void {
    const next = new Set(this.statusFilter());
    if (next.has(status)) {
      if (next.size === 1) return; // keep at least one selected
      next.delete(status);
    } else {
      next.add(status);
    }
    this.applyStatusFilter(next);
  }

  protected setStatusPreset(preset: 'active' | 'all'): void {
    this.applyStatusFilter(new Set(preset === 'active' ? ACTIVE_STATUSES : ALL_STATUSES));
  }

  protected refresh(): void {
    this.listRes.reload();
  }

  protected showMore(): void {
    this.visibleLimit.update((n) => n + DEFAULT_VISIBLE_LIMIT);
  }

  protected onOpenSupply(): void {
    this.toast.show('Панель снабжения подключится позже.');
  }

  protected onOpenDocs(): void {
    this.toast.show('Шаблоны документов откроются здесь позже.');
  }

  /** Reuse the /orders hub handler: documents templates for this order. */
  protected onCreateDocument(order: Order): void {
    this.router.navigate(['/doc-constructor/templates'], {
      queryParams: { source: 'order', sourceId: order._id },
    });
  }

  /** Empty-composition CTA: add lines via the existing edit flyout. */
  protected onAddLines(): void {
    this.openPanel('edit');
  }

  /** 408: load notes for the given order (one write-path via DeskNotesService). */
  private loadNotes(orderId: string): void {
    this.notesError.set(null);
    this.notesService.list({ orderId }).subscribe((res) => {
      if (res.ok) {
        this.notes.set(res.data);
      } else {
        this.notesError.set(extractErrorMessage(res.error));
      }
    });
  }

  protected onNoteTextInput(event: Event): void {
    this.noteText.set((event.target as HTMLTextAreaElement).value);
  }

  protected onNoteKindChange(event: Event): void {
    this.noteKind.set((event.target as HTMLSelectElement).value as DeskNoteKind);
  }

  protected onNoteLineChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.noteLineId.set(value || null);
  }

  protected onNoteCreate(): void {
    const order = this.expandedOrder();
    const text = this.noteText().trim();
    if (!order || !text) return;
    this.notesService
      .create({
        text,
        kind: this.noteKind(),
        anchorOrderId: order._id,
        anchorLineId: this.noteLineId() ?? undefined,
      })
      .subscribe((res) => {
        if (res.ok) {
          this.noteText.set('');
          this.noteLineId.set(null);
          this.loadNotes(order._id);
        } else {
          this.notesError.set(extractErrorMessage(res.error));
        }
      });
  }

  protected onNoteToggleDone(note: DeskNote): void {
    this.notesService.update(note._id, { isDone: !note.isDone }).subscribe((res) => {
      if (res.ok) this.loadNotes(this.expandedOrder()?._id ?? note.anchorOrderId);
    });
  }

  protected onNoteDelete(note: DeskNote): void {
    this.notesService.remove(note._id).subscribe((res) => {
      if (res.ok) this.loadNotes(this.expandedOrder()?._id ?? note.anchorOrderId);
    });
  }

  protected noteAnchorLabel(note: DeskNote): string {
    if (note.anchorLineId) {
      const item = this.expandedOrder()?.items?.find(
        (i) => (i.lineId ?? i.productId) === note.anchorLineId,
      );
      return item?.productName ?? 'Линия';
    }
    return 'Заказ';
  }

  protected noteAuthorLabel(note: DeskNote): string {
    const me = this.auth.user();
    if (me && note.authorId === me.id) return me.displayName ?? me.username ?? 'Я';
    return note.authorId.slice(0, 6);
  }

  protected noteDateLabel(note: DeskNote): string {
    if (!note.createdAt) return '';
    const d = new Date(note.createdAt);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /** Shared handler for left-rail tools and any future empty-state CTA. */
  protected openPanel(panel: ManagerDeskPanel): void {
    if (!this.canOpenPanel(panel)) return;
    this.panel.set(panel);
    this.navigateQuery(this.expandedId(), panel);
  }

  protected closePanel(): void {
    this.panel.set(null);
    this.navigateQuery(this.expandedId(), null);
  }

  protected onOrderSaved(order: Order): void {
    this.panel.set(null);
    this.expandedId.set(order._id);
    this.pendingScrollId.set(order._id);
    this.navigateQuery(order._id, null);
    this.listRes.reload();
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    // Escape closes a flyout, never the expanded row.
    if (this.panel()) this.closePanel();
  }

  private reconcile(): void {
    const rawStatus = this.rawStatus();
    if (rawStatus !== null) {
      this.statusFilter.set(parseStatusFilter(rawStatus));
    }

    const rawView = this.rawView();
    this.view.set(isDeskView(rawView) ? rawView : 'desk');

    const orders = this.orders();
    const rawId = this.rawOrderId();
    const rawPanel = this.rawPanel();

    // While loading/reloading, keep the requested expansion and defer
    // validation — a freshly created order may not be in the list yet.
    if (this.loading()) {
      if (rawId) this.expandedId.set(rawId);
      return;
    }

    const validId = rawId && orders.some((order) => order._id === rawId) ? rawId : null;
    if (rawId && !validId) {
      this.toast.error('Заказ не найден');
      this.expandedId.set(null);
      this.panel.set(null);
      this.clearOrderIdQuery();
      return;
    }

    this.expandedId.set(validId);
    const panel = this.isPanel(rawPanel) ? rawPanel : null;
    this.panel.set(panel && this.canOpenPanel(panel) ? panel : null);
  }

  private clearOrderIdQuery(): void {
    void Promise.resolve(
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { orderId: null, panel: null },
        queryParamsHandling: 'merge',
      }),
    ).catch(() => undefined);
  }

  private canOpenPanel(panel: ManagerDeskPanel): boolean {
    if (LEFT_PANELS.has(panel)) return true;
    const order = this.expandedOrder();
    if (!order || !RIGHT_PANELS.has(panel)) return false;
    if (panel === 'supply') {
      return order.status === 'in_production' || order.status === 'ready';
    }
    return true;
  }

  private isPanel(value: string | null): value is ManagerDeskPanel {
    return value !== null && Object.prototype.hasOwnProperty.call(PANEL_LABELS, value);
  }

  private navigateQuery(orderId: string | null, panel: ManagerDeskPanel | null): void {
    void Promise.resolve(
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { orderId: orderId ?? null, panel: panel ?? null },
        queryParamsHandling: 'merge',
      }),
    ).catch(() => undefined);
  }

  private applyStatusFilter(next: Set<OrderStatus>): void {
    this.statusFilter.set(next);
    this.visibleLimit.set(DEFAULT_VISIBLE_LIMIT);
    this.navigateStatus(serializeStatusFilter(next));
  }

  private navigateStatus(status: string): void {
    void Promise.resolve(
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { status },
        queryParamsHandling: 'merge',
      }),
    ).catch(() => undefined);
  }

  private counterpartyIdOf(order: Order): string {
    const value = order.counterpartyId;
    if (!value) return '';
    return typeof value === 'string' ? value : (value._id ?? '');
  }

  private scrollToOrder(id: string): void {
    const el = document.getElementById(`desk-order-${id}`);
    if (!el || typeof el.scrollIntoView !== 'function') return;
    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  private syncChromeTools(): void {
    const expanded = this.expandedOrder();
    const open = this.panel();
    const left: DeskChromeTool[] = [
      {
        id: 'create',
        side: 'left',
        ariaLabel: 'Создать заказ',
        title: 'Создать заказ',
        icon: Package,
        active: open === 'create',
        ariaExpanded: open === 'create',
        ariaControls: 'desk-flyout-create',
        order: 1,
        onClick: () => this.openPanel('create'),
      },
      {
        id: 'filter',
        side: 'left',
        ariaLabel: 'Фильтр',
        title: 'Фильтр',
        icon: Filter,
        active: open === 'filter',
        ariaExpanded: open === 'filter',
        ariaControls: 'desk-flyout-filter',
        order: 2,
        onClick: () => this.openPanel('filter'),
      },
      {
        id: 'summary',
        side: 'left',
        ariaLabel: 'Сводка',
        title: 'Сводка',
        icon: BookOpen,
        active: open === 'summary',
        ariaExpanded: open === 'summary',
        ariaControls: 'desk-flyout-summary',
        order: 3,
        onClick: () => this.openPanel('summary'),
      },
      {
        id: 'notebook',
        side: 'left',
        ariaLabel: 'Блокнот',
        title: 'Блокнот',
        icon: Notebook,
        active: open === 'notebook',
        ariaExpanded: open === 'notebook',
        ariaControls: 'desk-flyout-notebook',
        order: 4,
        onClick: () => this.openPanel('notebook'),
      },
    ];

    const right: DeskChromeTool[] = expanded
      ? [
          this.actionTool('edit', 'Редактировать', Pencil, open === 'edit', 1),
          this.actionTool('client', 'Клиент', Users, open === 'client', 2),
          this.actionTool('bom', 'Состав', Package, open === 'bom', 3),
          this.actionTool('docs', 'Документы', FileText, open === 'docs', 4),
          ...(this.canOpenPage('supply') &&
          (expanded.status === 'in_production' || expanded.status === 'ready')
            ? [this.actionTool('supply', 'Снабжение', ShoppingCart, open === 'supply', 5)]
            : []),
          ...(this.canOpenPage('production')
            ? [this.studioTool('gantt', 'На Ганте', Factory, 'gantt', 6)]
            : []),
          ...(this.canOpenPage('orders')
            ? [this.studioTool('combine', 'В комбайне', LayoutGrid, 'combine', 7)]
            : []),
        ]
      : [];

    this.chromeTools.setTools(CHROME_OWNER, [...left, ...right]);
  }

  /** Page-ACL gate for rail tools; undefined pages (legacy session) → show. */
  private canOpenPage(pageKey: string): boolean {
    const pages = this.auth.user()?.pages;
    return !Array.isArray(pages) || pages.includes(pageKey);
  }

  /**
   * 404: rail tools deep-link into the real studios with orderId&from=desk
   * (deep-link fallback; the ?view= stub stays for the workflow chips).
   */
  private studioTool(
    id: 'gantt' | 'combine',
    label: string,
    icon: PiChromeToolItem['icon'],
    view: Exclude<DeskView, 'desk'>,
    order: number,
  ): DeskChromeTool {
    return {
      id,
      side: 'right',
      ariaLabel: label,
      title: label,
      icon,
      active: false,
      disabled: false,
      ariaExpanded: false,
      order,
      onClick: () => this.openStudio(view),
    };
  }

  private openStudio(view: Exclude<DeskView, 'desk'>): void {
    const orderId = this.expandedOrder()?._id ?? null;
    if (!orderId) return;
    void Promise.resolve(
      this.router.navigate([STUDIO_ROUTES[view]], {
        queryParams: { orderId, from: 'desk' },
      }),
    ).catch(() => undefined);
  }

  private actionTool(
    id: string,
    label: string,
    icon: PiChromeToolItem['icon'],
    active: boolean,
    order: number,
    disabled = false,
  ): DeskChromeTool {
    const disabledTitle = `${label} — подключится в DESK-404`;
    return {
      id,
      side: 'right',
      ariaLabel: label,
      title: disabled ? disabledTitle : label,
      icon,
      active,
      disabled,
      ariaExpanded: !disabled && active,
      ariaControls: `desk-flyout-${id}`,
      order,
      onClick: disabled ? () => undefined : () => this.openPanel(id as ManagerDeskPanel),
    };
  }
}
