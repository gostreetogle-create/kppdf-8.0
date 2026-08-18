import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { EMPTY, BehaviorSubject } from 'rxjs';

import { AuthService } from '../../core/auth.service';
import { MANAGER_DESK_FIXTURE, ManagerDeskPage, type ManagerDeskPanel } from './manager-desk.page';
import { PiChromeToolsService } from '../../shared/chrome/pi-chrome-tools.service';

describe('ManagerDeskPage (TZ-DESK-405)', () => {
  let fixture: ComponentFixture<ManagerDeskPage>;
  let chromeTools: PiChromeToolsService;
  let queryParams$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let navigate: jest.Mock;

  beforeEach(async () => {
    queryParams$ = new BehaviorSubject(convertToParamMap({}));
    navigate = jest.fn().mockResolvedValue(true);

    const routerMock = {
      navigate,
      createUrlTree: jest.fn().mockReturnValue({}),
      serializeUrl: jest.fn().mockReturnValue('/desk'),
      events: EMPTY,
      url: '/desk',
    } as unknown as Router;

    await TestBed.configureTestingModule({
      imports: [ManagerDeskPage],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: queryParams$.asObservable() },
        },
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: { user: signal(null) } },
        PiChromeToolsService,
      ],
    }).compileComponents();

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
    expandedId: () => string | null;
    panel: () => ManagerDeskPanel | null;
    toggleOrder: (id: string) => void;
    openPanel: (panel: ManagerDeskPanel) => void;
    onEscape: () => void;
  } {
    return fixture.componentInstance as unknown as ManagerDeskPage & {
      expandedId: () => string | null;
      panel: () => ManagerDeskPanel | null;
      toggleOrder: (id: string) => void;
      openPanel: (panel: ManagerDeskPanel) => void;
      onEscape: () => void;
    };
  }

  it('renders one group-workspace chip row without page-chrome or custom nav', () => {
    const chips = fixture.nativeElement.querySelector('[data-test="group-chips"]');
    expect(chips).toBeTruthy();
    const links = chips.querySelectorAll('a');

    expect([...links].map((link) => link.textContent.trim())).toEqual([
      'Стол',
      'КП',
      'Комбайн',
      'Гант',
      'Снабжение',
      'Отгрузка',
    ]);
    expect(links[0].getAttribute('aria-current')).toBe('page');

    expect(fixture.nativeElement.querySelector('[data-test="desk-page-chrome"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="desk-workflow-crumbs"]')).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('Рабочий стол');
    expect(fixture.nativeElement.textContent).not.toContain('Каталог');
    expect(fixture.nativeElement.textContent).not.toContain('Админ');
  });

  it('expands one fixture row into a tray directly below it and toggles closed', () => {
    const rows = fixture.nativeElement.querySelectorAll(
      '[data-test="desk-order-row"]',
    ) as NodeListOf<HTMLButtonElement>;
    expect(rows).toHaveLength(3);
    expect([...rows].map((row) => row.getAttribute('aria-expanded'))).toEqual([
      'false',
      'false',
      'false',
    ]);
    expect(fixture.nativeElement.querySelector('[data-test="desk-order-tray"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="desk-center-innards"]')).toBeNull();

    rows[0]!.click();
    fixture.detectChanges();

    expect(page().expandedId()).toBe('desk-order-1001');
    expect(rows[0]!.getAttribute('aria-expanded')).toBe('true');
    const item = rows[0]!.parentElement!;
    const tray = item.querySelector('[data-test="desk-order-tray"]');
    expect(tray).toBeTruthy();
    expect(tray?.querySelector('[data-test="desk-tray-group-order"]')).toBeTruthy();
    expect(tray?.querySelector('[data-test="desk-tray-group-execution"]')).toBeTruthy();
    expect(tray?.querySelector('[data-test="desk-tray-group-composition"]')).toBeTruthy();
    expect(tray?.textContent).toContain('З-1001');
    expect(tray?.textContent).toContain('Черновик');
    expect(tray?.textContent).toContain('ООО Северный свет');
    expect(tray?.querySelectorAll('[data-test="desk-composition-row"]')).toHaveLength(2);
    expect(tray?.querySelector('[data-test="desk-primary-cta"]')).toBeTruthy();
    expect(
      (tray?.querySelector('[data-test="desk-primary-cta"]') as HTMLButtonElement).disabled,
    ).toBe(true);
    expect(tray?.querySelectorAll('[data-test="desk-tray-link"]')).toHaveLength(2);
    expect(fixture.nativeElement.querySelector('[data-test="desk-center-innards"]')).toBeNull();

    const crumb = fixture.nativeElement.querySelector('[data-test="desk-order-crumb"]');
    expect(crumb).toBeTruthy();
    expect(crumb?.textContent).toContain('З-1001');
    expect(crumb?.getAttribute('aria-current')).toBe('page');
    expect(fixture.nativeElement.querySelector('[data-test="group-tools"]').contains(crumb)).toBe(
      true,
    );

    rows[1]!.click();
    fixture.detectChanges();
    expect(page().expandedId()).toBe('desk-order-1002');
    expect(rows[0]!.getAttribute('aria-expanded')).toBe('false');
    expect(rows[1]!.getAttribute('aria-expanded')).toBe('true');
    expect(fixture.nativeElement.querySelectorAll('[data-test="desk-order-tray"]')).toHaveLength(1);
    expect(
      fixture.nativeElement.querySelector('[data-test="desk-order-tray"]')?.textContent,
    ).toContain('З-1002');
    expect(
      fixture.nativeElement.querySelector('[data-test="desk-order-crumb"]')?.textContent,
    ).toContain('З-1002');

    rows[1]!.click();
    fixture.detectChanges();
    expect(page().expandedId()).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="desk-order-tray"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="desk-order-crumb"]')).toBeNull();
  });

  it('keeps the queue scroll contract and never owns an orders HTTP path', () => {
    const orders = fixture.nativeElement.querySelector('.manager-desk__orders');
    expect(orders).toBeTruthy();

    const source = require('fs').readFileSync(
      require('path').join(__dirname, 'manager-desk.page.ts'),
      'utf8',
    );
    const traySource = require('fs').readFileSync(
      require('path').join(__dirname, 'desk-order-tray.component.ts'),
      'utf8',
    );
    expect(source).toContain('max-height: min(60vh, calc(100dvh - 8rem))');
    expect(source).toContain('overflow-y: auto');
    expect(source).toContain('app-pi-group-workspace');
    expect(source).toContain('desk-workflow-chips');
    expect(source).not.toContain('PiPageChromeComponent');
    expect(source).not.toContain('manager-desk__workflow');
    expect(source).not.toContain('OrdersService');
    expect(source).not.toContain('/api/orders');
    expect(source).not.toContain('composition-tree');
    expect(traySource).not.toContain('OrdersService');
    expect(traySource).not.toContain('/api/orders');
    expect(traySource).not.toContain('composition-tree');
    expect(MANAGER_DESK_FIXTURE).toHaveLength(3);
  });

  it('opens left-rail panels on the left and selected-order panels on the right', () => {
    page().openPanel('create');
    fixture.detectChanges();
    let flyout = fixture.nativeElement.querySelector('[data-test="desk-flyout"]');
    expect(flyout?.getAttribute('data-panel')).toBe('create');
    expect(flyout?.getAttribute('data-side')).toBe('left');
    expect(flyout?.classList.contains('manager-desk__flyout--left')).toBe(true);
    expect(flyout?.classList.contains('manager-desk__flyout--right')).toBe(false);

    const rows = fixture.nativeElement.querySelectorAll(
      '[data-test="desk-order-row"]',
    ) as NodeListOf<HTMLButtonElement>;
    rows[1]!.click();
    fixture.detectChanges();
    page().openPanel('client');
    fixture.detectChanges();
    flyout = fixture.nativeElement.querySelector('[data-test="desk-flyout"]');
    expect(flyout?.getAttribute('data-panel')).toBe('client');
    expect(flyout?.getAttribute('data-side')).toBe('right');
    expect(flyout?.classList.contains('manager-desk__flyout--right')).toBe(true);
    expect(flyout?.classList.contains('manager-desk__flyout--left')).toBe(false);
    expect(chromeTools.leftTools().map((tool) => tool.id)).toEqual(['create', 'filter', 'summary']);
  });

  it('keeps tray-first actions, query restoration, and Escape semantics fixture-only', () => {
    const rows = fixture.nativeElement.querySelectorAll(
      '[data-test="desk-order-row"]',
    ) as NodeListOf<HTMLButtonElement>;
    rows[1]!.click();
    fixture.detectChanges();
    page().openPanel('supply');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-test="desk-order-tray"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="desk-primary-cta"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelectorAll('[data-test="desk-tray-link"]')).toHaveLength(2);
    expect(chromeTools.rightTools().map((tool) => tool.id)).toEqual([
      'client',
      'bom',
      'docs',
      'supply',
      'gantt',
      'combine',
    ]);

    page().onEscape();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test="desk-flyout"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="desk-order-tray"]')).toBeTruthy();

    navigate.mockClear();
    queryParams$.next(convertToParamMap({ orderId: 'desk-order-1003', panel: 'supply' }));
    fixture.detectChanges();
    expect(page().expandedId()).toBe('desk-order-1003');
    expect(page().panel()).toBe('supply');
    expect(
      fixture.nativeElement.querySelector('[data-test="desk-flyout"]')?.getAttribute('data-side'),
    ).toBe('right');
    expect(navigate).not.toHaveBeenCalled();
  });
});
