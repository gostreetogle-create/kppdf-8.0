import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { GanttGroupBy, GanttZoom } from '../production-cockpit.context';

/** Presentational zoom + grouping controls; the page owns both states. */
@Component({
  selector: 'app-production-scale-controls',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p class="eyebrow m-0">Группировка</p>
    <div
      class="flex mt-1.5 border hairline rounded-sm overflow-hidden"
      role="group"
      aria-label="Группировка Ганта"
    >
      <button
        type="button"
        class="flex-1 pi-btn pi-btn-ghost pi-focus-ring !rounded-none !border-0 !text-xs"
        [class.pi-btn-ink]="groupBy() === 'orders'"
        data-test="gantt-group-orders"
        (click)="groupByChange.emit('orders')"
      >
        По заказам
      </button>
      <button
        type="button"
        class="flex-1 pi-btn pi-btn-ghost pi-focus-ring !rounded-none !border-0 !text-xs"
        [class.pi-btn-ink]="groupBy() === 'workers'"
        data-test="gantt-group-workers"
        (click)="groupByChange.emit('workers')"
      >
        По рабочим
      </button>
    </div>

    <p class="eyebrow m-0 mt-3">Масштаб</p>
    <div class="flex flex-col gap-1 mt-2">
      <button
        type="button"
        class="pi-btn pi-btn-ghost pi-focus-ring text-left"
        [class.pi-btn-ink]="zoom() === 'day'"
        data-test="gantt-zoom-day"
        (click)="zoomChange.emit('day')"
      >
        День
      </button>
      <button
        type="button"
        class="pi-btn pi-btn-ghost pi-focus-ring text-left"
        [class.pi-btn-ink]="zoom() === 'month'"
        data-test="gantt-zoom-month"
        (click)="zoomChange.emit('month')"
      >
        Месяц
      </button>
      <button
        type="button"
        class="pi-btn pi-btn-ghost pi-focus-ring text-left"
        data-test="gantt-fit"
        (click)="fit.emit()"
      >
        Вместить сроки
      </button>
    </div>
  `,
})
export class ProductionScaleControlsComponent {
  readonly zoom = input.required<GanttZoom>();
  readonly zoomChange = output<GanttZoom>();
  readonly fit = output<void>();
  readonly groupBy = input.required<GanttGroupBy>();
  readonly groupByChange = output<GanttGroupBy>();
}
