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
        class="flex shrink-0 border hairline rounded-sm overflow-hidden"
        role="group"
        aria-label="Группировка Ганта"
      >
        <button
          type="button"
          class="pi-btn pi-btn-ghost pi-focus-ring !rounded-none !border-0 !h-8 !min-h-8 !text-[13px] !px-3 !py-0"
          [class.pi-btn-ink]="groupBy() === 'orders'"
          data-test="gantt-group-orders"
          (click)="groupByChange.emit('orders')"
        >
          По заказам
        </button>
        <button
          type="button"
          class="pi-btn pi-btn-ghost pi-focus-ring !rounded-none !border-0 !h-8 !min-h-8 !text-[13px] !px-3 !py-0"
          [class.pi-btn-ink]="groupBy() === 'workers'"
          data-test="gantt-group-workers"
          (click)="groupByChange.emit('workers')"
        >
          По рабочим
        </button>
      </div>

      <div
        class="flex shrink-0 border hairline rounded-sm overflow-hidden ml-auto"
        role="group"
        aria-label="Масштаб Ганта"
      >
        <button
          type="button"
          class="pi-btn pi-btn-ghost pi-focus-ring !rounded-none !border-0 !h-8 !min-h-8 !text-[13px] !px-3 !py-0"
          [class.pi-btn-ink]="zoom() === 'day'"
          data-test="gantt-zoom-day"
          (click)="zoomChange.emit('day')"
        >
          День
        </button>
        <button
          type="button"
          class="pi-btn pi-btn-ghost pi-focus-ring !rounded-none !border-0 !h-8 !min-h-8 !text-[13px] !px-3 !py-0"
          [class.pi-btn-ink]="zoom() === 'month'"
          data-test="gantt-zoom-month"
          (click)="zoomChange.emit('month')"
        >
          Месяц
        </button>
        <button
          type="button"
          class="pi-btn pi-btn-ghost pi-focus-ring !rounded-none !border-0 !h-8 !min-h-8 !text-[13px] !px-3 !py-0"
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
