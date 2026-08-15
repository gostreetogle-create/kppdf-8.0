import { TestBed } from '@angular/core/testing';
import { ProductionScaleControlsComponent } from './production-scale-controls.component';

describe('ProductionScaleControlsComponent', () => {
  it('renders RU zoom actions and fit action', () => {
    const fixture = TestBed.createComponent(ProductionScaleControlsComponent);
    fixture.componentRef.setInput('zoom', 'week');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Масштаб');
    expect(fixture.nativeElement.textContent).toContain('День');
    expect(fixture.nativeElement.textContent).toContain('Неделя');
    expect(fixture.nativeElement.textContent).toContain('Вместить сроки');
    expect(
      fixture.nativeElement.querySelector('[data-test="gantt-zoom-week"]').classList,
    ).toContain('pi-btn-ink');
  });

  it('emits zoom and fit events without owning page state', () => {
    const fixture = TestBed.createComponent(ProductionScaleControlsComponent);
    fixture.componentRef.setInput('zoom', 'day');
    const zooms: string[] = [];
    let fits = 0;
    fixture.componentInstance.zoomChange.subscribe((zoom) => zooms.push(zoom));
    fixture.componentInstance.fit.subscribe(() => {
      fits += 1;
    });
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('[data-test="gantt-zoom-week"]') as HTMLElement).click();
    (fixture.nativeElement.querySelector('[data-test="gantt-fit"]') as HTMLElement).click();

    expect(zooms).toEqual(['week']);
    expect(fits).toBe(1);
  });
});
