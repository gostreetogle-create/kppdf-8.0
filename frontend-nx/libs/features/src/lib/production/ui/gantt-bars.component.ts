import {
  afterNextRender,
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  HostListener,
  inject,
  input,
  Injector,
  output,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ESTIMATE_OVERRIDE_HINT_RU,
  formatDateOnly,
  GANTT_UNASSIGNED_CHIP_FILL,
  isModuleSummaryBar,
  isOrderSummaryBar,
  isProductSummaryBar,
  type GanttBar,
} from '../util/gantt-bar.model';
import { personDisplayName, type OrderStatus, type Person } from '@kppdf/data-access';
import type { GanttGroupBy, GanttZoom } from '../production-cockpit.context';
import { ProductionScaleControlsComponent } from './production-scale-controls.component';

/**
 * TZ-NX-GANTT-BARS-FACADE — pure constants/types/helpers relocated to
 * `gantt-bars.constants.ts` (shared with `gantt-bars.facade.ts` without a
 * circular value-import between this file and the facade). Re-exported here
 * unchanged so existing external imports (`GANTT_PX_PER_DAY` from the spec,
 * the `Gantt*Commit`/`GanttOrderMetaView` types from `production-cockpit.page.ts`)
 * keep resolving from `./gantt-bars.component` exactly as before.
 */
export * from '../util/gantt-bars.constants';
import {
  calculateCenteredMarkerScrollLeft,
  GANTT_DETAIL_ROW_PX,
  GANTT_LABEL_COL_PX,
  GANTT_META_ROW_PX,
  GANTT_NEST_INDENT_PX,
  GANTT_ROW_PX,
  GANTT_SUMMARY_BAR_FILL,
  type GanttEstimateDaysCommit,
  type GanttOrderMetaCommit,
  type GanttOrderMetaView,
  type GanttPlannedDateMoveCommit,
  type GanttRowKind,
  type GanttStartOffsetCommit,
  type GanttWorkerAssignmentCommit,
} from '../util/gantt-bars.constants';
import { GanttBarsFacade, type GanttBarsFacadeHost } from '../gantt-bars.facade';

@Component({
  selector: 'app-gantt-bars',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ProductionScaleControlsComponent],
  template: `
    <div
      class="flex flex-col h-full min-h-0 bg-paper"
      [attr.data-zoom]="zoom()"
      data-test="gantt-bars-root"
      (click)="onRootClick($event)"
    >
      <div
        class="shrink-0 px-3 py-1 flex flex-wrap items-center gap-x-3 gap-y-1 border-b hairline bg-paper"
      >
        <app-production-scale-controls
          class="min-w-0 flex-1"
          [zoom]="zoom()"
          [groupBy]="groupByWorkers() ? 'workers' : 'orders'"
          (zoomChange)="zoomChange.emit($event)"
          (groupByChange)="groupByChange.emit($event)"
          (fit)="fit.emit()"
        />
        @if (usedTodayFallback()) {
          <span
            class="text-[13px] text-amber-800 dark:text-amber-300"
            data-test="gantt-today-fallback"
            >Дата начала не задана — показано от сегодня</span
          >
        }
        @if (readOnly()) {
          <span class="text-[13px] text-amber-800 dark:text-amber-300"
            >Заказ завершён/отменён — только просмотр</span
          >
        }
      </div>

      @if (unassignedSummary().workTypeNames.length) {
        <div
          class="shrink-0 px-3 py-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-hint-warn border-b hairline bg-paper"
          data-test="gantt-unassigned-banner"
          role="status"
        >
          <span>
            Без исполнителя: {{ unassignedSummary().workTypeNames.length }} видов работ — группа
            «Не назначен» раскрыта; назначьте в
          </span>
          <a
            routerLink="/registries/workers"
            class="font-medium text-hint-warn underline underline-offset-2 shrink-0"
            data-test="gantt-unassigned-people-link"
            >Люди</a
          >
          <span class="text-hint-warn/80 truncate min-w-0">
            — {{ unassignedWorkTypeNamesPreview() }}
          </span>
        </div>
      }

      @if (warnings().length) {
        <div
          class="shrink-0 px-3 py-1 text-[13px] text-hint-warn border-b hairline bg-paper"
          data-test="gantt-warnings"
        >
          @for (w of warnings(); track w) {
            <div>{{ w }}</div>
          }
        </div>
      }

      @if (legendItems().length) {
        <div
          class="shrink-0 px-3 py-1 flex flex-wrap gap-x-3 gap-y-1 border-b hairline bg-paper text-xs text-muted-foreground"
          data-test="gantt-worktype-legend"
        >
          @for (item of legendItems(); track item.id) {
            <span class="inline-flex items-center gap-1">
              <span
                class="w-2.5 h-2.5 rounded-sm border hairline shrink-0"
                [style.background]="item.color"
              ></span>
              {{ item.name }}
            </span>
          }
        </div>
      }

      @if (!bars().length) {
        <div
          class="shrink-0 px-3 py-1 text-[13px] text-muted-foreground border-b hairline bg-paper"
          data-test="gantt-empty"
          role="status"
        >
          Нет полос оценки — календарь всё равно показан. Выберите заказ слева или заведите состав
          изделия (модули → виды работ с днями).
        </div>
      }

      <div #ganttScroll class="flex-1 min-h-0 overflow-auto gantt-scroll">
        <div class="flex" [style.minWidth.px]="timelineMinWidth()">
          <div
            class="sticky left-0 z-[3] w-52 shrink-0 border-r hairline bg-paper overflow-visible"
          >
            <div
              class="h-10 border-b hairline flex items-center text-[11px] text-muted-foreground"
              data-test="gantt-label-header"
            >
              <span class="gantt-expand-col shrink-0" aria-hidden="true"></span>
              <span class="flex-1 min-w-0 px-2 truncate">{{
                groupByWorkers() ? 'Рабочий' : 'Заказ'
              }}</span>
            </div>
            @for (row of rows(); track row.bar.id) {
              <div
                class="gantt-row-h w-full text-left border-b hairline
                       flex items-stretch min-w-0 overflow-hidden"
                [class.bg-paper-2]="
                  row.alt && row.nestDepth === 0 && !isOrderEmphasized(row.bar.orderId)
                "
                [class.border-t-2]="row.orderBoundary"
                [class.gantt-work-detail-open]="isWorkDetailOpen(row.bar.id)"
                [class.gantt-order-active]="
                  isHighlightedOrder(row.bar.orderId) && !isWorkDetailOpen(row.bar.id)
                "
                [class.gantt-order-expanded]="
                  isTreeExpandedGroup(row.bar) &&
                  !isHighlightedOrder(row.bar.orderId) &&
                  !isWorkDetailOpen(row.bar.id)
                "
                [class.gantt-order-group-start]="row.orderGroupStart"
                [class.gantt-order-group-end]="row.orderGroupEnd"
                [class.gantt-product-group-start]="row.productGroupStart"
                [class.gantt-product-group-end]="row.productGroupEnd"
                [class.gantt-product-group-mid]="row.productGroupMid"
                [class.gantt-module-group-start]="row.moduleGroupStart"
                [class.gantt-module-group-end]="row.moduleGroupEnd"
                [class.gantt-module-group-mid]="row.moduleGroupMid"
                [class.gantt-level-order]="row.rowKind === 'order' || row.rowKind === 'worker'"
                [class.gantt-level-product]="row.rowKind === 'product'"
                [class.gantt-level-module]="row.rowKind === 'module'"
                [class.gantt-level-work]="row.rowKind === 'work'"
                [attr.data-test]="'gantt-label-' + row.bar.id"
                [attr.data-nest-depth]="row.nestDepth"
                [attr.data-row-kind]="row.rowKind"
                [attr.data-active-order]="isHighlightedOrder(row.bar.orderId) ? 'true' : null"
                [attr.data-expanded-order]="isTreeExpandedGroup(row.bar) ? 'true' : null"
                [attr.data-work-detail-open]="isWorkDetailOpen(row.bar.id) ? 'true' : null"
                [attr.data-order-group-start]="row.orderGroupStart ? 'true' : null"
                [attr.data-order-group-end]="row.orderGroupEnd ? 'true' : null"
                [attr.data-product-group-start]="row.productGroupStart ? 'true' : null"
                [attr.data-product-group-end]="row.productGroupEnd ? 'true' : null"
                [attr.data-module-group-start]="row.moduleGroupStart ? 'true' : null"
                [attr.data-module-group-end]="row.moduleGroupEnd ? 'true' : null"
                [attr.data-unassigned-worker]="isUnassignedWorkerSummary(row.bar) ? 'true' : null"
                [attr.data-label-overlay]="isLabelOverlayOpen(row) ? 'true' : null"
                [class.gantt-row-label-overlay]="isLabelOverlayOpen(row)"
              >
                @if (row.isSummary) {
                  <button
                    type="button"
                    class="gantt-expand-btn gantt-expand-col shrink-0 inline-flex items-center justify-center
                           text-ink/80 hover:text-ink hover:bg-paper-2/60"
                    [attr.data-test]="'gantt-expand-' + expandKey(row.bar)"
                    [attr.aria-expanded]="row.expanded"
                    [attr.title]="expandTitle(row.bar, row.expanded)"
                    [attr.aria-label]="expandTitle(row.bar, row.expanded)"
                    (click)="onToggleExpand($event, expandKey(row.bar), row.bar)"
                  >
                    <span aria-hidden="true" class="gantt-chevron font-mono leading-none">{{
                      row.expanded ? '▾' : '▸'
                    }}</span>
                  </button>
                } @else {
                  <button
                    type="button"
                    class="gantt-expand-btn gantt-expand-col shrink-0 inline-flex items-center justify-center
                           text-ink/80 hover:text-ink hover:bg-paper-2/60"
                    [attr.data-test]="'gantt-work-expand-' + row.bar.id"
                    [attr.aria-expanded]="isWorkDetailOpen(row.bar.id)"
                    [attr.title]="workDetailTitle(row.bar, isWorkDetailOpen(row.bar.id))"
                    [attr.aria-label]="workDetailTitle(row.bar, isWorkDetailOpen(row.bar.id))"
                    (click)="onChildWorkToggle($event, row.bar)"
                  >
                    <span aria-hidden="true" class="gantt-chevron font-mono leading-none">{{
                      isWorkDetailOpen(row.bar.id) ? '▾' : '▸'
                    }}</span>
                  </button>
                }
                <div
                  class="gantt-label-wrap flex-1 min-w-0 h-full relative"
                  [class.gantt-label-wrap--open]="isLabelOverlayOpen(row)"
                  (mouseenter)="onLabelPeekEnter($event, row)"
                  (mouseleave)="onLabelPeekLeave()"
                >
                  <button
                    type="button"
                    class="gantt-label-btn flex-1 min-w-0 w-full h-full px-1.5 flex items-center gap-1.5 text-left
                           hover:bg-paper-2"
                    [style.background]="workerLabelWash(row)"
                    (click)="onLabelClick($event, row)"
                    [attr.title]="row.isSummary ? summaryCardTitle(row.bar) : labelTitle(row.bar)"
                    [attr.aria-label]="
                      row.isSummary ? summaryCardTitle(row.bar) : labelTitle(row.bar)
                    "
                    [attr.data-worker-tint]="
                      row.isWorkerSummary && row.bar.accentHue != null
                        ? 'true'
                        : isUnassignedWorkerSummary(row.bar)
                          ? 'unassigned'
                          : null
                    "
                  >
                    @if (row.isOrderSummary && row.bar.productPhotoUrl; as src) {
                      <img
                        [src]="src"
                        alt=""
                        class="w-6 h-6 rounded-sm object-cover border hairline shrink-0"
                        data-test="gantt-photo-order"
                      />
                    } @else if (row.isProductSummary && row.bar.productPhotoUrl; as src) {
                      <img
                        [src]="src"
                        alt=""
                        class="w-6 h-6 rounded-sm object-cover border hairline shrink-0"
                        data-test="gantt-photo-product"
                      />
                    } @else if (row.isModuleSummary && row.bar.modulePhotoUrl; as src) {
                      <img
                        [src]="src"
                        alt=""
                        class="w-6 h-6 rounded-sm object-cover border hairline shrink-0"
                        data-test="gantt-photo-module"
                      />
                    }
                    @if (row.isWorkerSummary && row.bar.accentHue != null) {
                      <span
                        class="w-1.5 h-5 rounded-sm shrink-0"
                        [style.background]="workerChipFill(row.bar.accentHue)"
                        aria-hidden="true"
                      ></span>
                    } @else if (isUnassignedWorkerSummary(row.bar)) {
                      <span
                        class="w-1.5 h-5 rounded-sm shrink-0 border border-dashed border-amber-700/50 dark:border-amber-400/50"
                        [style.background]="GANTT_UNASSIGNED_CHIP_FILL"
                        aria-hidden="true"
                      ></span>
                    } @else if (!row.isSummary) {
                      <span
                        class="w-1.5 h-5 rounded-sm shrink-0"
                        [style.background]="
                          row.bar.noTerm
                            ? 'transparent'
                            : fill(row.bar.workTypeId, row.bar.accentHue)
                        "
                        [class.border]="row.bar.noTerm"
                        [class.border-dashed]="row.bar.noTerm"
                        [attr.title]="row.bar.workTypeName"
                        aria-hidden="true"
                      ></span>
                    }
                    <span class="gantt-label-text min-w-0 flex-1 truncate text-xs leading-none">
                      @if (row.isOrderSummary || row.isWorkerSummary) {
                        <span class="font-medium text-ink">{{ row.bar.orderNumber }}</span>
                      } @else if (row.isProductSummary) {
                        <span class="font-medium text-ink">{{ row.bar.productName }}</span>
                        @if (row.bar.quantityLabel) {
                          <span class="font-mono text-muted-foreground">
                            {{ row.bar.quantityLabel }}</span
                          >
                        }
                      } @else if (row.isModuleSummary) {
                        <span class="text-ink/85">{{ row.bar.moduleName }}</span>
                      } @else {
                        <span class="text-muted-foreground">{{ row.bar.workTypeName }}</span>
                        @if (row.bar.quantityLabel) {
                          <span class="font-mono text-muted-foreground">
                            {{ row.bar.quantityLabel }}</span
                          >
                        }
                      }
                    </span>
                  </button>
                  @if (isLabelOverlayOpen(row)) {
                    <div
                      class="gantt-label-overlay text-xs leading-none"
                      [class]="labelOverlayLevelClass(row)"
                      [attr.data-test]="'gantt-label-overlay-' + row.bar.id"
                      aria-hidden="true"
                    >
                      {{ labelOverlayText(row) }}
                    </div>
                  }
                </div>
              </div>
              @if (row.isOrderSummary && orderMetaFor(row.bar.orderId); as meta) {
                <div
                  class="gantt-row-h-meta gantt-cascade-panel border-b hairline px-3 py-1.5 flex flex-nowrap items-center gap-x-4 min-w-0"
                  [class.gantt-order-group-mid]="isTreeExpandedGroup(row.bar)"
                  [style.minWidth.px]="timelineMinWidth()"
                  [attr.data-test]="'gantt-order-meta-' + row.bar.orderId"
                  (click)="$event.stopPropagation()"
                >
                  <div
                    class="text-[10px] text-muted-foreground shrink-0"
                    data-test="gantt-order-meta-status"
                  >
                    Статус заказа: {{ statusLabel(meta.status) }}
                  </div>
                  <label class="flex items-center gap-1.5 text-[11px] shrink-0">
                    <span class="text-muted-foreground shrink-0">Важность</span>
                    <select
                      class="pi-input !py-0.5 !text-xs w-28"
                      [value]="priorityDraft()"
                      [disabled]="!canEditOrder()"
                      (change)="onMetaPriority($event)"
                      data-test="gantt-order-meta-priority"
                      [attr.aria-label]="'Важность заказа ' + meta.number"
                    >
                      @for (p of metaPriorities; track p.value) {
                        <option [value]="p.value">{{ p.label }}</option>
                      }
                    </select>
                  </label>
                  <label class="flex items-center gap-1.5 text-[11px] shrink-0">
                    <span class="text-muted-foreground shrink-0">Начало плана</span>
                    <input
                      type="date"
                      class="pi-input !py-0.5 !text-xs"
                      [value]="plannedDraft()"
                      [disabled]="!canEditOrder()"
                      (change)="onMetaPlanned($event)"
                      data-test="gantt-order-meta-planned"
                      [attr.aria-label]="'Начало плана заказа ' + meta.number"
                    />
                  </label>
                  @if (!canEditOrder()) {
                    <p class="text-[10px] text-muted-foreground shrink-0">
                      Правка заказа — роли admin / manager
                    </p>
                  }
                  <a
                    class="text-[10px] underline-offset-2 hover:underline text-ink shrink-0"
                    [routerLink]="['/orders']"
                    [queryParams]="{ q: meta.number }"
                    data-test="gantt-order-meta-open-order"
                    >Открыть в списке заказов</a
                  >
                </div>
              }
              @if (isWorkDetailOpen(row.bar.id)) {
                <div
                  class="gantt-row-h-detail gantt-cascade-panel border-b hairline px-3 py-1.5 flex flex-nowrap items-center gap-x-4 min-w-0"
                  [style.minWidth.px]="timelineMinWidth()"
                  [style.background]="workDetailWash(row.bar)"
                  [attr.data-test]="'gantt-work-detail-' + row.bar.id"
                  (click)="$event.stopPropagation()"
                >
                  <div
                    class="flex items-center gap-1.5 text-[10px] text-muted-foreground shrink-0"
                    [attr.data-test]="'gantt-work-detail-people-' + row.bar.id"
                  >
                    <span>Люди:</span>
                    <a
                      routerLink="/registries/workers"
                      class="underline underline-offset-2 hover:text-ink"
                      [attr.data-test]="'gantt-work-detail-worker-link-' + row.bar.id"
                    >{{ row.bar.workerLabel }}</a>
                    @if (row.bar.workerLabel === 'Не назначен') {
                      <span class="text-hint-warn">(не назначено)</span>
                    }
                  </div>
                  <div
                    class="flex items-center gap-1.5 text-[11px] shrink-0"
                    [attr.data-test]="'gantt-worker-assignment-' + row.bar.id"
                  >
                    <span class="text-muted-foreground shrink-0">Исполнители</span>
                    <span class="inline-flex flex-wrap items-center gap-1 max-w-72">
                      @for (person of workerCandidatesFor(row.bar); track person._id) {
                        <label class="inline-flex items-center gap-1 rounded-sm border hairline px-1.5 py-0.5">
                          <input
                            type="checkbox"
                            [checked]="workerDraftFor(row.bar).includes(person._id)"
                            [disabled]="!canEdit() || readOnly() || groupByWorkers() || workerAssignmentSaving()"
                            (change)="onWorkerToggle(row.bar, person._id, $event)"
                            [attr.data-test]="'gantt-worker-option-' + row.bar.id + '-' + person._id"
                          />
                          <span>{{ personDisplayName(person) }}</span>
                        </label>
                      } @empty {
                        <span class="text-muted-foreground">Нет активных людей с этим навыком</span>
                      }
                    </span>
                    <button
                      type="button"
                      class="text-[10px] underline-offset-2 hover:underline text-ink shrink-0 pi-focus-ring disabled:opacity-50"
                      [disabled]="!canEdit() || readOnly() || groupByWorkers() || workerAssignmentSaving()"
                      (click)="onWorkerSave(row.bar, $event)"
                      [attr.data-test]="'gantt-worker-save-' + row.bar.id"
                    >
                      Сохранить
                    </button>
                  </div>
                  <label class="flex items-center gap-1.5 text-[11px] shrink-0">
                    <span class="text-muted-foreground shrink-0">Дни</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      class="pi-input !py-0.5 !text-xs w-14"
                      [value]="row.bar.days ?? ''"
                      [disabled]="!canEdit() || readOnly() || groupByWorkers()"
                      (change)="onWorkDaysChange(row.bar, $event)"
                      [attr.data-test]="'gantt-work-detail-days-' + row.bar.id"
                      [attr.aria-label]="'Дни оценки «' + row.bar.workTypeName + '»'"
                    />
                  </label>
                  <p
                    class="text-[10px] text-muted-foreground/80 leading-tight truncate min-w-0 flex-1"
                  >
                    {{ overrideHint }}
                  </p>
                </div>
              }
            } @empty {
              @for (ph of emptyPlaceholders; track ph) {
                <div
                  class="gantt-row-h px-2 text-xs border-b hairline text-muted-foreground/70
                         flex items-center"
                  [class.bg-paper-2]="ph % 2 === 1"
                  data-test="gantt-placeholder-row"
                >
                  <span class="truncate">—</span>
                </div>
              }
            }
          </div>

          <div class="gantt-calendar-pane relative flex-1 min-w-0 bg-paper-2">
            <div
              class="relative h-10 border-b hairline sticky top-0 bg-paper-2 z-10"
              data-test="gantt-scale"
            >
              @for (tick of scaleTicks(); track tick.key) {
                <div
                  class="absolute top-0 bottom-0 border-l hairline text-[10px] text-muted-foreground pl-0.5 overflow-hidden flex flex-col justify-center leading-tight"
                  [style.left.px]="tick.leftPx"
                  [style.width.px]="tick.widthPx"
                  [attr.data-test]="'gantt-tick-' + tick.key"
                >
                  @if (tick.weekdayLabel) {
                    <span class="block" data-test="gantt-tick-date">{{ tick.dateLabel }}</span>
                    <span class="block" data-test="gantt-tick-weekday">{{
                      tick.weekdayLabel
                    }}</span>
                  } @else {
                    {{ tick.label }}
                  }
                </div>
              }
              <div
                class="absolute top-0 bottom-0 w-px bg-destructive/70 z-[1]"
                #todayMarker
                [class.gantt-today-pulse]="todayPulse()"
                [attr.data-pulse]="todayPulse() ? 'true' : null"
                [style.left.px]="todayLeftPx()"
                title="Сегодня"
                data-test="gantt-today-marker"
              ></div>
            </div>

            @for (row of rows(); track row.bar.id) {
              <div
                class="relative gantt-row-h border-b hairline"
                [class.bg-paper-2]="
                  row.alt && row.nestDepth === 0 && !isOrderEmphasized(row.bar.orderId)
                "
                [class.border-t-2]="row.orderBoundary"
                [class.gantt-work-detail-open]="isWorkDetailOpen(row.bar.id)"
                [class.gantt-order-active]="
                  isHighlightedOrder(row.bar.orderId) && !isWorkDetailOpen(row.bar.id)
                "
                [class.gantt-order-expanded]="
                  isTreeExpandedGroup(row.bar) &&
                  !isHighlightedOrder(row.bar.orderId) &&
                  !isWorkDetailOpen(row.bar.id)
                "
                [class.gantt-order-group-start]="row.orderGroupStart"
                [class.gantt-order-group-end]="row.orderGroupEnd"
                [class.gantt-product-group-start]="row.productGroupStart"
                [class.gantt-product-group-end]="row.productGroupEnd"
                [class.gantt-product-group-mid]="row.productGroupMid"
                [class.gantt-module-group-start]="row.moduleGroupStart"
                [class.gantt-module-group-end]="row.moduleGroupEnd"
                [class.gantt-module-group-mid]="row.moduleGroupMid"
                [class.gantt-level-order]="row.rowKind === 'order' || row.rowKind === 'worker'"
                [class.gantt-level-product]="row.rowKind === 'product'"
                [class.gantt-level-module]="row.rowKind === 'module'"
                [class.gantt-level-work]="row.rowKind === 'work'"
                [attr.data-test]="'gantt-row-' + row.bar.id"
                [attr.data-row-kind]="row.rowKind"
                [attr.data-active-order]="isHighlightedOrder(row.bar.orderId) ? 'true' : null"
                [attr.data-expanded-order]="isTreeExpandedGroup(row.bar) ? 'true' : null"
                [attr.data-work-detail-open]="isWorkDetailOpen(row.bar.id) ? 'true' : null"
                [attr.data-order-group-start]="row.orderGroupStart ? 'true' : null"
                [attr.data-order-group-end]="row.orderGroupEnd ? 'true' : null"
                [attr.data-product-group-start]="row.productGroupStart ? 'true' : null"
                [attr.data-product-group-end]="row.productGroupEnd ? 'true' : null"
                [attr.data-module-group-start]="row.moduleGroupStart ? 'true' : null"
                [attr.data-module-group-end]="row.moduleGroupEnd ? 'true' : null"
              >
                @for (grid of dayGrid(); track grid.key) {
                  <div
                    class="absolute top-0 bottom-0 border-l hairline opacity-40"
                    [style.left.px]="grid.leftPx"
                  ></div>
                }
                <div
                  class="absolute top-1.5 bottom-1.5 rounded-sm text-[10px] px-1.5 flex items-center overflow-hidden text-ink/90 group/bar"
                  [class.border]="row.bar.noTerm || row.isSummary"
                  [class.border-dashed]="row.bar.noTerm"
                  [class.border-muted-foreground]="row.bar.noTerm || row.isSummary"
                  [class.ring-1]="
                    isResizingBar(row.bar.id) ||
                    isMovingOrder(row.bar.orderId) ||
                    isMovingBar(row.bar.id)
                  "
                  [class.ring-ink]="
                    isResizingBar(row.bar.id) ||
                    isMovingOrder(row.bar.orderId) ||
                    isMovingBar(row.bar.id)
                  "
                  [class.cursor-grab]="
                    canMoveBar(row.bar) &&
                    !isMovingOrder(row.bar.orderId) &&
                    !isMovingBar(row.bar.id)
                  "
                  [class.cursor-grabbing]="
                    isMovingOrder(row.bar.orderId) || isMovingBar(row.bar.id)
                  "
                  [style.left.px]="displayLeftPx(row)"
                  [style.width.px]="displayWidthPx(row)"
                  [style.background]="barFill(row)"
                  [style.backgroundImage]="
                    row.bar.noTerm
                      ? 'repeating-linear-gradient(135deg, transparent, transparent 4px, oklch(0.7 0.02 250 / 0.35) 4px, oklch(0.7 0.02 250 / 0.35) 8px)'
                      : null
                  "
                  [attr.title]="barTitle(row.bar)"
                  [attr.aria-label]="barAriaLabel(row.bar)"
                  [attr.data-test]="
                    row.isSummary
                      ? 'gantt-bar-summary'
                      : row.bar.noTerm
                        ? 'gantt-bar-no-term'
                        : 'gantt-bar'
                  "
                  (pointerdown)="onMovePointerDown($event, row.bar)"
                >
                  @if (!row.bar.noTerm) {
                    <span class="truncate" data-test="gantt-bar-days-label"
                      >{{ displayDays(row) }}д</span
                    >
                    @if (isResizingBar(row.bar.id)) {
                      <span
                        class="ml-1 shrink-0 text-[9px] opacity-80"
                        data-test="gantt-resize-hint"
                        >оценка · не факт</span
                      >
                    }
                  } @else {
                    <span class="truncate text-muted-foreground">без срока</span>
                  }
                  @if (canResizeBar(row.bar)) {
                    <button
                      type="button"
                      class="gantt-resize-handle absolute top-0 bottom-0 right-0 w-2.5 -mr-px
                             cursor-ew-resize border-0 p-0 bg-ink/25 hover:bg-ink/45
                             opacity-0 group-hover/bar:opacity-100 focus-visible:opacity-100
                             pi-focus-ring"
                      [class.opacity-100]="isResizingBar(row.bar.id)"
                      [attr.data-test]="'gantt-resize-handle-' + row.bar.id"
                      [attr.aria-label]="
                        'Изменить длительность «' + row.bar.workTypeName + '» (оценка · не факт)'
                      "
                      (pointerdown)="onResizePointerDown($event, row)"
                      (click)="$event.stopPropagation()"
                    ></button>
                  }
                </div>
              </div>
              @if (row.isOrderSummary && isOrderMetaOpen(row.bar.orderId)) {
                <div
                  class="relative gantt-row-h-meta gantt-cascade-spacer border-b hairline"
                  [class.gantt-order-group-mid]="isTreeExpandedGroup(row.bar)"
                  [attr.data-test]="'gantt-order-meta-timeline-' + row.bar.orderId"
                  aria-hidden="true"
                ></div>
              }
              @if (isWorkDetailOpen(row.bar.id)) {
                <div
                  class="relative gantt-row-h-detail gantt-cascade-spacer border-b hairline"
                  [attr.data-test]="'gantt-work-detail-timeline-' + row.bar.id"
                  aria-hidden="true"
                ></div>
              }
            } @empty {
              @for (ph of emptyPlaceholders; track ph) {
                <div
                  class="relative gantt-row-h border-b hairline"
                  [class.bg-paper-2]="ph % 2 === 1"
                >
                  @for (grid of dayGrid(); track grid.key) {
                    <div
                      class="absolute top-0 bottom-0 border-l hairline opacity-40"
                      [style.left.px]="grid.leftPx"
                    ></div>
                  }
                </div>
              }
            }
          </div>
        </div>
      </div>

    </div>
  `,
  styles: `
    :host {
      /* TZ-PRODUCTION-350 — mono milk ladder (one hue family; L/C steps only). */
      --gantt-level-order: oklch(0.92 0.022 86);
      --gantt-level-product: oklch(0.945 0.016 84);
      --gantt-level-module: oklch(0.965 0.012 82);
      --gantt-level-work: oklch(0.985 0.006 85);
      --gantt-bar-order: ${GANTT_SUMMARY_BAR_FILL.order};
      --gantt-bar-product: ${GANTT_SUMMARY_BAR_FILL.product};
      --gantt-bar-module: ${GANTT_SUMMARY_BAR_FILL.module};
    }
    :host-context(.dark),
    :host-context([data-theme='dark']) {
      --gantt-level-order: oklch(0.26 0.03 86);
      --gantt-level-product: oklch(0.25 0.028 84);
      --gantt-level-module: oklch(0.24 0.024 82);
      --gantt-level-work: oklch(0.27 0.012 85);
      --gantt-bar-order: oklch(0.32 0.04 86);
      --gantt-bar-product: oklch(0.31 0.035 84);
      --gantt-bar-module: oklch(0.3 0.03 82);
    }
    .gantt-row-h {
      height: ${GANTT_ROW_PX}px;
      box-sizing: border-box;
    }
    .gantt-row-h-detail {
      height: ${GANTT_DETAIL_ROW_PX}px;
      box-sizing: border-box;
    }
    .gantt-row-h-meta {
      height: ${GANTT_META_ROW_PX}px;
      box-sizing: border-box;
    }
    .gantt-scroll {
      container-type: inline-size;
      container-name: gantt-scroll;
    }
    /* TZ-NX-GANTT-G8 — cool calendar wash separates timeline from label paper. */
    .gantt-calendar-pane {
      background: var(--color-paper-2);
    }
    :host-context(.dark) .gantt-calendar-pane,
    :host-context([data-theme='dark']) .gantt-calendar-pane {
      background: color-mix(in oklch, var(--color-paper-2) 76%, var(--color-ink));
    }
    /* QA-445E — visible ack when scrollLeft cannot move (short range / already centered). */
    .gantt-today-pulse {
      width: 3px;
      background: var(--color-destructive, oklch(0.55 0.2 25));
      outline: 2px solid
        color-mix(in oklch, var(--color-destructive, oklch(0.55 0.2 25)) 55%, transparent);
      outline-offset: 1px;
      animation: gantt-today-pulse 0.7s ease-out 1;
    }
    @keyframes gantt-today-pulse {
      0% {
        opacity: 1;
      }
      35% {
        opacity: 1;
        width: 4px;
      }
      100% {
        opacity: 0.7;
        width: 3px;
      }
    }
    /* Full-bleed cascade panel: lives in sticky label column, spans label+timeline. */
    .gantt-cascade-panel {
      position: relative;
      z-index: 4;
      box-sizing: border-box;
      width: 100cqw;
      background: oklch(0.97 0.008 95);
    }
    :host-context(.dark) .gantt-cascade-panel,
    :host-context([data-theme='dark']) .gantt-cascade-panel {
      background: oklch(0.27 0.02 260);
    }
    .gantt-cascade-spacer {
      pointer-events: none;
      background: transparent;
    }
    .gantt-expand-col {
      width: 36px; /* dedicated expand hit column ≥36px */
      box-sizing: border-box;
    }
    .gantt-chevron {
      font-size: 15px;
      font-weight: 700;
      line-height: 1;
      color: var(--color-ink, oklch(0.28 0.02 95));
      opacity: 0.88;
    }
    .gantt-expand-btn[aria-expanded='true'] .gantt-chevron {
      opacity: 1;
    }
    /* One row frame: only vertical split after ▸ — no boxed button chrome. */
    .gantt-expand-btn {
      margin: 0;
      padding: 0;
      border: 0;
      border-right: 1px solid var(--color-rule, oklch(0.88 0.01 95));
      border-radius: 0;
      background: transparent;
      box-shadow: none;
      appearance: none;
      -webkit-appearance: none;
    }
    .gantt-expand-btn:focus {
      outline: none;
    }
    .gantt-expand-btn:focus-visible {
      background: color-mix(in oklch, var(--color-paper-2) 80%, transparent);
      color: var(--color-ink, inherit);
    }
    .gantt-label-btn {
      margin: 0;
      border: 0;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
      appearance: none;
      -webkit-appearance: none;
    }
    .gantt-label-btn:focus {
      outline: none;
    }
    .gantt-label-btn:focus-visible {
      background: color-mix(in oklch, var(--color-paper-2) 80%, transparent);
    }
    /* truncated-label-peek — hover / cascade expand when text overflows (see docs/ui-rules.md). */
    .gantt-row-label-overlay.gantt-row-h {
      overflow: visible;
      position: relative;
      z-index: 50;
    }
    .gantt-label-wrap--open {
      z-index: 50;
    }
    .gantt-label-overlay {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      z-index: 50;
      display: flex;
      align-items: center;
      min-width: 100%;
      max-width: 420px;
      padding: 0 0.5rem 0 0.375rem;
      white-space: nowrap;
      border: 1px solid color-mix(in oklch, var(--color-sunrise-warm) 40%, transparent);
      border-left: 0;
      border-radius: 0 0.375rem 0.375rem 0;
      box-shadow:
        0 10px 15px -3px rgb(0 0 0 / 0.1),
        0 4px 6px -4px rgb(0 0 0 / 0.1);
      pointer-events: none;
      animation: gantt-label-overlay-in 140ms ease-out;
    }
    @keyframes gantt-label-overlay-in {
      from {
        opacity: 0;
        transform: translateX(-3px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    .gantt-label-overlay--product {
      background: var(--gantt-level-product);
      color: var(--color-ink, inherit);
      font-weight: 500;
    }
    .gantt-label-overlay--module {
      background: var(--gantt-level-module);
      color: color-mix(in oklch, var(--color-ink, inherit) 85%, transparent);
    }
    [data-nest-depth='1'] .gantt-label-overlay {
      padding-left: calc(0.375rem + ${GANTT_NEST_INDENT_PX}px);
    }
    [data-nest-depth='2'] .gantt-label-overlay {
      padding-left: calc(0.375rem + ${GANTT_NEST_INDENT_PX * 2}px);
    }
    [data-nest-depth='3'] .gantt-label-overlay {
      padding-left: calc(0.375rem + ${GANTT_NEST_INDENT_PX * 3}px);
    }
    /* TZ-PRODUCTION-348: cascade indent — labels only (~15px per depth). */
    [data-nest-depth='1'] .gantt-label-btn {
      padding-left: ${GANTT_NEST_INDENT_PX}px;
    }
    [data-nest-depth='2'] .gantt-label-btn {
      padding-left: ${GANTT_NEST_INDENT_PX * 2}px;
    }
    [data-nest-depth='3'] .gantt-label-btn {
      padding-left: ${GANTT_NEST_INDENT_PX * 3}px;
    }
    /*
     * Level washes (paper milk). Order/product/module/work must stay distinct
     * even under expanded-order frame (no beige flatten via !important).
     */
    .gantt-level-order {
      background: var(--gantt-level-order);
    }
    .gantt-level-product {
      background: var(--gantt-level-product);
    }
    .gantt-level-module {
      background: var(--gantt-level-module);
    }
    .gantt-level-work {
      background: var(--gantt-level-work);
    }
    /* Active order while order-meta strip is open — lighter + bold frame. */
    .gantt-order-active {
      background: oklch(0.995 0.008 95) !important;
      box-shadow: inset 0 0 0 2px oklch(0.45 0.04 85);
      position: relative;
      z-index: 1;
    }
    /* Tree expanded via ▸ — frame only; level washes keep child colors. */
    .gantt-order-expanded {
      position: relative;
      z-index: 1;
    }
    /* Expanded order block frame (summary→children); weaker than meta-active.
       Summary header (group-start) = order cream wash. */
    .gantt-order-group-start {
      background: var(--gantt-level-order) !important;
      box-shadow:
        inset 0 2px 0 0 oklch(0.42 0.05 85),
        inset 2px 0 0 0 oklch(0.42 0.05 85),
        inset -2px 0 0 0 oklch(0.42 0.05 85);
    }
    .gantt-order-group-start.gantt-order-group-end {
      box-shadow: inset 0 0 0 2px oklch(0.42 0.05 85);
      margin-bottom: var(--space-1);
    }
    .gantt-order-group-mid,
    .gantt-order-expanded:not(.gantt-order-group-start):not(.gantt-order-group-end) {
      box-shadow:
        inset 2px 0 0 0 oklch(0.42 0.05 85),
        inset -2px 0 0 0 oklch(0.42 0.05 85);
    }
    .gantt-order-group-end:not(.gantt-order-group-start) {
      box-shadow:
        inset 0 -2px 0 0 oklch(0.42 0.05 85),
        inset 2px 0 0 0 oklch(0.42 0.05 85),
        inset -2px 0 0 0 oklch(0.42 0.05 85);
      margin-bottom: var(--space-1);
    }
    /* Nested product group — milk ladder (hue ~84). */
    .gantt-product-group-start {
      background: var(--gantt-level-product) !important;
      box-shadow:
        inset 0 1px 0 0 oklch(0.48 0.05 84),
        inset 3px 0 0 0 oklch(0.48 0.05 84),
        inset -1px 0 0 0 oklch(0.48 0.05 84);
    }
    .gantt-product-group-mid {
      background: var(--gantt-level-product) !important;
      box-shadow:
        inset 3px 0 0 0 oklch(0.48 0.05 84),
        inset -1px 0 0 0 oklch(0.48 0.05 84);
    }
    .gantt-product-group-end:not(.gantt-product-group-start) {
      background: var(--gantt-level-product) !important;
      box-shadow:
        inset 0 -1px 0 0 oklch(0.48 0.05 84),
        inset 3px 0 0 0 oklch(0.48 0.05 84),
        inset -1px 0 0 0 oklch(0.48 0.05 84);
    }
    .gantt-product-group-start.gantt-product-group-end {
      box-shadow:
        inset 0 0 0 1px oklch(0.48 0.05 84),
        inset 3px 0 0 0 oklch(0.48 0.05 84);
    }
    /* Nested module group — milk ladder (hue ~82). */
    .gantt-module-group-start {
      background: var(--gantt-level-module) !important;
      box-shadow:
        inset 0 1px 0 0 oklch(0.5 0.045 82),
        inset 5px 0 0 0 oklch(0.5 0.045 82),
        inset -1px 0 0 0 oklch(0.5 0.045 82);
    }
    .gantt-module-group-mid {
      background: var(--gantt-level-module) !important;
      box-shadow:
        inset 5px 0 0 0 oklch(0.5 0.045 82),
        inset -1px 0 0 0 oklch(0.5 0.045 82);
    }
    .gantt-module-group-end:not(.gantt-module-group-start) {
      background: var(--gantt-level-module) !important;
      box-shadow:
        inset 0 -1px 0 0 oklch(0.5 0.045 82),
        inset 5px 0 0 0 oklch(0.5 0.045 82),
        inset -1px 0 0 0 oklch(0.5 0.045 82);
    }
    .gantt-module-group-start.gantt-module-group-end {
      box-shadow:
        inset 0 0 0 1px oklch(0.5 0.045 82),
        inset 5px 0 0 0 oklch(0.5 0.045 82);
    }
    /* Work rows keep paper wash — group mid must not flatten WT. */
    .gantt-product-group-mid.gantt-level-work,
    .gantt-product-group-end.gantt-level-work,
    .gantt-module-group-mid.gantt-level-work,
    .gantt-module-group-end.gantt-level-work {
      background: var(--gantt-level-work) !important;
    }
    .gantt-product-group-mid.gantt-level-module,
    .gantt-product-group-end.gantt-level-module:not(.gantt-module-group-start) {
      background: var(--gantt-level-module) !important;
    }
    .gantt-order-active.gantt-order-group-start,
    .gantt-order-active.gantt-order-group-end,
    .gantt-order-active.gantt-order-group-mid {
      /* Meta-active wash + frame win over group chrome / header tint. */
      background: oklch(0.995 0.008 95) !important;
      box-shadow: inset 0 0 0 2px oklch(0.45 0.04 85);
    }
    :host-context(.dark) .gantt-order-active,
    :host-context([data-theme='dark']) .gantt-order-active {
      background: oklch(0.28 0.02 260) !important;
      box-shadow: inset 0 0 0 2px oklch(0.78 0.06 85);
    }
    :host-context(.dark) .gantt-order-group-start,
    :host-context([data-theme='dark']) .gantt-order-group-start {
      background: var(--gantt-level-order) !important;
      box-shadow:
        inset 0 2px 0 0 oklch(0.78 0.07 85),
        inset 2px 0 0 0 oklch(0.78 0.07 85),
        inset -2px 0 0 0 oklch(0.78 0.07 85);
    }
    :host-context(.dark) .gantt-order-active.gantt-order-group-start,
    :host-context(.dark) .gantt-order-active.gantt-order-group-end,
    :host-context(.dark) .gantt-order-active.gantt-order-group-mid,
    :host-context([data-theme='dark']) .gantt-order-active.gantt-order-group-start,
    :host-context([data-theme='dark']) .gantt-order-active.gantt-order-group-end,
    :host-context([data-theme='dark']) .gantt-order-active.gantt-order-group-mid {
      background: oklch(0.28 0.02 260) !important;
      box-shadow: inset 0 0 0 2px oklch(0.78 0.06 85);
    }
    :host-context(.dark) .gantt-order-group-start.gantt-order-group-end,
    :host-context([data-theme='dark']) .gantt-order-group-start.gantt-order-group-end {
      box-shadow: inset 0 0 0 2px oklch(0.78 0.07 85);
    }
    :host-context(.dark) .gantt-order-group-mid,
    :host-context(.dark)
      .gantt-order-expanded:not(.gantt-order-group-start):not(.gantt-order-group-end),
    :host-context([data-theme='dark']) .gantt-order-group-mid,
    :host-context([data-theme='dark'])
      .gantt-order-expanded:not(.gantt-order-group-start):not(.gantt-order-group-end) {
      box-shadow:
        inset 2px 0 0 0 oklch(0.78 0.07 85),
        inset -2px 0 0 0 oklch(0.78 0.07 85);
    }
    :host-context(.dark) .gantt-order-group-end:not(.gantt-order-group-start),
    :host-context([data-theme='dark']) .gantt-order-group-end:not(.gantt-order-group-start) {
      box-shadow:
        inset 0 -2px 0 0 oklch(0.78 0.07 85),
        inset 2px 0 0 0 oklch(0.78 0.07 85),
        inset -2px 0 0 0 oklch(0.78 0.07 85);
    }
    :host-context(.dark) .gantt-product-group-start,
    :host-context([data-theme='dark']) .gantt-product-group-start {
      background: var(--gantt-level-product) !important;
      box-shadow:
        inset 0 1px 0 0 oklch(0.72 0.06 84),
        inset 3px 0 0 0 oklch(0.72 0.06 84),
        inset -1px 0 0 0 oklch(0.72 0.06 84);
    }
    :host-context(.dark) .gantt-product-group-mid,
    :host-context(.dark) .gantt-product-group-end:not(.gantt-product-group-start),
    :host-context([data-theme='dark']) .gantt-product-group-mid,
    :host-context([data-theme='dark']) .gantt-product-group-end:not(.gantt-product-group-start) {
      background: var(--gantt-level-product) !important;
      box-shadow:
        inset 3px 0 0 0 oklch(0.72 0.06 84),
        inset -1px 0 0 0 oklch(0.72 0.06 84);
    }
    :host-context(.dark) .gantt-product-group-end:not(.gantt-product-group-start),
    :host-context([data-theme='dark']) .gantt-product-group-end:not(.gantt-product-group-start) {
      box-shadow:
        inset 0 -1px 0 0 oklch(0.72 0.06 84),
        inset 3px 0 0 0 oklch(0.72 0.06 84),
        inset -1px 0 0 0 oklch(0.72 0.06 84);
    }
    :host-context(.dark) .gantt-module-group-start,
    :host-context([data-theme='dark']) .gantt-module-group-start {
      background: var(--gantt-level-module) !important;
      box-shadow:
        inset 0 1px 0 0 oklch(0.75 0.055 82),
        inset 5px 0 0 0 oklch(0.75 0.055 82),
        inset -1px 0 0 0 oklch(0.75 0.055 82);
    }
    :host-context(.dark) .gantt-module-group-mid,
    :host-context(.dark) .gantt-module-group-end:not(.gantt-module-group-start),
    :host-context([data-theme='dark']) .gantt-module-group-mid,
    :host-context([data-theme='dark']) .gantt-module-group-end:not(.gantt-module-group-start) {
      background: var(--gantt-level-module) !important;
      box-shadow:
        inset 5px 0 0 0 oklch(0.75 0.055 82),
        inset -1px 0 0 0 oklch(0.75 0.055 82);
    }
    :host-context(.dark) .gantt-module-group-end:not(.gantt-module-group-start),
    :host-context([data-theme='dark']) .gantt-module-group-end:not(.gantt-module-group-start) {
      box-shadow:
        inset 0 -1px 0 0 oklch(0.75 0.055 82),
        inset 5px 0 0 0 oklch(0.75 0.055 82),
        inset -1px 0 0 0 oklch(0.75 0.055 82);
    }
    :host-context(.dark) .gantt-chevron,
    :host-context([data-theme='dark']) .gantt-chevron {
      color: oklch(0.92 0.02 95);
      opacity: 0.92;
    }
    /* Work-type detail open — distinct from meta-active / tree-expanded. */
    .gantt-work-detail-open {
      background: oklch(0.96 0.035 85) !important;
      box-shadow: inset 3px 0 0 oklch(0.62 0.12 85);
      position: relative;
      z-index: 2;
    }
    :host-context(.dark) .gantt-work-detail-open,
    :host-context([data-theme='dark']) .gantt-work-detail-open {
      background: oklch(0.3 0.04 85) !important;
      box-shadow: inset 3px 0 0 oklch(0.72 0.1 85);
    }
    .gantt-resize-handle {
      touch-action: none;
    }
  `,
  providers: [GanttBarsFacade],
})
export class GanttBarsComponent implements AfterViewInit {
  protected readonly facade = inject(GanttBarsFacade);
  protected readonly personDisplayName = personDisplayName;
  /** Work-type bars from buildGanttBars (not pre-built summaries). */
  readonly bars = input.required<GanttBar[]>();
  readonly rangeStart = input.required<string>();
  readonly rangeEnd = input.required<string>();
  readonly zoom = input<GanttZoom>('day');
  readonly warnings = input<string[]>([]);
  readonly usedTodayFallback = input(false);
  readonly readOnly = input(false);
  /** production:write (or equivalent) — required for resize handles. */
  readonly canEdit = input(false);
  readonly today = input(formatDateOnly(new Date()));
  /** Parent command after range changes: scroll marker, range start, or a bar id into view. */
  readonly scrollRequest = input<{
    target: 'today' | 'start' | 'bar';
    nonce: number;
    /** G4 — bar id to bring into view (plannedDate/startOffset commit). */
    barId?: string;
  } | null>(null);
  /** TZ-PRODUCTION-314 — which orders show product children. */
  readonly expandedOrderIds = input<ReadonlySet<string>>(new Set());
  /** TZ-PRODUCTION-342 — product / module expand keys. */
  readonly expandedProductIds = input<ReadonlySet<string>>(new Set());
  readonly expandedModuleIds = input<ReadonlySet<string>>(new Set());
  /** TZ-PRODUCTION-344 — worker / worker-module expand keys. */
  readonly expandedWorkerIds = input<ReadonlySet<string>>(new Set());
  readonly expandedWorkerModuleIds = input<ReadonlySet<string>>(new Set());
  /** TZ-PRODUCTION-321 — one open work-type detail (`bar.id`). */
  readonly expandedWorkBarId = input<string | null>(null);
  /** Active workers with the current Work Type skill, keyed by workTypeId. */
  readonly workerCandidates = input<ReadonlyMap<string, readonly Person[]>>(new Map());
  /** Parent blocks duplicate assignment PATCHes while refreshing bars. */
  readonly workerAssignmentSaving = input(false);
  /** Order id with open order-meta strip — highlight label + timeline rows. */
  readonly highlightOrderId = input<string | null>(null);
  /** TZ-PRODUCTION-322 — live order fields for the meta strip under summary. */
  readonly orderMeta = input<GanttOrderMetaView | null>(null);
  /** Mirror BE @Roles(admin|manager) for order PATCH. */
  readonly canEditOrder = input(false);
  /** TZ-GANTT-401 — group rows by workerLabel instead of order (read-only view). */
  readonly groupByWorkers = input(false);
  /**
   * TZ-PRODUCTION-319/322 — left summary order label only (toggle meta in parent).
   * Child labels and timeline bars do not emit this.
   */
  readonly orderLabelClick = output<string>();
  /** Empty canvas / non-control click → parent collapses trees + meta + work-detail. */
  readonly dismissCanvas = output<void>();
  readonly toggleExpand = output<string>();
  /** TZ-PRODUCTION-348 — toolbar zoom / group / fit (parent owns state). */
  readonly zoomChange = output<GanttZoom>();
  readonly groupByChange = output<GanttGroupBy>();
  readonly fit = output<void>();
  /** Child work-type label / ▸ → parent toggles work-detail for this bar.id. */
  readonly toggleWorkDetail = output<string>();
  /** Commit snapped days → parent PATCHes order estimate-days only. */
  readonly estimateDaysCommit = output<GanttEstimateDaysCommit>();
  /** Explicit worker assignment → parent PATCHes order estimateWorkerOverrides. */
  readonly workerAssignmentCommit = output<GanttWorkerAssignmentCommit>();
  /** Body-drag on summary → parent PATCHes order plannedDate (whole chain). */
  readonly plannedDateMoveCommit = output<GanttPlannedDateMoveCommit>();
  /** Child body-drag → parent PATCHes estimate-start offset. */
  readonly startOffsetCommit = output<GanttStartOffsetCommit>();
  /** Order-meta change → parent PATCHes orders/:id (priority + plannedDate), silent. */
  readonly orderMetaCommit = output<GanttOrderMetaCommit>();

  protected readonly emptyPlaceholders = [0, 1, 2, 3, 4, 5] as const;
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly hostRef = inject(ElementRef<HTMLElement>);
  private readonly ganttScroll = viewChild<ElementRef<HTMLElement>>('ganttScroll');
  private readonly todayMarker = viewChild<ElementRef<HTMLElement>>('todayMarker');
  protected readonly overrideHint = ESTIMATE_OVERRIDE_HINT_RU;

  // ─── delegated state (same field names/shape as before extraction — zero template rewrite) ───
  protected readonly metaPriorities = this.facade.metaPriorities;
  protected readonly priorityDraft = this.facade.priorityDraft;
  protected readonly plannedDraft = this.facade.plannedDraft;
  /** QA-445E — flash red today line so «Сегодня» is never a silent no-op. */
  protected readonly todayPulse = this.facade.todayPulse;
  protected readonly totalDays = this.facade.totalDays;
  protected readonly pxPerDay = this.facade.pxPerDay;
  protected readonly timelineMinWidth = this.facade.timelineMinWidth;
  protected readonly dayGrid = this.facade.dayGrid;
  protected readonly treeBars = this.facade.treeBars;
  protected readonly unassignedSummary = this.facade.unassignedSummary;
  protected readonly legendItems = this.facade.legendItems;
  protected readonly scaleTicks = this.facade.scaleTicks;
  protected readonly rows = this.facade.rows;
  protected readonly todayLeftPx = this.facade.todayLeftPx;

  constructor() {
    const host: GanttBarsFacadeHost = {
      bars: this.bars,
      rangeStart: this.rangeStart,
      rangeEnd: this.rangeEnd,
      zoom: this.zoom,
      readOnly: this.readOnly,
      canEdit: this.canEdit,
      today: this.today,
      expandedOrderIds: this.expandedOrderIds,
      expandedProductIds: this.expandedProductIds,
      expandedModuleIds: this.expandedModuleIds,
      expandedWorkerIds: this.expandedWorkerIds,
      expandedWorkerModuleIds: this.expandedWorkerModuleIds,
      expandedWorkBarId: this.expandedWorkBarId,
      workerCandidates: this.workerCandidates,
      workerAssignmentSaving: this.workerAssignmentSaving,
      highlightOrderId: this.highlightOrderId,
      orderMeta: this.orderMeta,
      canEditOrder: this.canEditOrder,
      groupByWorkers: this.groupByWorkers,
      orderLabelClick: this.orderLabelClick,
      dismissCanvas: this.dismissCanvas,
      toggleExpand: this.toggleExpand,
      toggleWorkDetail: this.toggleWorkDetail,
      estimateDaysCommit: this.estimateDaysCommit,
      workerAssignmentCommit: this.workerAssignmentCommit,
      plannedDateMoveCommit: this.plannedDateMoveCommit,
      startOffsetCommit: this.startOffsetCommit,
      orderMetaCommit: this.orderMetaCommit,
    };
    this.facade.bind(host);
    effect(() => {
      const request = this.scrollRequest();
      if (!request) return;
      afterNextRender(
        () => {
          if (request.target === 'today') this.scrollToToday();
          else if (request.target === 'bar') this.scrollToBar(request.barId ?? null);
          else this.scrollToStart();
        },
        { injector: this.injector },
      );
    });
  }

  protected readonly GANTT_UNASSIGNED_CHIP_FILL = GANTT_UNASSIGNED_CHIP_FILL;

  ngAfterViewInit(): void {
    const scroll = this.ganttScroll()?.nativeElement;
    if (!scroll) return;
    const onScroll = (): void => this.facade.closeLabelOverlay();
    scroll.addEventListener('scroll', onScroll, { passive: true });
    this.destroyRef.onDestroy(() => scroll.removeEventListener('scroll', onScroll));
    const updateViewportWidth = (): void => {
      this.facade.timelineViewportWidth.set(Math.max(0, scroll.clientWidth - GANTT_LABEL_COL_PX));
    };
    if (typeof ResizeObserver === 'undefined') {
      updateViewportWidth();
      return;
    }
    const observer = new ResizeObserver(updateViewportWidth);
    observer.observe(scroll);
    updateViewportWidth();
    this.destroyRef.onDestroy(() => observer.disconnect());
  }

  /** Scroll the marker into the visible timeline viewport (Сегодня) + pulse ack. */
  scrollToToday(): void {
    this.scrollToMarker(this.todayMarker()?.nativeElement ?? null);
    this.facade.pulseTodayMarker();
  }

  /** G4 — public re-anchor used by the page after optimistic shift commits. */
  scrollToBarId(barId: string | null): void {
    this.scrollToBar(barId);
  }

  /** Reveal the beginning of the fitted bars range. */
  scrollToStart(): void {
    const scroll = this.ganttScroll()?.nativeElement;
    if (!scroll) return;
    if (typeof scroll.scrollTo === 'function') scroll.scrollTo({ left: 0, behavior: 'auto' });
    else scroll.scrollLeft = 0;
  }

  /**
   * G4 — after an optimistic plannedDate/startOffset commit, bring the moved bar's
   * row into the horizontal viewport (clamped by calculateCenteredMarkerScrollLeft
   * semantics) so the timeline never «залипает» справа от ранних дат.
   */
  private scrollToBar(barId: string | null): void {
    const scroll = this.ganttScroll()?.nativeElement;
    if (!scroll || !barId) return;
    const marker = scroll.querySelector<HTMLElement>(`[data-test="gantt-row-${barId}"]`);
    if (!marker) return;
    const scrollRect = scroll.getBoundingClientRect();
    const markerRect = marker.getBoundingClientRect();
    const left = calculateCenteredMarkerScrollLeft({
      scrollLeft: scroll.scrollLeft,
      scrollWidth: scroll.scrollWidth,
      clientWidth: scroll.clientWidth,
      scrollLeftEdge: scrollRect.left,
      markerLeft: markerRect.left,
      markerWidth: markerRect.width,
    });
    if (typeof scroll.scrollTo === 'function') scroll.scrollTo({ left, behavior: 'auto' });
    else scroll.scrollLeft = left;
  }

  private scrollToMarker(marker: HTMLElement | null): void {
    const scroll = this.ganttScroll()?.nativeElement;
    if (!scroll || !marker) return;
    const scrollRect = scroll.getBoundingClientRect();
    const markerRect = marker.getBoundingClientRect();
    const left = calculateCenteredMarkerScrollLeft({
      scrollLeft: scroll.scrollLeft,
      scrollWidth: scroll.scrollWidth,
      clientWidth: scroll.clientWidth,
      scrollLeftEdge: scrollRect.left,
      markerLeft: markerRect.left,
      markerWidth: markerRect.width,
    });
    if (typeof scroll.scrollTo === 'function') scroll.scrollTo({ left, behavior: 'auto' });
    else scroll.scrollLeft = left;
  }

  // ─── DOM-bound label-peek (needs hostRef / event.currentTarget — stays component-side) ───
  protected onLabelPeekEnter(
    event: MouseEvent,
    row: { isProductSummary: boolean; isModuleSummary: boolean; bar: GanttBar },
  ): void {
    if (!this.facade.supportsLabelOverlay(row)) return;
    const wrap = event.currentTarget;
    if (!(wrap instanceof HTMLElement)) return;
    const textEl = wrap.querySelector('.gantt-label-text');
    if (!(textEl instanceof HTMLElement) || !this.isTextTruncated(textEl)) return;
    this.facade.openLabelPeek(row.bar.id);
  }

  protected onLabelPeekLeave(): void {
    this.facade.onLabelPeekLeave();
  }

  private isTextTruncated(el: HTMLElement): boolean {
    return el.scrollWidth > el.clientWidth + 1;
  }

  private tryOpenTruncatedLabelPeek(barId: string): void {
    const textEl = this.hostRef.nativeElement.querySelector(
      `[data-test="gantt-label-${barId}"] .gantt-label-text`,
    );
    if (textEl instanceof HTMLElement && this.isTextTruncated(textEl)) {
      this.facade.openLabelPeek(barId);
    }
  }

  private scheduleTruncatedLabelPeek(barId: string): void {
    afterNextRender(() => this.tryOpenTruncatedLabelPeek(barId), { injector: this.injector });
  }

  private scheduleFirstTruncatedChildPeek(orderId: string): void {
    afterNextRender(
      () => {
        for (const row of this.rows()) {
          if (row.bar.orderId !== orderId) continue;
          if (!row.isProductSummary && !row.isModuleSummary) continue;
          this.tryOpenTruncatedLabelPeek(row.bar.id);
          return;
        }
      },
      { injector: this.injector },
    );
  }

  // ─── template-referenced delegates (thin wrappers to facade — zero template rewrite) ───
  protected canResizeBar(bar: GanttBar): boolean {
    return this.facade.canResizeBar(bar);
  }

  protected canMoveBar(bar: GanttBar): boolean {
    return this.facade.canMoveBar(bar);
  }

  protected isResizingBar(barId: string): boolean {
    return this.facade.isResizingBar(barId);
  }

  protected isMovingOrder(orderId: string): boolean {
    return this.facade.isMovingOrder(orderId);
  }

  protected isMovingBar(barId: string): boolean {
    return this.facade.isMovingBar(barId);
  }

  protected displayDays(row: { bar: GanttBar; baseSpanDays: number }): number {
    return this.facade.displayDays(row);
  }

  protected displayWidthPx(row: { bar: GanttBar; widthPx: number; baseSpanDays: number }): number {
    return this.facade.displayWidthPx(row);
  }

  protected displayLeftPx(row: { bar: GanttBar; leftPx: number }): number {
    return this.facade.displayLeftPx(row);
  }

  protected barFill(row: { bar: GanttBar; isSummary: boolean; rowKind: GanttRowKind }): string {
    return this.facade.barFill(row);
  }

  protected workerLabelWash(row: { isWorkerSummary: boolean; bar: GanttBar }): string | null {
    return this.facade.workerLabelWash(row);
  }

  protected isUnassignedWorkerSummary(bar: GanttBar): boolean {
    return this.facade.isUnassignedWorkerSummary(bar);
  }

  protected unassignedWorkTypeNamesPreview(): string {
    return this.facade.unassignedWorkTypeNamesPreview();
  }

  protected onToggleExpand(event: Event, expandId: string, bar: GanttBar): void {
    const { expanding } = this.facade.onToggleExpand(event, expandId, bar);
    if (!expanding) return;
    if (isProductSummaryBar(bar) || isModuleSummaryBar(bar)) {
      this.scheduleTruncatedLabelPeek(bar.id);
      return;
    }
    if (isOrderSummaryBar(bar)) {
      this.scheduleFirstTruncatedChildPeek(bar.orderId);
    }
  }

  protected expandKey(bar: GanttBar): string {
    return this.facade.expandKey(bar);
  }

  protected treeLabel(bar: GanttBar): string {
    return this.facade.treeLabel(bar);
  }

  protected onChildWorkToggle(event: Event, bar: GanttBar): void {
    this.facade.onChildWorkToggle(event, bar);
  }

  protected workerCandidatesFor(bar: GanttBar): readonly Person[] {
    return this.facade.workerCandidatesFor(bar);
  }

  protected workerDraftFor(bar: GanttBar): readonly string[] {
    return this.facade.workerDraftFor(bar);
  }

  protected onWorkerToggle(bar: GanttBar, workerId: string, event: Event): void {
    this.facade.onWorkerToggle(bar, workerId, event);
  }

  protected onWorkerSave(bar: GanttBar, event: Event): void {
    this.facade.onWorkerSave(bar, event);
  }

  protected isWorkDetailOpen(barId: string): boolean {
    return this.facade.isWorkDetailOpen(barId);
  }

  protected isOrderMetaOpen(orderId: string): boolean {
    return this.facade.isOrderMetaOpen(orderId);
  }

  protected orderMetaFor(orderId: string): GanttOrderMetaView | null {
    return this.facade.orderMetaFor(orderId);
  }

  protected isHighlightedOrder(orderId: string): boolean {
    return this.facade.isHighlightedOrder(orderId);
  }

  protected isTreeExpandedOrder(orderId: string): boolean {
    return this.facade.isTreeExpandedOrder(orderId);
  }

  protected isTreeExpandedGroup(bar: GanttBar): boolean {
    return this.facade.isTreeExpandedGroup(bar);
  }

  protected isOrderEmphasized(orderId: string): boolean {
    return this.facade.isOrderEmphasized(orderId);
  }

  protected onRootClick(event: MouseEvent): void {
    this.facade.onRootClick(event);
  }

  protected supportsLabelOverlay(row: { isProductSummary: boolean; isModuleSummary: boolean }): boolean {
    return this.facade.supportsLabelOverlay(row);
  }

  protected isLabelOverlayOpen(row: { bar: GanttBar }): boolean {
    return this.facade.isLabelOverlayOpen(row);
  }

  protected labelOverlayText(row: {
    isProductSummary: boolean;
    isModuleSummary: boolean;
    bar: GanttBar;
  }): string {
    return this.facade.labelOverlayText(row);
  }

  protected labelOverlayLevelClass(row: { rowKind: string }): string {
    return this.facade.labelOverlayLevelClass(row);
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    this.facade.onDocumentClick(event);
  }

  protected onLabelClick(
    event: Event,
    row: { isSummary: boolean; bar: GanttBar; isProductSummary: boolean; isModuleSummary: boolean },
  ): void {
    this.facade.onLabelClick(event, row);
  }

  protected workDetailTitle(bar: GanttBar, open: boolean): string {
    return this.facade.workDetailTitle(bar, open);
  }

  protected workDetailWash(bar: GanttBar): string {
    return this.facade.workDetailWash(bar);
  }

  protected onWorkDaysChange(bar: GanttBar, ev: Event): void {
    this.facade.onWorkDaysChange(bar, ev);
  }

  protected onMetaPriority(ev: Event): void {
    this.facade.onMetaPriority(ev);
  }

  protected onMetaPlanned(ev: Event): void {
    this.facade.onMetaPlanned(ev);
  }

  protected onMovePointerDown(event: PointerEvent, bar: GanttBar): void {
    this.facade.onMovePointerDown(event, bar);
  }

  protected onResizePointerDown(event: PointerEvent, row: { bar: GanttBar; baseSpanDays: number }): void {
    this.facade.onResizePointerDown(event, row);
  }

  @HostListener('document:pointermove', ['$event'])
  protected onDocumentPointerMove(event: PointerEvent): void {
    this.facade.onDocumentPointerMove(event);
  }

  @HostListener('document:pointerup', ['$event'])
  @HostListener('document:pointercancel', ['$event'])
  protected onDocumentPointerUp(event: PointerEvent): void {
    this.facade.onDocumentPointerUp(event);
  }

  @HostListener('document:keydown.escape')
  protected onEscapeCancel(): void {
    this.facade.onEscapeCancel();
  }

  protected fill(workTypeId: string, hue?: number | null): string {
    return this.facade.fill(workTypeId, hue);
  }

  protected workerChipFill(hue: number | null | undefined): string {
    return this.facade.workerChipFill(hue);
  }

  protected statusLabel(s: OrderStatus): string {
    return this.facade.statusLabel(s);
  }

  protected statusPip(s: OrderStatus): string {
    return this.facade.statusPip(s);
  }

  protected labelTitle(b: GanttBar): string {
    return this.facade.labelTitle(b);
  }

  protected expandTitle(bar: GanttBar, expanded: boolean): string {
    return this.facade.expandTitle(bar, expanded);
  }

  protected summaryCardTitle(b: GanttBar): string {
    return this.facade.summaryCardTitle(b);
  }

  protected barTitle(b: GanttBar): string {
    return this.facade.barTitle(b);
  }

  protected barAriaLabel(b: GanttBar): string {
    return this.facade.barAriaLabel(b);
  }
}
