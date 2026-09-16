/**
 * TZ-NX-GANTT-G3-TREE-CASCADE — page port (shell + Gantt + flyouts).
 *
 * 1:1 port of legacy `frontend/src/app/pages/production/production-cockpit.page.ts`
 * (write-path handlers stubbed for G5) with NX shell integration:
 * - shell tools via ShellToolRailService (NX equivalent of PiChromeToolsService);
 * - services/caps/auth/toast from `@kppdf/data-access` / `@kppdf/ui/toast`;
 * - the flyouts (Заказы / Фильтры) render as studio overlays, not chrome-rail drawers.
 *
 * `ProductionReadFacade` is provisioned on the route (see app.routes.ts) so tests
 * can substitute it at the TestBed level; the UI context stays component-local.
 *
 * TZ-NX-PRODUCTION-COCKPIT-FACADE — write handlers, optimistic apply/restore,
 * left-tool flyout state and load/refresh orchestration moved to
 * `ProductionCockpitFacade` (this page keeps chrome: ShellToolRail wiring +
 * the escape-key handler). `ProductionCockpitContext` stays the separate
 * selection/expand/filter SoT, untouched.
 */
import { ChangeDetectionStrategy, Component, DestroyRef, HostListener, inject } from '@angular/core';
import { ShellToolRailService } from '../../layout/shell-tool-rail.service';
import { PRODUCTION_TOOL_OWNER, registerProductionShellTools } from './production-cockpit-shell-tools';
import {
  GanttBarsComponent,
  OrdersRailComponent,
  ProductionCockpitContext,
  ProductionCockpitFacade,
  ProductionReadFacade,
  type GanttEstimateDaysCommit,
  type GanttOrderMetaCommit,
  type GanttPlannedDateMoveCommit,
  type GanttStartOffsetCommit,
  type GanttWorkerAssignmentCommit,
  type ProductionLeftTool,
} from '@kppdf/features/production';

@Component({
  selector: 'pi-production-cockpit-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ProductionCockpitContext, ProductionCockpitFacade],
  imports: [OrdersRailComponent, GanttBarsComponent],
  template: `
    <div class="production-cockpit" data-test="production-cockpit">
      @if (facade.state().error) {
        <div
          role="alert"
          class="px-4 py-1.5 text-[13px] text-destructive border-b hairline bg-paper"
          data-test="production-error"
        >
          {{ facade.state().error }}
        </div>
      }

      @if (orderIdHint(); as hint) {
        <div
          role="status"
          class="px-4 py-1.5 text-[13px] text-muted-foreground border-b hairline bg-paper"
          data-test="production-order-id-hint"
        >
          {{ hint }}
        </div>
      }

      <div class="production-studio-body" data-test="production-studio-body">
        <main class="production-studio-center" data-test="gantt-main" (click)="onMainClick()">
          @if (facade.state().loading) {
            <div
              class="absolute inset-0 z-10 flex items-center justify-center text-[13px] text-muted-foreground bg-paper/70"
              data-test="cockpit-loading"
            >
              Считаем оценку…
            </div>
          }
          <app-gantt-bars
            [bars]="bars()"
            [rangeStart]="rangeStart()"
            [rangeEnd]="rangeEnd()"
            [zoom]="ctx.zoom()"
            [scrollRequest]="scrollRequest()"
            [warnings]="facade.state().warnings"
            [usedTodayFallback]="usedTodayFallback()"
            [readOnly]="readOnly()"
            [canEdit]="canEditCatalog()"
            [expandedOrderIds]="ctx.expandedOrderIds()"
            [expandedProductIds]="ctx.expandedProductIds()"
            [expandedModuleIds]="ctx.expandedModuleIds()"
            [expandedWorkerIds]="ctx.expandedWorkerIds()"
            [expandedWorkerModuleIds]="ctx.expandedWorkerModuleIds()"
            [expandedWorkBarId]="ctx.expandedWorkBarId()"
            [groupByWorkers]="groupBy() === 'workers'"
            [sortMode]="ctx.sortMode()"
            [workerCandidates]="workerCandidates()"
            [workerAssignmentSaving]="workerAssignmentSaving()"
            [highlightOrderId]="metaHighlightOrderId()"
            [orderMeta]="orderMetaView()"
            [canEditOrder]="canEditOrder()"
            (orderLabelClick)="onOrderLabelClick($event)"
            (toggleExpand)="onToggleExpand($event)"
            (toggleWorkDetail)="onToggleWorkDetail($event)"
            (dismissCanvas)="onDismissCanvas()"
            (zoomChange)="ctx.setZoom($event)"
            (groupByChange)="groupBy.set($event)"
            (sortModeChange)="ctx.setSortMode($event)"
            (fit)="onFitHorizon()"
            (estimateDaysCommit)="onEstimateDaysCommit($event)"
            (workerAssignmentCommit)="onWorkerAssignmentCommit($event)"
            (plannedDateMoveCommit)="onPlannedDateMoveCommit($event)"
            (startOffsetCommit)="onStartOffsetCommit($event)"
            (orderMetaCommit)="onOrderMetaCommit($event)"
          />
        </main>

        @if (leftTool()) {
          <button
            type="button"
            class="production-studio-backdrop"
            aria-label="Закрыть панель"
            data-test="production-flyout-backdrop"
            (click)="closeFlyouts()"
          ></button>
        }

        @if (leftTool() === 'orders') {
          <aside
            id="production-flyout-orders"
            class="production-studio-flyout production-studio-flyout-left"
            data-test="production-flyout-orders"
            aria-label="Заказы"
          >
            <app-orders-rail
              [orders]="orders()"
              [collapsed]="false"
              [showList]="true"
              [showFilters]="false"
              [thumbs]="orderThumbs()"
              [noGanttOrderIds]="noGanttOrderIds()"
              (select)="onSelect($event)"
              (selectAll)="onSelectAll()"
              (filtersChanged)="onFiltersChanged()"
              (expandRail)="toggleLeftTool('orders')"
            />
          </aside>
        }

        @if (leftTool() === 'filters') {
          <aside
            id="production-flyout-filters"
            class="production-studio-flyout production-studio-flyout-left production-studio-flyout-filters"
            data-test="production-flyout-filters"
            aria-label="Фильтры"
          >
            <app-orders-rail
              [orders]="orders()"
              [collapsed]="false"
              [showList]="false"
              [showFilters]="true"
              [thumbs]="orderThumbs()"
              [noGanttOrderIds]="noGanttOrderIds()"
              (select)="onSelect($event)"
              (selectAll)="onSelectAll()"
              (filtersChanged)="onFiltersChanged()"
              (expandRail)="toggleLeftTool('filters')"
            />
          </aside>
        }
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: calc(100dvh - var(--header-h, 3.5rem));
        min-height: 0;
        overflow: hidden;
      }
      .production-cockpit {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 0;
        overflow: hidden;
      }
      .production-studio-body {
        position: relative;
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }
      .production-studio-center {
        position: relative;
        display: flex;
        flex-direction: column;
        flex: 1;
        min-width: 0;
        min-height: 0;
        overflow: hidden;
      }
      .production-studio-backdrop {
        position: absolute;
        inset: 0;
        z-index: 10;
        border: 0;
        padding: 0;
        background: oklch(0.22 0.02 260 / 0.18);
        cursor: default;
      }
      .production-studio-flyout {
        position: absolute;
        top: 0.5rem;
        z-index: 20;
        width: min(22rem, calc(100% - 1rem));
        max-height: calc(100% - 1rem);
        overflow: auto;
        padding: 0.75rem;
        border: 1px solid var(--color-rule);
        border-radius: 2px;
        background: var(--color-paper-raised, var(--color-paper));
      }
      .production-studio-flyout-left {
        left: 0;
      }
      .production-studio-flyout-filters {
        width: min(20rem, calc(100% - 1rem));
      }
      @media (max-width: 1279px) {
        .production-studio-flyout {
          width: min(22rem, calc(100% - 1rem));
          max-width: calc(100vw - 1rem);
        }
        .production-studio-flyout-left {
          left: 0.5rem;
        }
      }
    `,
  ],
})
export class ProductionCockpitPage {
  protected readonly ctx = inject(ProductionCockpitContext);
  protected readonly facade = inject(ProductionReadFacade);
  protected readonly cockpit = inject(ProductionCockpitFacade);
  private readonly destroyRef = inject(DestroyRef);
  private readonly shellTools = inject(ShellToolRailService);

  protected readonly orders = this.cockpit.orders;
  protected readonly bars = this.cockpit.bars;
  protected readonly rangeStart = this.cockpit.rangeStart;
  protected readonly rangeEnd = this.cockpit.rangeEnd;
  protected readonly usedTodayFallback = this.cockpit.usedTodayFallback;
  protected readonly readOnly = this.cockpit.readOnly;
  protected readonly groupBy = this.cockpit.groupBy;
  protected readonly workerCandidates = this.cockpit.workerCandidates;
  protected readonly workerAssignmentSaving = this.cockpit.workerAssignmentSaving;
  protected readonly orderThumbs = this.cockpit.orderThumbs;
  protected readonly orderIdHint = this.cockpit.orderIdHint;
  protected readonly scrollRequest = this.cockpit.scrollRequest;
  protected readonly leftTool = this.cockpit.leftTool;
  protected readonly canEditOrder = this.cockpit.canEditOrder;
  protected readonly canEditCatalog = this.cockpit.canEditCatalog;
  protected readonly metaHighlightOrderId = this.cockpit.metaHighlightOrderId;
  protected readonly noGanttOrderIds = this.cockpit.noGanttOrderIds;
  protected readonly orderMetaView = this.cockpit.orderMetaView;

  constructor() {
    registerProductionShellTools(this.shellTools, {
      leftTool: this.leftTool,
      filtersDirty: this.ctx.filtersDirty,
      toggleLeftTool: (tool) => this.toggleLeftTool(tool),
      onRefresh: () => void this.onRefresh(),
      onToday: () => this.onToday(),
    });
    this.destroyRef.onDestroy(() => {
      this.shellTools.clear(PRODUCTION_TOOL_OWNER);
    });
  }

  protected onMainClick(): void {
    this.cockpit.onMainClick();
  }

  protected onDismissCanvas(): void {
    this.cockpit.onDismissCanvas();
  }

  protected onToggleExpand(expandId: string): void {
    this.cockpit.onToggleExpand(expandId);
  }

  protected onToggleWorkDetail(barId: string): void {
    this.cockpit.onToggleWorkDetail(barId);
  }

  protected async onOrderLabelClick(id: string): Promise<void> {
    await this.cockpit.onOrderLabelClick(id);
  }

  protected async onSelect(id: string): Promise<void> {
    await this.cockpit.onSelect(id);
  }

  protected async onSelectAll(): Promise<void> {
    await this.cockpit.onSelectAll();
  }

  protected toggleLeftTool(tool: Exclude<ProductionLeftTool, null>, event?: Event): void {
    this.cockpit.toggleLeftTool(tool, event);
  }

  protected closeFlyouts(): void {
    this.cockpit.closeFlyouts();
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.ctx.clearExpandedOrders();
    this.ctx.closeOrderMeta();
    if (this.leftTool()) {
      this.closeFlyouts();
    }
  }

  protected async onFiltersChanged(): Promise<void> {
    await this.cockpit.onFiltersChanged();
  }

  protected async onWorkerAssignmentCommit(ev: GanttWorkerAssignmentCommit): Promise<void> {
    await this.cockpit.onWorkerAssignmentCommit(ev);
  }

  protected async onOrderMetaCommit(ev: GanttOrderMetaCommit): Promise<void> {
    await this.cockpit.onOrderMetaCommit(ev);
  }

  protected async onEstimateDaysCommit(ev: GanttEstimateDaysCommit): Promise<void> {
    await this.cockpit.onEstimateDaysCommit(ev);
  }

  protected async onPlannedDateMoveCommit(ev: GanttPlannedDateMoveCommit): Promise<void> {
    await this.cockpit.onPlannedDateMoveCommit(ev);
  }

  protected async onStartOffsetCommit(ev: GanttStartOffsetCommit): Promise<void> {
    await this.cockpit.onStartOffsetCommit(ev);
  }

  protected async onRefresh(): Promise<void> {
    await this.cockpit.onRefresh();
  }

  protected onToday(): void {
    this.cockpit.onToday();
  }

  protected async onFitHorizon(): Promise<void> {
    await this.cockpit.onFitHorizon();
  }
}
