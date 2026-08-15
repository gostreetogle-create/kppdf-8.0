import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { GanttZoom } from '../production-cockpit.context';

/** Presentational zoom controls; the page owns zoom state and fit orchestration. */
@Component({
  selector: 'app-production-scale-controls',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p class="eyebrow m-0">Масштаб</p>
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
        [class.pi-btn-ink]="zoom() === 'week'"
        data-test="gantt-zoom-week"
        (click)="zoomChange.emit('week')"
      >
        Неделя
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
}
