import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { ShellToolRailService } from '../../layout/shell-tool-rail.service';
import { ProductionCockpitPage } from './production-cockpit.page';

describe('ProductionCockpitPage (TZ-NX-GANTT-G1-SHELL-ROUTE)', () => {
  async function setup(query: Record<string, string> = {}): Promise<{
    fixture: ComponentFixture<ProductionCockpitPage>;
    rails: ShellToolRailService;
  }> {
    const rails = new ShellToolRailService();
    await TestBed.configureTestingModule({
      imports: [ProductionCockpitPage],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap(query) } },
        },
        { provide: ShellToolRailService, useValue: rails },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(ProductionCockpitPage);
    fixture.detectChanges();
    return { fixture, rails };
  }

  it('renders the RU shell placeholder with title', async () => {
    const { fixture } = await setup();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="production-page"]')).toBeTruthy();
    expect(el.textContent).toContain('Производство');
    expect(el.textContent).toContain('Гант');
  });

  it('registers left tools Заказы/Фильтры/Обновить and right Сегодня (enabled, no-op handlers)', async () => {
    const { rails } = await setup();
    const left = rails.leftTools();
    const right = rails.rightTools();
    expect(left.map((t) => t.id)).toEqual(['orders', 'filters', 'refresh']);
    expect(right.map((t) => t.id)).toEqual(['today']);
    for (const tool of [...left, ...right]) {
      expect(tool.disabled).toBeUndefined();
      expect(tool.ariaLabel).toBeTruthy();
    }
    expect(left[0]!.title).toBe('Заказы');
    expect(right[0]!.title).toContain('Прокрутить к сегодня');
  });

  it('reads ?orderId= and ?from=desk deep-link params', async () => {
    const { fixture } = await setup({ orderId: 'order-42', from: 'desk' });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="production-deep-link"]')?.textContent).toContain('order-42');
  });

  it('clears the rail tools on destroy (owner "production")', async () => {
    const { fixture, rails } = await setup();
    expect(rails.leftTools().length).toBeGreaterThan(0);
    fixture.destroy();
    // Service falls back to the shared disabled demo placeholders — not the page's tools.
    expect(rails.leftTools().some((t) => t.id === 'orders')).toBe(false);
  });
});