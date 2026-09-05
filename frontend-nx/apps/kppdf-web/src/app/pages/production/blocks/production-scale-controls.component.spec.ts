import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductionScaleControlsComponent } from './production-scale-controls.component';

describe('ProductionScaleControlsComponent (TZ-NX-GANTT-G8)', () => {
  let fixture: ComponentFixture<ProductionScaleControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductionScaleControlsComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ProductionScaleControlsComponent);
    fixture.componentRef.setInput('zoom', 'day');
    fixture.detectChanges();
  });

  it('renders grouping and zoom controls as TOC chips with explicit pressed state', () => {
    const root = fixture.nativeElement as HTMLElement;
    const orders = root.querySelector<HTMLButtonElement>('[data-test="gantt-group-orders"]');
    const workers = root.querySelector<HTMLButtonElement>('[data-test="gantt-group-workers"]');
    const day = root.querySelector<HTMLButtonElement>('[data-test="gantt-zoom-day"]');
    const month = root.querySelector<HTMLButtonElement>('[data-test="gantt-zoom-month"]');

    expect(orders?.classList.contains('gantt-toc-chip')).toBe(true);
    expect(orders?.classList.contains('bg-ink')).toBe(true);
    expect(orders?.classList.contains('text-paper')).toBe(true);
    expect(orders?.getAttribute('aria-pressed')).toBe('true');
    expect(workers?.classList.contains('gantt-toc-chip')).toBe(true);
    expect(workers?.classList.contains('text-muted-foreground')).toBe(true);
    expect(workers?.getAttribute('aria-pressed')).toBe('false');
    expect(day?.classList.contains('bg-ink')).toBe(true);
    expect(day?.getAttribute('aria-pressed')).toBe('true');
    expect(month?.getAttribute('aria-pressed')).toBe('false');
  });

  it('keeps the existing test IDs and emits group, zoom and fit events', () => {
    const root = fixture.nativeElement as HTMLElement;
    const groupSpy = jest.fn();
    const zoomSpy = jest.fn();
    const fitSpy = jest.fn();
    fixture.componentInstance.groupByChange.subscribe(groupSpy);
    fixture.componentInstance.zoomChange.subscribe(zoomSpy);
    fixture.componentInstance.fit.subscribe(fitSpy);

    root.querySelector<HTMLButtonElement>('[data-test="gantt-group-workers"]')?.click();
    root.querySelector<HTMLButtonElement>('[data-test="gantt-zoom-month"]')?.click();
    root.querySelector<HTMLButtonElement>('[data-test="gantt-fit"]')?.click();

    expect(groupSpy).toHaveBeenCalledWith('workers');
    expect(zoomSpy).toHaveBeenCalledWith('month');
    expect(fitSpy).toHaveBeenCalledTimes(1);
  });
});
