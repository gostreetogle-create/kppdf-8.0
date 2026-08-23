import { TestBed } from '@angular/core/testing';
import { ProductionScaleControlsComponent } from './production-scale-controls.component';

describe('ProductionScaleControlsComponent', () => {
  it('renders horizontal toolbar with group + zoom actions', () => {
    const fixture = TestBed.createComponent(ProductionScaleControlsComponent);
    fixture.componentRef.setInput('zoom', 'month');
    fixture.componentRef.setInput('groupBy', 'orders');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-test="gantt-toolbar"]')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('По заказам');
    expect(fixture.nativeElement.textContent).toContain('По рабочим');
    expect(fixture.nativeElement.textContent).toContain('День');
    expect(fixture.nativeElement.textContent).toContain('Месяц');
    expect(fixture.nativeElement.textContent).not.toContain('Неделя');
    expect(fixture.nativeElement.textContent).toContain('Вместить сроки');
    expect(fixture.nativeElement.textContent).not.toMatch(/^\s*Масштаб\s*$/m);
    expect(
      fixture.nativeElement.querySelector('[data-test="gantt-zoom-month"]').classList,
    ).toContain('pi-btn-ink');
  });

  it('TZ-UI-DEN-560: toolbar buttons use compact 32px / 13px density', () => {
    const fixture = TestBed.createComponent(ProductionScaleControlsComponent);
    fixture.componentRef.setInput('zoom', 'month');
    fixture.componentRef.setInput('groupBy', 'orders');
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector(
      '[data-test="gantt-group-orders"]',
    ) as HTMLElement;
    expect(btn.className).toMatch(/!h-8/);
    expect(btn.className).toMatch(/!text-\[13px\]/);
  });

  it('emits zoom, groupBy and fit events without owning page state', () => {
    const fixture = TestBed.createComponent(ProductionScaleControlsComponent);
    fixture.componentRef.setInput('zoom', 'day');
    fixture.componentRef.setInput('groupBy', 'orders');
    const zooms: string[] = [];
    const groups: string[] = [];
    let fits = 0;
    fixture.componentInstance.zoomChange.subscribe((zoom) => zooms.push(zoom));
    fixture.componentInstance.groupByChange.subscribe((g) => groups.push(g));
    fixture.componentInstance.fit.subscribe(() => {
      fits += 1;
    });
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('[data-test="gantt-zoom-month"]') as HTMLElement).click();
    (
      fixture.nativeElement.querySelector('[data-test="gantt-group-workers"]') as HTMLElement
    ).click();
    (fixture.nativeElement.querySelector('[data-test="gantt-fit"]') as HTMLElement).click();

    expect(zooms).toEqual(['month']);
    expect(groups).toEqual(['workers']);
    expect(fits).toBe(1);
  });
});
