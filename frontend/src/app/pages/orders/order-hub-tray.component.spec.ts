import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { OrderHubTrayComponent } from './order-hub-tray.component';
import type { Order } from './orders.service';
import { SupplyTaskService } from '../../shared/services/pi-supply.service';
import { ProductModulesService } from '../../shared/services/pi-product-modules.service';
import { ProductsService } from '../../shared/services/products.service';
import { MaterialsService } from '../../shared/services/materials.service';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { PiToastService } from '../../shared/ui/toast';

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
        { provide: ProductModulesService, useValue: {} },
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
});
