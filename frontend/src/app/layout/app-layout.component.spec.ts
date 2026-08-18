import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { Filter, List } from 'lucide-angular';

import { AppLayoutComponent } from './app-layout.component';
import { AppHistoryStore } from '../shared/navigation/app-history.store';
import { PiChromeToolsService } from '../shared/chrome/pi-chrome-tools.service';
import { AuthService } from '../core/auth.service';
import { CapabilitiesService } from '../core/capabilities/capabilities.service';
import { PiDialogService } from '../shared/ui/dialog/pi-dialog.service';
import { PiToastService } from '../shared/ui/toast/pi-toast.service';
import { API_BASE_URL } from '../core/api.tokens';

describe('AppLayoutComponent (TZ-UX-317 / TZ-UX-321-FIX / TZ-UX-322 / TZ-UX-324 / TZ-UX-331)', () => {
  let fixture: ComponentFixture<AppLayoutComponent>;
  let chromeTools: PiChromeToolsService;

  const back = jest.fn();
  const forward = jest.fn();
  // Реальный AppHistoryStore использует computed-сигналы — мок тоже должен
  // быть реактивным: Angular 20 кеширует вызовы обычных функций в binding'ах
  // до пометки view dirty, а signal.set() помечает сразу.
  let canGoBackSig: ReturnType<typeof signal<boolean>>;
  let canGoForwardSig: ReturnType<typeof signal<boolean>>;

  beforeEach(async () => {
    jest.clearAllMocks();
    canGoBackSig = signal(true);
    canGoForwardSig = signal(true);

    await TestBed.configureTestingModule({
      imports: [AppLayoutComponent],
      providers: [
        { provide: Router, useValue: { events: of(), url: '/doc-constructor/templates' } },
        {
          provide: AuthService,
          useValue: {
            user: signal(null),
            isAuthenticated: signal(false),
            ensureUser: jest.fn().mockResolvedValue(undefined),
            logout: jest.fn().mockResolvedValue(undefined),
            accessToken: () => null,
          },
        },
        { provide: CapabilitiesService, useValue: { hasAny: () => true } },
        { provide: PiDialogService, useValue: { open: jest.fn() } },
        { provide: PiToastService, useValue: { error: jest.fn(), success: jest.fn() } },
        { provide: API_BASE_URL, useValue: '/api' },
        {
          provide: AppHistoryStore,
          useValue: {
            canGoBack: canGoBackSig,
            canGoForward: canGoForwardSig,
            back,
            forward,
          },
        },
        PiChromeToolsService,
      ],
    })
      .overrideComponent(AppLayoutComponent, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
    chromeTools = TestBed.inject(PiChromeToolsService);
    chromeTools.clear('production-cockpit');
    chromeTools.clear('spec-owner');
    fixture = TestBed.createComponent(AppLayoutComponent);
    fixture.detectChanges();
  });

  const backBtn = (): HTMLButtonElement | null =>
    fixture.nativeElement.querySelector('[data-test="app-nav-back"]');
  const forwardBtn = (): HTMLButtonElement | null =>
    fixture.nativeElement.querySelector('[data-test="app-nav-forward"]');
  const leftRail = (): HTMLElement | null =>
    fixture.nativeElement.querySelector('[data-test="app-chrome-rail-left"]');
  const rightRail = (): HTMLElement | null =>
    fixture.nativeElement.querySelector('[data-test="app-chrome-rail-right"]');

  it('TZ-DESK-401: brand home chip links to / with Рабочий стол aria (не Комбайн)', () => {
    const brand = fixture.nativeElement.querySelector(
      'a[data-test="nav-brand-home"]',
    ) as HTMLAnchorElement | null;
    expect(brand).toBeTruthy();
    expect(brand!.getAttribute('aria-label') ?? '').toBe('Рабочий стол — главная');
    expect(brand!.getAttribute('title') ?? '').toBe('Рабочий стол — главная');
    expect(brand!.textContent ?? '').toContain('KPPDF');

    const source = require('fs').readFileSync(
      require('path').join(__dirname, 'app-layout.component.ts'),
      'utf8',
    );
    expect(source).toContain('data-test="nav-brand-home"');
    expect(source).toMatch(/routerLink="\/"/);
    expect(source).toContain('Рабочий стол — главная');
    expect(source).not.toContain('Обзор — главная');
    expect(source).not.toContain('Комбайн заказов — главная');
    expect(source).toContain('bg-sunrise-warm');
    expect(source).toContain('bg-sunrise-soft');
  });

  it('TZ-UX-317: renders both gutter buttons with the canonical data-test', () => {
    expect(backBtn()).toBeTruthy();
    expect(forwardBtn()).toBeTruthy();
  });

  it('TZ-UX-317: clicking ← calls history back, → calls forward', () => {
    backBtn()!.click();
    expect(back).toHaveBeenCalledTimes(1);
    forwardBtn()!.click();
    expect(forward).toHaveBeenCalledTimes(1);
  });

  it('TZ-UX-317: ← disabled + aria-disabled when the store cannot go back', () => {
    canGoBackSig.set(false);
    fixture.detectChanges();

    expect(backBtn()!.disabled).toBe(true);
    expect(backBtn()!.getAttribute('aria-disabled')).toBe('true');
    // Forward stays available.
    expect(forwardBtn()!.disabled).toBe(false);

    backBtn()!.click();
    expect(back).not.toHaveBeenCalled();
  });

  it('TZ-UX-317: → disabled + aria-disabled when the store cannot go forward', () => {
    canGoForwardSig.set(false);
    fixture.detectChanges();

    expect(forwardBtn()!.disabled).toBe(true);
    expect(forwardBtn()!.getAttribute('aria-disabled')).toBe('true');
    expect(backBtn()!.disabled).toBe(false);

    forwardBtn()!.click();
    expect(forward).not.toHaveBeenCalled();
  });

  it('TZ-UX-321-FIX: left rail owns back; right rail owns forward; no app-nav-gutter', () => {
    expect(leftRail()).toBeTruthy();
    expect(rightRail()).toBeTruthy();
    expect(leftRail()!.contains(backBtn()!)).toBe(true);
    expect(rightRail()!.contains(forwardBtn()!)).toBe(true);
    expect(leftRail()!.contains(forwardBtn()!)).toBe(false);
    expect(rightRail()!.contains(backBtn()!)).toBe(false);

    const source = require('fs').readFileSync(
      require('path').join(__dirname, 'app-layout.component.ts'),
      'utf8',
    );
    expect(source).toContain('data-test="app-chrome-rail-left"');
    expect(source).toContain('data-test="app-chrome-rail-right"');
    expect(source).toContain('app-chrome-rail-left');
    expect(source).toContain('app-chrome-rail-right');
    expect(source).toContain('width: 64px');
    expect(source).toContain('left: 0');
    expect(source).toContain('right: 0');
    expect(source).not.toContain('position: fixed');
    expect(source).not.toContain('app-nav-gutter');
    expect(source).not.toContain('left: 64px');
    expect(source).not.toContain('right: 64px');
    expect(source).not.toContain('left: 14px');
    expect(source).not.toContain('right: 14px');
    expect(source).toContain('@media (min-width: 1680px)');
    expect(source).toContain('display: flex');
  });

  it('TZ-UX-322: setTools renders chrome-tool buttons under history; clear removes them', () => {
    const onOrders = jest.fn();
    const onCard = jest.fn();

    expect(fixture.nativeElement.querySelector('[data-test="chrome-tool-orders"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="chrome-tool-card"]')).toBeNull();

    chromeTools.setTools('spec-owner', [
      {
        id: 'orders',
        side: 'left',
        ariaLabel: 'Заказы',
        title: 'Заказы',
        icon: List,
        onClick: onOrders,
        order: 1,
      },
      {
        id: 'card',
        side: 'right',
        ariaLabel: 'Карточка',
        title: 'Карточка',
        icon: Filter,
        active: true,
        ariaExpanded: true,
        ariaControls: 'flyout-card',
        onClick: onCard,
        order: 1,
      },
    ]);
    fixture.detectChanges();

    const ordersBtn = fixture.nativeElement.querySelector(
      '[data-test="chrome-tool-orders"]',
    ) as HTMLButtonElement | null;
    const cardBtn = fixture.nativeElement.querySelector(
      '[data-test="chrome-tool-card"]',
    ) as HTMLButtonElement | null;

    expect(ordersBtn).toBeTruthy();
    expect(cardBtn).toBeTruthy();
    expect(leftRail()!.contains(ordersBtn!)).toBe(true);
    expect(rightRail()!.contains(cardBtn!)).toBe(true);
    expect(ordersBtn!.getAttribute('aria-label')).toBe('Заказы');
    expect(cardBtn!.getAttribute('aria-expanded')).toBe('true');
    expect(cardBtn!.classList.contains('is-active')).toBe(true);
    expect(ordersBtn!.classList.contains('app-chrome-page-tool')).toBe(true);
    expect(cardBtn!.classList.contains('app-chrome-page-tool')).toBe(true);
    expect(backBtn()!.classList.contains('app-chrome-page-tool')).toBe(false);

    // History arrows remain.
    expect(backBtn()).toBeTruthy();
    expect(forwardBtn()).toBeTruthy();

    ordersBtn!.click();
    expect(onOrders).toHaveBeenCalledTimes(1);
    cardBtn!.click();
    expect(onCard).toHaveBeenCalledTimes(1);

    chromeTools.clear('spec-owner');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-test="chrome-tool-orders"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="chrome-tool-card"]')).toBeNull();
    expect(backBtn()).toBeTruthy();
    expect(forwardBtn()).toBeTruthy();
  });

  it('TZ-UX-324: spacer appears only when tools exist on that side', () => {
    expect(
      fixture.nativeElement.querySelectorAll('[data-test="chrome-rail-tools-gap"]').length,
    ).toBe(0);

    chromeTools.setTools('spec-owner', [
      {
        id: 'orders',
        side: 'left',
        ariaLabel: 'Заказы',
        title: 'Заказы',
        icon: List,
        onClick: jest.fn(),
        order: 1,
      },
    ]);
    fixture.detectChanges();

    const gapsAfterLeft = fixture.nativeElement.querySelectorAll(
      '[data-test="chrome-rail-tools-gap"]',
    ) as NodeListOf<HTMLElement>;
    expect(gapsAfterLeft.length).toBe(1);
    expect(leftRail()!.contains(gapsAfterLeft[0]!)).toBe(true);
    expect(gapsAfterLeft[0]!.getAttribute('aria-hidden')).toBe('true');
    expect(rightRail()!.querySelector('[data-test="chrome-rail-tools-gap"]')).toBeNull();

    chromeTools.setTools('spec-owner', [
      {
        id: 'orders',
        side: 'left',
        ariaLabel: 'Заказы',
        title: 'Заказы',
        icon: List,
        onClick: jest.fn(),
        order: 1,
      },
      {
        id: 'card',
        side: 'right',
        ariaLabel: 'Карточка',
        title: 'Карточка',
        icon: Filter,
        onClick: jest.fn(),
        order: 1,
      },
    ]);
    fixture.detectChanges();

    const gapsBoth = fixture.nativeElement.querySelectorAll('[data-test="chrome-rail-tools-gap"]');
    expect(gapsBoth.length).toBe(2);
    expect(leftRail()!.querySelector('[data-test="chrome-rail-tools-gap"]')).toBeTruthy();
    expect(rightRail()!.querySelector('[data-test="chrome-rail-tools-gap"]')).toBeTruthy();

    chromeTools.clear('spec-owner');
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelectorAll('[data-test="chrome-rail-tools-gap"]').length,
    ).toBe(0);
  });
});
