import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { OrderHubTrayComponent } from './order-hub-tray.component';
import type { Order } from '../services/orders.service';
import { SupplyTaskService } from '../services/pi-supply.service';
import { ProductModulesService } from '../services/pi-product-modules.service';
import { ProductsService } from '../services/products.service';
import { MaterialsService } from '../services/materials.service';
import { ShipmentsService } from '../services/shipments.service';
import { PiDialogService } from '../ui/dialog/pi-dialog.service';
import { PiToastService } from '../ui/toast';

const ORDER: Order = {
  _id: 'o1',
  number: 'ORD-001',
  status: 'confirmed',
  priority: 'normal',
  items: [],
};

describe('OrderHubTrayComponent TZ-DESK-416 production link', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderHubTrayComponent],
      providers: [
        provideRouter([{ path: 'production', children: [] }]),
        { provide: SupplyTaskService, useValue: { list: () => of({ ok: true, data: [] }) } },
        {
          provide: ProductModulesService,
          useValue: {
            getProductTree: () =>
              of({
                ok: true,
                data: { _id: 'p1', name: 'Изделие', kind: 'product', quantity: 1, children: [] },
              }),
          },
        },
        { provide: ProductsService, useValue: {} },
        { provide: MaterialsService, useValue: {} },
        { provide: ShipmentsService, useValue: { list: () => of({ ok: true, data: [] }) } },
        { provide: PiDialogService, useValue: {} },
        { provide: PiToastService, useValue: {} },
      ],
    }).compileComponents();
  });

  function expandSupply(mode: 'hub' | 'desk') {
    const fixture = TestBed.createComponent(OrderHubTrayComponent);
    fixture.componentRef.setInput('order', ORDER);
    fixture.componentRef.setInput('mode', mode);
    fixture.detectChanges();
    const supplyToggle = fixture.nativeElement.querySelector(
      '[data-test="order-group-supply"] > button',
    ) as HTMLButtonElement;
    supplyToggle?.click();
    fixture.detectChanges();
    return fixture;
  }

  function productionHref(mode: 'hub' | 'desk'): string {
    const fixture = expandSupply(mode);
    const link = fixture.nativeElement.querySelector(
      '[data-test="order-production-link"]',
    ) as HTMLAnchorElement;
    return link?.getAttribute('href') ?? '';
  }

  it('DESK-425: desk mode has no production link — superseded by inline summary', () => {
    const fixture = expandSupply('desk');
    expect(fixture.nativeElement.querySelector('[data-test="order-production-link"]')).toBeNull();
    expect(
      fixture.nativeElement.querySelector('[data-test="order-production-summary"]'),
    ).not.toBeNull();
  });

  it('hub-mode production link has orderId only (no from)', () => {
    const href = productionHref('hub');
    expect(href).toContain('/production');
    expect(href).toContain('orderId=o1');
    expect(href).not.toContain('from=');
  });

  it('desk empty composition uses an operator button and click-gated confirm hint', () => {
    const fixture = TestBed.createComponent(OrderHubTrayComponent);
    fixture.componentRef.setInput('order', {
      ...ORDER,
      status: 'draft',
      siteId: 'site1',
      items: [],
    });
    fixture.componentRef.setInput('mode', 'desk');
    fixture.detectChanges();
    const tray = fixture.nativeElement as HTMLElement;
    expect(tray.textContent).not.toContain('Нет изделий');
    expect(tray.querySelector('[data-test="desk-add-line-cta"]')?.textContent).toContain(
      'Добавить изделие',
    );
    expect(tray.querySelector('[data-test="desk-primary-cta-hint"]')).toBeNull();
    (tray.querySelector('[data-test="desk-primary-cta"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(tray.querySelector('[data-test="desk-primary-cta-hint"]')).toBeTruthy();
    expect(tray.querySelector('[data-test="desk-primary-cta-hint"]')?.textContent).toContain(
      'Добавьте изделия',
    );
  });

  it('TZ-DESK-424: desk primary CTA is gold-on-paper when confirmable, not a black hole', () => {
    const fixture = TestBed.createComponent(OrderHubTrayComponent);
    fixture.componentRef.setInput('order', {
      ...ORDER,
      status: 'draft',
      siteId: 'site1',
      items: [{ productId: 'p1', quantity: 1, unitPrice: 1 }],
    });
    fixture.componentRef.setInput('mode', 'desk');
    fixture.detectChanges();
    const cta = fixture.nativeElement.querySelector(
      '[data-test="desk-primary-cta"]',
    ) as HTMLButtonElement;
    expect(cta.classList.contains('bg-gold')).toBe(true);
    expect(cta.classList.contains('text-ink')).toBe(true);
    expect(cta.classList.contains('bg-ink')).toBe(false);
    expect(cta.classList.contains('text-paper')).toBe(false);
  });

  it('TZ-DESK-424: desk primary CTA is an outline (not gold) when not confirmable', () => {
    const fixture = TestBed.createComponent(OrderHubTrayComponent);
    fixture.componentRef.setInput('order', { ...ORDER, status: 'draft', items: [] });
    fixture.componentRef.setInput('mode', 'desk');
    fixture.detectChanges();
    const cta = fixture.nativeElement.querySelector(
      '[data-test="desk-primary-cta"]',
    ) as HTMLButtonElement;
    expect(cta.classList.contains('bg-gold')).toBe(false);
    expect(cta.classList.contains('bg-paper')).toBe(true);
    expect(cta.classList.contains('text-muted-foreground')).toBe(true);
  });

  it('TZ-DESK-424: desk summary bar does not repeat the client name (it is already in the queue row)', () => {
    const fixture = TestBed.createComponent(OrderHubTrayComponent);
    fixture.componentRef.setInput('order', ORDER);
    fixture.componentRef.setInput('mode', 'desk');
    fixture.componentRef.setInput('clientLabel', 'ООО Северный свет');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test="order-summary-client"]')).toBeNull();
  });

  function expandLogistics(order: Order) {
    const fixture = TestBed.createComponent(OrderHubTrayComponent);
    fixture.componentRef.setInput('order', order);
    fixture.componentRef.setInput('mode', 'desk');
    fixture.detectChanges();
    const toggle = fixture.nativeElement.querySelector(
      '[data-test="order-group-logistics"] > button',
    ) as HTMLButtonElement;
    // ready/shipped orders auto-expand logistics in ngOnInit — only toggle if collapsed.
    if (toggle.getAttribute('aria-expanded') === 'false') {
      toggle.click();
      fixture.detectChanges();
    }
    return fixture;
  }

  it('DESK-430: eligible order (confirmed) shows the «Отгружено» button, not a link', () => {
    const fixture = expandLogistics(ORDER); // status: confirmed
    const tray = fixture.nativeElement as HTMLElement;
    expect(tray.querySelector('[data-test="desk-ship-button"]')).toBeTruthy();
    expect(tray.querySelector('[data-test="order-shipping-link"]')).toBeNull();
    expect(tray.querySelector('[data-test="order-shipment-block"]')).toBeNull();
  });

  it('DESK-430: cancelled order shows neither the ship button nor a shipment block', () => {
    const fixture = expandLogistics({ ...ORDER, status: 'cancelled' });
    const tray = fixture.nativeElement as HTMLElement;
    expect(tray.querySelector('[data-test="desk-ship-button"]')).toBeNull();
    expect(tray.querySelector('[data-test="order-shipping-summary"]')?.textContent).toContain(
      'Отменён',
    );
  });

  it('DESK-430: shipped order shows the shipment block with "Документ не оформлен" (no docs)', () => {
    const fixture = expandLogistics({ ...ORDER, status: 'shipped' });
    const tray = fixture.nativeElement as HTMLElement;
    expect(tray.querySelector('[data-test="desk-ship-button"]')).toBeNull();
    expect(tray.querySelector('[data-test="order-shipment-block"]')).toBeTruthy();
    expect(tray.querySelector('[data-test="order-shipment-no-docs"]')?.textContent).toContain(
      'Документ не оформлен',
    );
  });

  it('desk execution groups start collapsed and use compact actions', () => {
    const fixture = TestBed.createComponent(OrderHubTrayComponent);
    fixture.componentRef.setInput('order', {
      ...ORDER,
      items: [{ productId: 'p1', quantity: 1, unitPrice: 1 }],
    });
    fixture.componentRef.setInput('mode', 'desk');
    fixture.detectChanges();
    const tray = fixture.nativeElement as HTMLElement;
    expect(
      tray
        .querySelector('[data-test="order-group-supply"] > button')
        ?.getAttribute('aria-expanded'),
    ).toBe('false');
    expect(
      tray
        .querySelector('[data-test="order-group-logistics"] > button')
        ?.getAttribute('aria-expanded'),
    ).toBe('false');
    expect(tray.querySelector('[data-test="order-supply-link"]')).toBeNull();
    expect(tray.querySelector('[data-test="desk-notebook-button"]')).toBeTruthy();
    expect(tray.textContent).not.toContain('Оценка в цехе');
    expect(tray.textContent).not.toContain('Отгрузка пока не ведётся');
  });

  // ── TZ-SHIP-433: отмена ошибочной отгрузки ──

  function withShipments(shipments: Array<Record<string, unknown>>) {
    TestBed.overrideProvider(ShipmentsService, {
      useValue: { list: () => of({ ok: true, data: shipments }) },
    });
    const fixture = TestBed.createComponent(OrderHubTrayComponent);
    fixture.componentRef.setInput('order', { ...ORDER, status: 'shipped' });
    fixture.componentRef.setInput('mode', 'desk');
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('433: cancelled shipment is not the active shipment (summary shows —, no cancel)', () => {
    const tray = withShipments([
      {
        _id: 's1',
        number: 'SHP-1',
        status: 'cancelled',
        date: '2026-08-20T10:00:00.000Z',
        items: [],
      },
    ]);
    // Активной отгрузки нет — блок показывает «—», а не отменённую SHP-1.
    expect(tray.querySelector('[data-test="order-shipment-summary"]')?.textContent).not.toContain(
      'SHP-1',
    );
    expect(tray.querySelector('[data-test="desk-cancel-shipment-button"]')).toBeNull();
  });

  it('433: scheduled shipment shows «Отменить отгрузку»', () => {
    const tray = withShipments([
      {
        _id: 's1',
        number: 'SHP-1',
        status: 'scheduled',
        date: '2026-08-20T10:00:00.000Z',
        items: [],
      },
    ]);
    const cancel = tray.querySelector('[data-test="desk-cancel-shipment-button"]');
    expect(cancel).toBeTruthy();
  });

  it('433: in-transit shipment hides the cancel button (dispatch already happened)', () => {
    const tray = withShipments([
      {
        _id: 's1',
        number: 'SHP-1',
        status: 'in_transit',
        dispatchedAt: '2026-08-20T12:00:00.000Z',
        date: '2026-08-20T10:00:00.000Z',
        items: [],
      },
    ]);
    expect(tray.querySelector('[data-test="order-shipment-summary"]')?.textContent).toContain(
      'SHP-1',
    );
    expect(tray.querySelector('[data-test="desk-cancel-shipment-button"]')).toBeNull();
  });

  it('428: disclosure header shows a chevron that rotates and a state badge on toggle', () => {
    const fixture = TestBed.createComponent(OrderHubTrayComponent);
    fixture.componentRef.setInput('order', ORDER);
    fixture.componentRef.setInput('mode', 'hub');
    fixture.detectChanges();
    const tray = fixture.nativeElement as HTMLElement;
    const toggle = tray.querySelector(
      '[data-test="order-composition-toggle"]',
    ) as HTMLButtonElement;
    expect(toggle).toBeTruthy();

    // Collapsed: chevron present, not rotated; badge says «раскрыть».
    const icon = toggle.querySelector('lucide-icon') as HTMLElement;
    expect(icon).toBeTruthy();
    expect(icon.classList.contains('rotate-180')).toBe(false);
    expect(toggle.textContent).toContain('раскрыть');
    expect(toggle.textContent).not.toContain('свернуть');
    expect(toggle.classList.contains('hover:bg-paper-2')).toBe(true);

    toggle.click();
    fixture.detectChanges();

    // Expanded: chevron rotated 180°, badge flips to «свернуть».
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(toggle.querySelector('lucide-icon')?.classList.contains('rotate-180')).toBe(true);
    expect(toggle.textContent).toContain('свернуть');
  });

  it('433: after cancel (only cancelled left) tray shows «Отгружено» again for a ready order', () => {
    TestBed.overrideProvider(ShipmentsService, {
      useValue: {
        list: () =>
          of({
            ok: true,
            data: [
              {
                _id: 's1',
                number: 'SHP-1',
                status: 'cancelled',
                date: '2026-08-20T10:00:00.000Z',
                items: [],
              },
            ],
          }),
      },
    });
    const fixture = TestBed.createComponent(OrderHubTrayComponent);
    fixture.componentRef.setInput('order', { ...ORDER, status: 'ready' });
    fixture.componentRef.setInput('mode', 'desk');
    fixture.detectChanges();
    const tray = fixture.nativeElement as HTMLElement;
    expect(tray.querySelector('[data-test="desk-ship-button"]')).toBeTruthy();
    expect(tray.querySelector('[data-test="order-shipment-block"]')).toBeNull();
  });
});
