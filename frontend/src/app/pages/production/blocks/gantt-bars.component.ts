import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { formatDateOnly, workTypeOklch, type GanttBar } from '../gantt-bar.model';

@Component({
  selector: 'app-gantt-bars',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full min-h-0 bg-[oklch(0.985_0.005_95)] dark:bg-paper">
      <div
        class="shrink-0 px-3 py-2 flex flex-wrap items-center gap-3 border-b hairline text-xs text-muted-foreground"
      >
        <span class="font-medium text-ink" data-test="gantt-estimate-label"
          >План-оценка по дням видов работ</span
        >
        <span class="opacity-80">не факт цеха · WorkType.days</span>
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
          class="flex-1 flex items-center justify-center p-8 text-sm text-muted-foreground"
          data-test="gantt-empty"
        >
          Выберите заказ — состав для оценки пуст
        </div>
      } @else {
        <div class="flex-1 min-h-0 overflow-auto">
          <div class="min-w-[640px]">
            <div class="relative h-6 border-b hairline sticky top-0 bg-paper z-10">
              <div
                class="absolute top-0 bottom-0 w-px bg-destructive/70"
                [style.left.%]="todayPct()"
                title="Сегодня"
                data-test="gantt-today-marker"
              ></div>
            </div>
            @for (row of rows(); track row.bar.id) {
              <div
                class="flex items-stretch border-b hairline"
                [class.bg-black/[0.02]]="row.alt"
                [attr.data-test]="'gantt-row-' + row.bar.id"
              >
                <div
                  class="sticky left-0 z-[1] w-48 shrink-0 px-2 py-2 text-xs bg-paper border-r hairline"
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
                <div class="relative flex-1 h-11">
                  <div
                    class="absolute top-1.5 bottom-1.5 rounded-sm text-[10px] px-1.5 flex items-center overflow-hidden text-ink/90"
                    [class.border]="row.bar.noTerm"
                    [class.border-dashed]="row.bar.noTerm"
                    [class.border-muted-foreground]="row.bar.noTerm"
                    [style.left.%]="row.leftPct"
                    [style.width.%]="row.widthPct"
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
              </div>
            }
          </div>
        </div>
        <div
          class="shrink-0 px-3 py-2 border-t hairline text-[10px] text-muted-foreground"
          data-test="gantt-legend"
        >
          Цвет полоски = вид работ (OKLCH) · штриховка = без WorkType.days · ×N = количество в
          заказе (дни не умножаются)
        </div>
      }
    </div>
  `,
})
export class GanttBarsComponent {
  readonly bars = input.required<GanttBar[]>();
  readonly rangeStart = input.required<string>();
  readonly rangeEnd = input.required<string>();
  readonly warnings = input<string[]>([]);
  readonly usedTodayFallback = input(false);
  readonly readOnly = input(false);
  readonly today = input(formatDateOnly(new Date()));

  protected readonly rows = computed(() => {
    const start = this.rangeStart();
    const end = this.rangeEnd();
    const total = Math.max(1, dayDiff(start, end));
    return this.bars().map((bar, idx) => {
      const left = dayDiff(start, bar.startDate);
      const span = bar.noTerm
        ? Math.max(1, Math.round(total * 0.04))
        : Math.max(1, dayDiff(bar.startDate, bar.endDate) + 1);
      return {
        bar,
        alt: idx % 2 === 1,
        leftPct: (left / total) * 100,
        widthPct: Math.min(100 - (left / total) * 100, (span / total) * 100),
      };
    });
  });

  protected readonly todayPct = computed(() => {
    const start = this.rangeStart();
    const end = this.rangeEnd();
    const total = Math.max(1, dayDiff(start, end));
    const t = dayDiff(start, this.today());
    return Math.max(0, Math.min(100, (t / total) * 100));
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
