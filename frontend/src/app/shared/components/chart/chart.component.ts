import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  inject,
  input,
  viewChild,
} from '@angular/core';
import {
  Chart,
  ChartConfiguration,
  ChartData,
  ChartType,
  registerables,
} from 'chart.js';
import { ThemeService } from '../../../core/services/theme.service';

Chart.register(...registerables);

/**
 * Chart (TZ-36) — raw Chart.js wrapper (no ng2-charts).
 * Usage:
 *   <hlm-chart
 *     [type]="'line'"
 *     [data]="{ labels: ['Jan','Feb'], datasets: [{ data: [10, 20] }] }"
 *   />
 */
@Component({
  selector: 'hlm-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [style.height.px]="height()" class="w-full">
      <canvas #canvas></canvas>
    </div>
  `,
})
export class ChartComponent implements AfterViewInit, OnDestroy {
  readonly type = input<ChartType>('line');
  readonly data = input.required<ChartData>();
  readonly height = input<number>(240);
  readonly showLegend = input<boolean>(true);
  readonly yAxisLabel = input<string>('');

  private readonly theme = inject(ThemeService);
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private chart?: Chart;
  private rendered = false;

  constructor() {
    // Re-render when inputs change after first render
    effect(() => {
      const _type = this.type();
      const _data = this.data();
      const _showLegend = this.showLegend();
      const _yLabel = this.yAxisLabel();
      const _theme = this.theme.theme();
      if (!this.rendered) return;
      this.chart?.destroy();
      this.chart = undefined;
      this.render(_type, _data, _showLegend, _yLabel, _theme);
    });
  }

  ngAfterViewInit(): void {
    this.rendered = true;
    this.render(this.type(), this.data(), this.showLegend(), this.yAxisLabel(), this.theme.theme());
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private render(
    type: ChartType,
    data: ChartData,
    showLegend: boolean,
    yLabel: string,
    themeMode: 'light' | 'dark',
  ): void {
    const isDark = themeMode === 'dark';
    const text = isDark ? 'hsl(0 0% 95%)' : 'hsl(0 0% 9%)';
    const muted = isDark ? 'hsl(0 0% 64%)' : 'hsl(0 0% 45%)';
    const grid = isDark ? 'hsl(0 0% 18%)' : 'hsl(0 0% 90%)';

    const options: ChartConfiguration['options'] = {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 600, easing: 'easeOutCubic' },
      plugins: {
        legend: {
          display: showLegend,
          position: 'top',
          labels: { color: text, usePointStyle: true, padding: 16 },
        },
        tooltip: {
          backgroundColor: isDark ? 'hsl(0 0% 12%)' : 'hsl(0 0% 100%)',
          titleColor: text,
          bodyColor: text,
          borderColor: grid,
          borderWidth: 1,
          padding: 10,
        },
      },
      scales:
        type === 'line' || type === 'bar' || type === 'scatter'
          ? {
              x: { ticks: { color: muted }, grid: { color: grid } },
              y: {
                ticks: { color: muted },
                grid: { color: grid },
                title: yLabel ? { display: true, text: yLabel, color: muted } : undefined,
              },
            }
          : undefined,
    };

    this.chart = new Chart(this.canvas().nativeElement, { type, data, options });
  }
}
