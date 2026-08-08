import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ProductBomPanelComponent } from './product-bom-panel.component';
import { ProductModulesService } from '../../shared/services/pi-product-modules.service';
import { MaterialsService } from '../../shared/services/materials.service';
import { ProductsService } from '../../shared/services/products.service';
import { PiToastService } from '../../shared/ui/toast';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';

describe('ProductBomPanelComponent', () => {
  let fixture: ComponentFixture<ProductBomPanelComponent>;
  let service: Record<string, jest.Mock>;
  let materials: Record<string, jest.Mock>;
  let products: Record<string, jest.Mock>;

  const tree = {
    _id: 'p1',
    name: 'Изделие',
    kind: 'product' as const,
    quantity: 1,
    children: [
      {
        _id: 'm1',
        name: 'Каркас',
        kind: 'module' as const,
        lineType: 'module' as const,
        quantity: 2,
        children: [
          {
            _id: 'mat1',
            name: 'Труба',
            kind: 'material' as const,
            lineType: 'material' as const,
            quantity: 4,
            children: [],
          },
        ],
      },
    ],
  };

  beforeEach(async () => {
    service = {
      getProductTree: jest.fn().mockReturnValue(of({ ok: true, data: tree })),
      getModuleTree: jest.fn().mockReturnValue(
        of({
          ok: true,
          data: {
            _id: 'm1',
            name: 'Каркас',
            kind: 'module' as const,
            quantity: 1,
            children: [
              {
                _id: 'mat1',
                name: 'Труба',
                kind: 'material' as const,
                lineType: 'material' as const,
                quantity: 4,
                children: [],
              },
            ],
          },
        }),
      ),
      getProductComposition: jest.fn().mockReturnValue(
        of({
          ok: true,
          data: [{ _id: 'line-m1', lineType: 'module', refId: 'm1', quantity: 2 }],
        }),
      ),
      getModuleComposition: jest.fn().mockReturnValue(
        of({
          ok: true,
          data: [{ _id: 'line-mat1', lineType: 'material', refId: 'mat1', quantity: 4 }],
        }),
      ),
      getCostPreview: jest.fn().mockReturnValue(
        of({
          ok: true,
          data: {
            materialCost: 100,
            laborCost: 50,
            totalCost: 150,
            currency: 'RUB',
          },
        }),
      ),
      addProductCompositionLine: jest.fn().mockReturnValue(of({ ok: true, data: [] })),
      addModuleCompositionLine: jest.fn().mockReturnValue(of({ ok: true, data: [] })),
      updateProductCompositionLine: jest.fn().mockReturnValue(of({ ok: true, data: [] })),
      updateModuleCompositionLine: jest.fn().mockReturnValue(of({ ok: true, data: [] })),
      removeProductCompositionLine: jest.fn().mockReturnValue(of({ ok: true, data: undefined })),
      removeModuleCompositionLine: jest.fn().mockReturnValue(of({ ok: true, data: undefined })),
    };
    materials = {
      findById: jest.fn().mockReturnValue(
        of({
          ok: true,
          data: { _id: 'mat1', name: 'Труба', unit: 'м', pricePerUnit: 25 },
        }),
      ),
    };
    products = {
      findById: jest.fn().mockReturnValue(
        of({
          ok: true,
          data: { _id: 'p2', name: 'Дочернее', costPrice: 400, listPrice: 600 },
        }),
      ),
    };

    await TestBed.configureTestingModule({
      imports: [ProductBomPanelComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideRouter([]),
        { provide: ProductModulesService, useValue: service },
        { provide: MaterialsService, useValue: materials },
        { provide: ProductsService, useValue: products },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
        { provide: PiDialogService, useValue: { open: jest.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductBomPanelComponent);
  });

  it('loads tree and selects product root in inspector', () => {
    fixture.componentRef.setInput('productId', 'p1');
    fixture.detectChanges();
    expect(service.getProductTree).toHaveBeenCalledWith('p1', 2);
    expect(fixture.nativeElement.querySelector('[data-test="product-bom-panel"]')).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('[data-test="bom-inspector-name"]')?.textContent,
    ).toContain('Изделие');
    expect(fixture.nativeElement.querySelector('[data-test="bom-add-into"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="bom-line-cost"]')).toBeNull();
  });

  it('shows compact kind legend above the tree', () => {
    fixture.componentRef.setInput('productId', 'p1');
    fixture.detectChanges();
    const legend = fixture.nativeElement.querySelector(
      '[data-test="bom-kind-legend"]',
    ) as HTMLElement | null;
    expect(legend).toBeTruthy();
    expect(legend!.textContent).toContain('Изделие');
    expect(legend!.textContent).toContain('Модуль');
    expect(legend!.textContent).toContain('Деталь/мат');
    expect(legend!.textContent).toContain('Сырьё');
  });

  it('shows module cost contribution in inspector (preview × qty)', () => {
    fixture.componentRef.setInput('productId', 'p1');
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      onSelect: (e: {
        node: (typeof tree.children)[0];
        parent: typeof tree;
        depth: number;
      }) => void;
    };
    comp.onSelect({ node: tree.children[0], parent: tree, depth: 1 });
    fixture.detectChanges();
    expect(service.getCostPreview).toHaveBeenCalledWith('m1');
    const total = fixture.nativeElement.querySelector(
      '[data-test="bom-line-cost-total"]',
    ) as HTMLElement | null;
    expect(total?.textContent).toContain('300.00');
    expect(total?.textContent).toMatch(/150\.00.*×\s*2/);
  });

  it('shows material cost contribution in inspector (price × qty)', () => {
    fixture.componentRef.setInput('productId', 'p1');
    fixture.detectChanges();
    const mat = tree.children[0].children[0];
    const comp = fixture.componentInstance as unknown as {
      onSelect: (e: { node: typeof mat; parent: (typeof tree.children)[0]; depth: number }) => void;
    };
    comp.onSelect({ node: mat, parent: tree.children[0], depth: 2 });
    fixture.detectChanges();
    expect(materials.findById).toHaveBeenCalledWith('mat1');
    const total = fixture.nativeElement.querySelector(
      '[data-test="bom-line-cost-total"]',
    ) as HTMLElement | null;
    expect(total?.textContent).toContain('100.00');
  });

  it('loads module tree when rootKind=module (TZ-CATALOG-336)', () => {
    fixture.componentRef.setInput('productId', 'm1');
    fixture.componentRef.setInput('rootKind', 'module');
    fixture.detectChanges();
    expect(service.getModuleTree).toHaveBeenCalledWith('m1', 2);
    expect(service.getModuleComposition).toHaveBeenCalledWith('m1');
    expect(service.getProductTree).not.toHaveBeenCalled();
    const legend = fixture.nativeElement.querySelector(
      '[data-test="bom-kind-legend"]',
    ) as HTMLElement | null;
    expect(legend!.textContent).not.toContain('Изделие');
    expect(legend!.textContent).toContain('Модуль');
    expect(
      fixture.nativeElement.querySelector('[data-test="bom-inspector-name"]')?.textContent,
    ).toContain('Каркас');
    expect(fixture.nativeElement.querySelector('[data-test="bom-add-into"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="bom-edit"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="bom-open-module"]')).toBeTruthy();
  });

  it('openAddPicker wires onAdded and POSTs without waiting for dialog close (TZ-UX-DIALOG-303)', async () => {
    const dialog = TestBed.inject(PiDialogService) as unknown as { open: jest.Mock };
    dialog.open.mockReturnValue({ closed: signal(undefined), close: jest.fn() });

    fixture.componentRef.setInput('productId', 'p1');
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as { openAddPicker: () => void };
    comp.openAddPicker();

    expect(dialog.open).toHaveBeenCalled();
    const openArgs = dialog.open.mock.calls[0][1] as {
      data: {
        onAdded?: (r: { lineType: string; refId: string }) => Promise<void>;
      };
    };
    expect(typeof openArgs.data.onAdded).toBe('function');

    await openArgs.data.onAdded!({ lineType: 'module', refId: 'm1' });

    expect(service.addProductCompositionLine).toHaveBeenCalledWith('p1', {
      lineType: 'module',
      refId: 'm1',
      quantity: 1,
    });
    expect(service.getProductTree).toHaveBeenCalled();
  });
});
