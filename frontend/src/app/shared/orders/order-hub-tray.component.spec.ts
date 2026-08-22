import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { OrderHubTrayComponent } from './order-hub-tray.component';
import type { Order } from '../services/orders.service';
import { SupplyTaskService } from '../services/pi-supply.service';
import { ProductModulesService } from '../services/pi-product-modules.service';
import { ProductsService } from '../services/products.service';
import { MaterialsService } from '../services/materials.service';
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
            getProductTree: () => of({ ok: true, data: { _id: 'p1', name: 'Изделие', kind: 'product', quantity: 1, children: [] } }),
          },
        },
        { provide: ProductsService, useValue: {} },
        { provide: MaterialsService, useValue: {} },
        { provide: PiDialogService, useValue: {} },
        { provide: PiToastService, useValue: {} },
      ],
    }).compileComponents();
  });

  function productionHref(mode: 'hub' | 'desk'): string {
    const fixture = TestBed.createComponent(OrderHubTrayComponent);
    fixture.componentRef.setInput('order', ORDER);
    fixture.componentRef.setInput('mode', mode);
    fixture.detectChanges();
    const supplyToggle = fixture.nativeElement.querySelector(
      '[data-test="order-group-supply"] > button',
    ) as HTMLButtonElement;
    supplyToggle?.click();
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector(
      '[data-test="order-production-link"]',
    ) as HTMLAnchorElement;
    return link?.getAttribute('href') ?? '';
  }

  it('desk-mode production link contains from=desk', () => {
    const href = productionHref('desk');
    expect(href).toContain('/production');
    expect(href).toContain('orderId=o1');
    expect(href).toContain('from=desk');
  });

  it('hub-mode production link has orderId only (no from)', () => {
    const href = productionHref('hub');
    expect(href).toContain('/production');
    expect(href).toContain('orderId=o1');
    expect(href).not.toContain('from=');
  });

  it('desk empty composition uses an operator button and click-gated confirm hint', () => {
    const fixture = TestBed.createComponent(OrderHubTrayComponent);
    fixture.componentRef.setInput('order', { ...ORDER, status: 'draft', siteId: 'site1', items: [] });
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

  it('desk execution groups start collapsed and use compact actions', () => {
    const fixture = TestBed.createComponent(OrderHubTrayComponent);
    fixture.componentRef.setInput('order', { ...ORDER, items: [{ productId: 'p1', quantity: 1, unitPrice: 1 }] });
    fixture.componentRef.setInput('mode', 'desk');
    fixture.detectChanges();
    const tray = fixture.nativeElement as HTMLElement;
    expect(tray.querySelector('[data-test="order-group-supply"] > button')?.getAttribute('aria-expanded')).toBe('false');
    expect(tray.querySelector('[data-test="order-group-logistics"] > button')?.getAttribute('aria-expanded')).toBe('false');
    expect(tray.querySelector('[data-test="order-supply-link"]')).toBeNull();
    expect(tray.querySelector('[data-test="desk-notebook-button"]')).toBeTruthy();
    expect(tray.textContent).not.toContain('Оценка в цехе');
    expect(tray.textContent).not.toContain('Отгрузка пока не ведётся');
  });
});
