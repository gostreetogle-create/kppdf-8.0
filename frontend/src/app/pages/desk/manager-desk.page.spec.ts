import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { MANAGER_DESK_FIXTURE, ManagerDeskPage, type ManagerDeskPanel } from './manager-desk.page';
import { PiChromeToolsService } from '../../shared/chrome/pi-chrome-tools.service';

describe('ManagerDeskPage (TZ-DESK-401)', () => {
  let fixture: ComponentFixture<ManagerDeskPage>;
  let chromeTools: PiChromeToolsService;
  let queryParams$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let navigate: jest.Mock;

  beforeEach(async () => {
    queryParams$ = new BehaviorSubject(convertToParamMap({}));
    navigate = jest.fn().mockResolvedValue(true);

    await TestBed.configureTestingModule({
      imports: [ManagerDeskPage],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: queryParams$.asObservable() },
        },
        { provide: Router, useValue: { navigate } },
        PiChromeToolsService,
      ],
    })
      .overrideComponent(ManagerDeskPage, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    chromeTools = TestBed.inject(PiChromeToolsService);
    chromeTools.clear('manager-desk');
    fixture = TestBed.createComponent(ManagerDeskPage);
    fixture.detectChanges();
  });

  afterEach(() => {
    chromeTools.clear('manager-desk');
    fixture.destroy();
  });

  function page(): ManagerDeskPage & {
    selectedId: () => string | null;
    panel: () => ManagerDeskPanel | null;
    selectOrder: (id: string) => void;
    openPanel: (panel: ManagerDeskPanel) => void;
    onEscape: () => void;
  } {
    return fixture.componentInstance as unknown as ManagerDeskPage & {
      selectedId: () => string | null;
      panel: () => ManagerDeskPanel | null;
      selectOrder: (id: string) => void;
      openPanel: (panel: ManagerDeskPanel) => void;
      onEscape: () => void;
    };
  }

  it('renders exactly three local fixture rows and never owns an orders HTTP path', () => {
    const rows = fixture.nativeElement.querySelectorAll('[data-test="desk-order-row"]');

    expect(rows).toHaveLength(3);
    expect([...rows].map((row) => row.getAttribute('data-status'))).toEqual([
      'draft',
      'in_production',
      'ready',
    ]);
    expect(fixture.nativeElement.textContent).toContain('З-1001');
    expect(fixture.nativeElement.textContent).toContain('ООО Северный свет');
    expect(fixture.nativeElement.textContent).toContain('ИП Марина Волкова');
    expect(MANAGER_DESK_FIXTURE.every((order) => typeof order.clientLabel === 'string')).toBe(true);

    const source = require('fs').readFileSync(
      require('path').join(__dirname, 'manager-desk.page.ts'),
      'utf8',
    );
    expect(source).not.toContain('OrdersService');
    expect(source).not.toContain('/api/orders');
    expect(source).not.toContain('composition-tree');
  });

  it('selecting a row renders innards and projects only the selected order actions', () => {
    const rows = fixture.nativeElement.querySelectorAll(
      '[data-test="desk-order-row"]',
    ) as NodeListOf<HTMLButtonElement>;
    expect(chromeTools.rightTools()).toEqual([]);
    expect(fixture.nativeElement.querySelector('[data-test="desk-right-tools"]')).toBeNull();

    rows[0]!.click();
    fixture.detectChanges();

    expect(page().selectedId()).toBe('desk-order-1001');
    expect(fixture.nativeElement.querySelector('[data-test="desk-center-innards"]')).toBeTruthy();
    expect(
      fixture.nativeElement.querySelectorAll('[data-test="desk-composition-row"]'),
    ).toHaveLength(2);
    expect(
      fixture.nativeElement.querySelector('[data-test="desk-primary-cta"]')?.textContent,
    ).toContain('Подтвердить');
    expect(
      (fixture.nativeElement.querySelector('[data-test="desk-primary-cta"]') as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    expect(fixture.nativeElement.querySelector('[data-test="desk-right-tools"]')).toBeTruthy();
    expect(chromeTools.rightTools().map((tool) => tool.id)).toEqual([
      'client',
      'bom',
      'docs',
      'gantt',
      'combine',
    ]);
    expect(chromeTools.rightTools().find((tool) => tool.id === 'supply')).toBeUndefined();
  });

  it('shows supply only for production/ready and maps the primary CTA by status', () => {
    const rows = fixture.nativeElement.querySelectorAll(
      '[data-test="desk-order-row"]',
    ) as NodeListOf<HTMLButtonElement>;

    rows[1]!.click();
    fixture.detectChanges();
    expect(chromeTools.rightTools().map((tool) => tool.id)).toEqual([
      'client',
      'bom',
      'docs',
      'supply',
      'gantt',
      'combine',
    ]);
    expect(
      fixture.nativeElement.querySelector('[data-test="desk-primary-cta"]')?.textContent,
    ).toContain('К отгрузке');

    rows[2]!.click();
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[data-test="desk-primary-cta"]')?.textContent,
    ).toContain('Отгрузить');
    expect(chromeTools.rightTools().find((tool) => tool.id === 'supply')).toBeTruthy();
  });

  it('uses the same create handler for the empty CTA and left chrome tool, with one right flyout', () => {
    const emptyCreate = fixture.nativeElement.querySelector(
      '[data-test="desk-empty-create"]',
    ) as HTMLButtonElement;
    emptyCreate.click();
    fixture.detectChanges();

    expect(page().panel()).toBe('create');
    expect(fixture.nativeElement.querySelector('[data-test="desk-flyout"]')).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('[data-test="desk-flyout"]')?.getAttribute('data-panel'),
    ).toBe('create');
    expect(fixture.nativeElement.querySelectorAll('[data-test="desk-flyout"]')).toHaveLength(1);
    expect(fixture.nativeElement.textContent).toContain(
      'Здесь будет форма (после одобрения раскладки)',
    );

    const close = fixture.nativeElement.querySelector(
      '[data-test="desk-flyout-close"]',
    ) as HTMLButtonElement;
    close.click();
    fixture.detectChanges();
    expect(page().panel()).toBeNull();

    chromeTools
      .leftTools()
      .find((tool) => tool.id === 'summary')!
      .onClick();
    fixture.detectChanges();
    expect(page().panel()).toBe('summary');
    expect(
      fixture.nativeElement.querySelector('[data-test="desk-flyout"] h1')?.textContent,
    ).toContain('Сводка');
  });

  it('keeps DESK-404 studio actions disabled and closes the overlay on Escape/backdrop', () => {
    const rows = fixture.nativeElement.querySelectorAll(
      '[data-test="desk-order-row"]',
    ) as NodeListOf<HTMLButtonElement>;
    rows[1]!.click();
    fixture.detectChanges();

    for (const id of ['gantt', 'combine']) {
      const tool = chromeTools.rightTools().find((item) => item.id === id);
      expect(tool?.disabled).toBe(true);
      expect(tool?.title).toContain('DESK-404');
      expect(tool?.onClick).toBeDefined();
    }

    chromeTools
      .rightTools()
      .find((tool) => tool.id === 'client')!
      .onClick();
    fixture.detectChanges();
    expect(page().panel()).toBe('client');
    page().onEscape();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test="desk-flyout"]')).toBeNull();

    chromeTools
      .rightTools()
      .find((tool) => tool.id === 'docs')!
      .onClick();
    fixture.detectChanges();
    (
      fixture.nativeElement.querySelector('[data-test="desk-flyout-backdrop"]') as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    expect(page().panel()).toBeNull();
  });

  it('restores a valid order and panel from query params without requesting data', () => {
    queryParams$.next(convertToParamMap({ orderId: 'desk-order-1003', panel: 'supply' }));
    fixture.detectChanges();

    expect(page().selectedId()).toBe('desk-order-1003');
    expect(page().panel()).toBe('supply');
    expect(
      fixture.nativeElement.querySelector('[data-test="desk-flyout"]')?.getAttribute('data-panel'),
    ).toBe('supply');
    expect(navigate).not.toHaveBeenCalled();
  });
});
