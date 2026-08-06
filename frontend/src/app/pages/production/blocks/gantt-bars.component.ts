import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { formatDateOnly, workTypeOklch, type GanttBar } from '../gantt-bar.model';
import type { GanttZoom } from '../production-cockpit.context';

/** Pixels per calendar day — day zoom is denser, week packs the same span. */
export const GANTT_PX_PER_DAY: Record<GanttZoom, number> = {
  day: 36,
  week: 12,
};

@Component({
  selector: 'app-gantt-bars',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex flex-col h-full min-h-0 bg-[oklch(0.985_0.005_95)] dark:bg-paper"
      [attr.data-zoom]="zoom()"
      data-test="gantt-bars-root"
    >
      <div
        class="shrink-0 px-3 py-2 flex flex-wrap items-center gap-3 border-b hairline text-xs text-muted-foreground"
      >
        <span class="font-medium text-ink" data-test="gantt-estimate-label"
          >План-оценка по дням видов работ</span
        >
        <span class="opacity-80">не факт цеха · WorkType.days</span>
        <span class="opacity-70" data-test="gantt-zoom-hint">
          масштаб: {{ zoom() === 'day' ? 'день' : 'неделя' }}
        </span>
        @if (usedTodayFallback()) {
          <span class="text-amber-800 dark:text-amber-300" data-test="gantt-today-fallback"
            >Дата начала не задана — показано от сегодня</span
          >
        }
        @if (readOnly()) {
          <span class="text-amber-800 dark:text-amber-300"
            >Заказ завершён/отменён — только просмотр</span
          >
        }
      </div>

      @if (warnings().length) {
        <div
          class="shrink-0 px-3 py-1.5 text-xs text-amber-900 dark:text-amber-200 bg-amber-50/80 dark:bg-amber-950/30 border-b hairline"
          data-test="gantt-warnings"
        >
          @for (w of warnings(); track w) {
            <div>{{ w }}</div>
          }
        </div>
      }

      @if (!bars().length) {
        <div
          class="shrink-0 px-3 py-1.5 text-xs text-muted-foreground border-b hairline bg-paper-2/40"
          data-test="gantt-empty"
          role="status"
        >
          Нет полос оценки — календарь всё равно показан. Выберите заказ слева или заведите состав
          изделия (модули → виды работ с днями).
        </div>
      }

      <div class="flex-1 min-h-0 overflow-auto">
        <div class="flex" [style.minWidth.px]="timelineMinWidth()">
          <div class="sticky left-0 z-[2] w-48 shrink-0 border-r hairline bg-paper">
            <div
              class="h-7 border-b hairline px-2 flex items-end pb-1 text-[10px] text-muted-foreground"
            >
              Работа / модуль
            </div>
            @for (row of rows(); track row.bar.id) {
              <div
                class="h-11 px-2 py-2 text-xs border-b hairline"
                [class.bg-black/[0.02]]="row.alt"
              >
                <div class="font-medium truncate text-ink">{{ row.bar.moduleName }}</div>
                <div class="text-muted-foreground truncate">
                  {{ row.bar.workTypeName }}
                  @if (row.bar.quantityLabel) {
                    <span class="ml-1 font-mono">{{ row.bar.quantityLabel }}</span>
                  }
                </div>
                <div class="text-[10px] text-muted-foreground">{{ row.bar.workerLabel }}</div>
              </div>
            } @empty {
              @for (ph of emptyPlaceholders; track ph) {
                <div
                  class="h-11 px-2 py-2 text-xs border-b hairline text-muted-foreground/70"
                  [class.bg-black/[0.02]]="ph % 2 === 1"
                  data-test="gantt-placeholder-row"
                >
                  <div class="truncate">—</div>
                </div>
              }
            }
          </div>

          <div class="relative flex-1 min-w-0">
            <div
              class="relative h-7 border-b hairline sticky top-0 bg-paper z-10"
              data-test="gantt-scale"
            >
              @for (tick of scaleTicks(); track tick.key) {
                <div
                  class="absolute top-0 bottom-0 border-l hairline text-[10px] text-muted-foreground pl-0.5 overflow-hidden"
                  [style.left.px]="tick.leftPx"
                  [style.width.px]="tick.widthPx"
                  [attr.data-test]="'gantt-tick-' + tick.key"
                >
                  {{ tick.label }}
                </div>
              }
              <div
                class="absolute top-0 bottom-0 w-px bg-destructive/70 z-[1]"
                [style.left.px]="todayLeftPx()"
                title="Сегодня"
                data-test="gantt-today-marker"
              ></div>
            </div>

            @for (row of rows(); track row.bar.id) {
              <div
                class="relative h-11 border-b hairline"
                [class.bg-black/[0.02]]="row.alt"
                [attr.data-test]="'gantt-row-' + row.bar.id"
              >
                @for (grid of dayGrid(); track grid.key) {
                  <div
                    class="absolute top-0 bottom-0 border-l hairline opacity-40"
                    [style.left.px]="grid.leftPx"
                  ></div>
                }
                <div
                  class="absolute top-1.5 bottom-1.5 rounded-sm text-[10px] px-1.5 flex items-center overflow-hidden text-ink/90"
                  [class.border]="row.bar.noTerm"
                  [class.border-dashed]="row.bar.noTerm"
                  [class.border-muted-foreground]="row.bar.noTerm"
                  [style.left.px]="row.leftPx"
                  [style.width.px]="row.widthPx"
                  [style.background]="row.bar.noTerm ? 'transparent' : fill(row.bar.workTypeId)"
                  [style.backgroundImage]="
                    row.bar.noTerm
                      ? 'repeating-linear-gradient(135deg, transparent, transparent 4px, oklch(0.7 0.02 250 / 0.35) 4px, oklch(0.7 0.02 250 / 0.35) 8px)'
                      : null
                  "
                  [attr.title]="barTitle(row.bar)"
                  [attr.data-test]="row.bar.noTerm ? 'gantt-bar-no-term' : 'gantt-bar'"
                >
                  @if (!row.bar.noTerm) {
                    <span class="truncate">{{ row.bar.days }}д</span>
                  } @else {
                    <span class="truncate text-muted-foreground">без срока</span>
                  }
                </div>
              </div>
            } @empty {
              @for (ph of emptyPlaceholders; track ph) {
                <div class="relative h-11 border-b hairline" [class.bg-black/[0.02]]="ph % 2 === 1">
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

      <div
        class="shrink-0 px-3 py-2 border-t hairline text-[10px] text-muted-foreground"
        data-test="gantt-legend"
      >
        Красная линия = сегодня · цвет полоски = вид работ · штриховка = без WorkType.days · ×N =
        количество (дни не умножаются) · День/Неделя — плотность шкалы
      </div>
    </div>
  `,
})
export class GanttBarsComponent {
  readonly bars = input.required<GanttBar[]>();
  readonly rangeStart = input.required<string>();
  readonly rangeEnd = input.required<string>();
  readonly zoom = input<GanttZoom>('day');
  readonly warnings = input<string[]>([]);
  readonly usedTodayFallback = input(false);
  readonly readOnly = input(false);
  readonly today = input(formatDateOnly(new Date()));

  /** Empty-board placeholder lanes so the calendar never looks like a blank page. */
  protected readonly emptyPlaceholders = [0, 1, 2, 3, 4, 5] as const;

  protected readonly totalDays = computed(() =>
    Math.max(1, dayDiff(this.rangeStart(), this.rangeEnd())),
  );

  protected readonly pxPerDay = computed(() => GANTT_PX_PER_DAY[this.zoom()]);

  protected readonly timelineMinWidth = computed(() => this.totalDays() * this.pxPerDay() + 192);

  protected readonly dayGrid = computed(() => {
    const total = this.totalDays();
    const px = this.pxPerDay();
    const out: Array<{ key: string; leftPx: number }> = [];
    for (let i = 0; i < total; i++) {
      out.push({ key: `g${i}`, leftPx: i * px });
    }
    return out;
  });

  protected readonly scaleTicks = computed(() => {
    const start = this.rangeStart();
    const total = this.totalDays();
    const px = this.pxPerDay();
    const weekMode = this.zoom() === 'week';
    const ticks: Array<{ key: string; label: string; leftPx: number; widthPx: number }> = [];
    for (let i = 0; i < total; i++) {
      const date = addDays(start, i);
      const dow = utcDow(date);
      if (weekMode && dow !== 1 && i !== 0) continue;
      const span = weekMode ? Math.min(7, total - i) : 1;
      ticks.push({
        key: date,
        label: weekMode ? `н.${isoWeek(date)}` : shortDay(date),
        leftPx: i * px,
        widthPx: span * px,
      });
    }
    return ticks;
  });

  protected readonly rows = computed(() => {
    const start = this.rangeStart();
    const total = this.totalDays();
    const px = this.pxPerDay();
    return this.bars().map((bar, idx) => {
      const left = dayDiff(start, bar.startDate);
      const span = bar.noTerm
        ? Math.max(1, Math.round(total * 0.04))
        : Math.max(1, dayDiff(bar.startDate, bar.endDate) + 1);
      return {
        bar,
        alt: idx % 2 === 1,
        leftPx: left * px,
        widthPx: Math.max(px * 0.5, span * px),
      };
    });
  });

  protected readonly todayLeftPx = computed(() => {
    const t = dayDiff(this.rangeStart(), this.today());
    return Math.max(0, Math.min(this.totalDays(), t)) * this.pxPerDay();
  });

  protected fill(workTypeId: string): string {
    return workTypeOklch(workTypeId);
  }

  protected barTitle(b: GanttBar): string {
    if (b.noTerm) return `${b.moduleName} · ${b.workTypeName} — без срока`;
    return `${b.moduleName} · ${b.workTypeName} · ${b.startDate}→${b.endDate} · ${b.days}д ${b.quantityLabel ?? ''}`.trim();
  }
}

function dayDiff(a: string, b: string): number {
  const pa = a.split('-').map(Number);
  const pb = b.split('-').map(Number);
  const da = Date.UTC(pa[0]!, pa[1]! - 1, pa[2]!);
  const db = Date.UTC(pb[0]!, pb[1]! - 1, pb[2]!);
  return Math.round((db - da) / 86400000);
}

function addDays(dateOnly: string, days: number): string {
  const [y, m, d] = dateOnly.split('-').map(Number);
  const dt = new Date(Date.UTC(y!, m! - 1, d!));
  dt.setUTCDate(dt.getUTCDate() + days);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

function utcDow(dateOnly: string): number {
  const [y, m, d] = dateOnly.split('-').map(Number);
  return new Date(Date.UTC(y!, m! - 1, d!)).getUTCDay();
}

function shortDay(dateOnly: string): string {
  const [, m, d] = dateOnly.split('-');
  return `${d}.${m}`;
}

function isoWeek(dateOnly: string): number {
  const [y, m, d] = dateOnly.split('-').map(Number);
  const dt = new Date(Date.UTC(y!, m! - 1, d!));
  const dayNum = dt.getUTCDay() || 7;
  dt.setUTCDate(dt.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1));
  return Math.ceil(((dt.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
