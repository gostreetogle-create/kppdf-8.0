import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';

/**
 * Calendar (TZ-37) — month-grid date picker. Single or range mode.
 * Usage:
 *   <hlm-calendar [value]="date()" (valueChange)="date.set($event)" />
 *   <hlm-calendar mode="range" [value]="range()" (valueChange)="range.set($event)" />
 */
@Component({
  selector: 'hlm-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-md border border-border bg-popover p-3 text-popover-foreground shadow-sm">
      <div class="flex items-center justify-between pb-2">
        <button type="button" class="rounded-sm p-1.5 hover:bg-accent" (click)="prev()" aria-label="Previous month">
          <span class="lucide-chevron-left h-4 w-4"></span>
        </button>
        <div class="text-sm font-medium">
          {{ monthLabel() }}
        </div>
        <button type="button" class="rounded-sm p-1.5 hover:bg-accent" (click)="next()" aria-label="Next month">
          <span class="lucide-chevron-right h-4 w-4"></span>
        </button>
      </div>
      <div class="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        @for (d of ['Mo','Tu','We','Th','Fr','Sa','Su']; track d) {
          <div class="py-1.5 font-medium">{{ d }}</div>
        }
        @for (cell of cells(); track $index) {
          <button
            type="button"
            [disabled]="!cell.inMonth"
            [class]="dayClass(cell)"
            (click)="pick(cell)"
            [attr.aria-selected]="cell.isSelected"
          >
            {{ cell.day }}
          </button>
        }
      </div>
      <div class="mt-2 flex items-center justify-between border-t border-border pt-2">
        <button type="button" class="text-xs text-muted-foreground hover:text-foreground" (click)="goToday()">Today</button>
        <button type="button" class="text-xs text-muted-foreground hover:text-foreground" (click)="clear()">Clear</button>
      </div>
    </div>
  `,
})
export class CalendarComponent {
  readonly mode = input<'single' | 'range'>('single');
  readonly value = input<Date | { from: Date | null; to: Date | null } | null>(null);
  readonly valueChange = output<Date | { from: Date | null; to: Date | null } | null>();

  protected readonly view = signal<Date>(this.initialView());

  protected readonly monthLabel = computed(() =>
    this.view().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
  );

  protected readonly cells = computed(() => {
    const v = this.view();
    const year = v.getFullYear();
    const month = v.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startDay = (first.getDay() + 6) % 7; // Monday-first
    const total = last.getDate();
    const cells: { day: number; inMonth: boolean; date: Date; isToday: boolean; isSelected: boolean; inRange: boolean }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Previous month tail
    const prevLast = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevLast - i);
      cells.push(this.makeCell(d, false, today));
    }
    // Current month
    for (let d = 1; d <= total; d++) {
      cells.push(this.makeCell(new Date(year, month, d), true, today));
    }
    // Next month head (to fill 6 weeks = 42)
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      cells.push(this.makeCell(new Date(year, month + 1, d), false, today));
    }
    return cells;
  });

  private initialView(): Date {
    const v = this.value();
    if (v instanceof Date) return new Date(v);
    if (v && 'from' in v && v.from) return new Date(v.from);
    return new Date();
  }

  private makeCell(date: Date, inMonth: boolean, today: Date) {
    const isToday = date.getTime() === today.getTime();
    const v = this.value();
    let isSelected = false;
    let inRange = false;
    if (this.mode() === 'single' && v instanceof Date) {
      isSelected = sameDate(date, v);
    } else if (this.mode() === 'range' && v && 'from' in v) {
      if (v.from && sameDate(date, v.from)) isSelected = true;
      if (v.to && sameDate(date, v.to)) isSelected = true;
      if (v.from && v.to && date > v.from && date < v.to) inRange = true;
    }
    return { day: date.getDate(), inMonth, date, isToday, isSelected, inRange };
  }

  protected dayClass(cell: { inMonth: boolean; isToday: boolean; isSelected: boolean; inRange: boolean }): string {
    return [
      'inline-flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors',
      'disabled:opacity-30 disabled:cursor-not-allowed',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      !cell.inMonth ? 'text-muted-foreground/40' : '',
      cell.inRange ? 'bg-accent text-accent-foreground' : '',
      cell.isSelected ? 'bg-primary text-primary-foreground hover:bg-primary' : '',
      !cell.isSelected && cell.inMonth ? 'hover:bg-accent' : '',
      cell.isToday && !cell.isSelected ? 'border border-primary' : '',
    ].join(' ');
  }

  protected pick(cell: { date: Date }): void {
    if (this.mode() === 'single') {
      this.valueChange.emit(cell.date);
    } else {
      const cur = (this.value() && 'from' in this.value()! ? this.value() : { from: null, to: null }) as { from: Date | null; to: Date | null };
      if (!cur.from || (cur.from && cur.to)) {
        this.valueChange.emit({ from: cell.date, to: null });
      } else {
        const from = cur.from < cell.date ? cur.from : cell.date;
        const to = cur.from < cell.date ? cell.date : cur.from;
        this.valueChange.emit({ from, to });
      }
    }
  }

  protected prev(): void {
    const d = this.view();
    this.view.set(new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  protected next(): void {
    const d = this.view();
    this.view.set(new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  protected goToday(): void {
    this.view.set(new Date());
  }

  protected clear(): void {
    this.valueChange.emit(null);
  }
}

function sameDate(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
