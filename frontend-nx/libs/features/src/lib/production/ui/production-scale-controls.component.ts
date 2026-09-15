import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { GanttGroupBy, GanttZoom } from '../production-cockpit.context';

/** Dense horizontal toolbar: group-by left, zoom/fit right. Page owns state. */
@Component({
  selector: 'app-production-scale-controls',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex w-full items-center justify-between gap-3"
      data-test="gantt-toolbar"
      role="toolbar"
      aria-label="Гант: группировка и масштаб"
    >
      <div
        class="flex shrink-0 items-center gap-1"
        role="group"
        aria-label="Группировка Ганта"
      >
        <button
          type="button"
          class="gantt-toc-chip inline-flex items-center px-2 py-0.5 text-[11px] leading-4 font-medium tracking-wide rounded-sm transition-colors pi-focus-ring"
          [class.bg-ink]="groupBy() === 'orders'"
          [class.text-paper]="groupBy() === 'orders'"
          [class.text-muted-foreground]="groupBy() !== 'orders'"
          [class.hover:text-ink]="groupBy() !== 'orders'"
          [class.hover:bg-paper-2]="groupBy() !== 'orders'"
          [attr.aria-pressed]="groupBy() === 'orders'"
          data-test="gantt-group-orders"
          (click)="groupByChange.emit('orders')"
        >
          По заказам
        </button>
        <button
          type="button"
          class="gantt-toc-chip inline-flex items-center px-2 py-0.5 text-[11px] leading-4 font-medium tracking-wide rounded-sm transition-colors pi-focus-ring"
          [class.bg-ink]="groupBy() === 'workers'"
          [class.text-paper]="groupBy() === 'workers'"
          [class.text-muted-foreground]="groupBy() !== 'workers'"
          [class.hover:text-ink]="groupBy() !== 'workers'"
          [class.hover:bg-paper-2]="groupBy() !== 'workers'"
          [attr.aria-pressed]="groupBy() === 'workers'"
          data-test="gantt-group-workers"
          (click)="groupByChange.emit('workers')"
        >
          По рабочим
        </button>
      </div>

      <div
        class="flex shrink-0 items-center gap-1 ml-auto"
        role="group"
        aria-label="Масштаб Ганта"
      >
        <button
          type="button"
          class="gantt-toc-chip inline-flex items-center px-2 py-0.5 text-[11px] leading-4 font-medium tracking-wide rounded-sm transition-colors pi-focus-ring"
          [class.bg-ink]="zoom() === 'day'"
          [class.text-paper]="zoom() === 'day'"
          [class.text-muted-foreground]="zoom() !== 'day'"
          [class.hover:text-ink]="zoom() !== 'day'"
          [class.hover:bg-paper-2]="zoom() !== 'day'"
          [attr.aria-pressed]="zoom() === 'day'"
          data-test="gantt-zoom-day"
          (click)="zoomChange.emit('day')"
        >
          День
        </button>
        <button
          type="button"
          class="gantt-toc-chip inline-flex items-center px-2 py-0.5 text-[11px] leading-4 font-medium tracking-wide rounded-sm transition-colors pi-focus-ring"
          [class.bg-ink]="zoom() === 'month'"
          [class.text-paper]="zoom() === 'month'"
          [class.text-muted-foreground]="zoom() !== 'month'"
          [class.hover:text-ink]="zoom() !== 'month'"
          [class.hover:bg-paper-2]="zoom() !== 'month'"
          [attr.aria-pressed]="zoom() === 'month'"
          data-test="gantt-zoom-month"
          (click)="zoomChange.emit('month')"
        >
          Месяц
        </button>
        <button
          type="button"
          class="gantt-toc-chip inline-flex items-center px-2 py-0.5 text-[11px] leading-4 font-medium tracking-wide rounded-sm transition-colors pi-focus-ring text-muted-foreground hover:text-ink hover:bg-paper-2"
          data-test="gantt-fit"
          (click)="fit.emit()"
        >
          Вместить сроки
        </button>
      </div>
    </div>
  `,
})
export class ProductionScaleControlsComponent {
  readonly zoom = input.required<GanttZoom>();
  readonly zoomChange = output<GanttZoom>();
  readonly fit = output<void>();
  readonly groupBy = input<GanttGroupBy>('orders');
  readonly groupByChange = output<GanttGroupBy>();
}
