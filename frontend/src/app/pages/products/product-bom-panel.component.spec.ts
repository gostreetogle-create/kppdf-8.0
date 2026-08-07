import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ProductBomPanelComponent } from './product-bom-panel.component';
import { ProductModulesService } from '../../shared/services/pi-product-modules.service';
import { PiToastService } from '../../shared/ui/toast';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';

describe('ProductBomPanelComponent', () => {
  let fixture: ComponentFixture<ProductBomPanelComponent>;
  let service: Record<string, jest.Mock>;

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
      addProductCompositionLine: jest.fn().mockReturnValue(of({ ok: true, data: [] })),
      addModuleCompositionLine: jest.fn().mockReturnValue(of({ ok: true, data: [] })),
      updateProductCompositionLine: jest.fn().mockReturnValue(of({ ok: true, data: [] })),
      updateModuleCompositionLine: jest.fn().mockReturnValue(of({ ok: true, data: [] })),
      removeProductCompositionLine: jest.fn().mockReturnValue(of({ ok: true, data: undefined })),
      removeModuleCompositionLine: jest.fn().mockReturnValue(of({ ok: true, data: undefined })),
    };

    await TestBed.configureTestingModule({
      imports: [ProductBomPanelComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideRouter([]),
        { provide: ProductModulesService, useValue: service },
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

  it('selecting a module shows qty + add-into', () => {
    fixture.componentRef.setInput('productId', 'p1');
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll(
      '[data-test="composition-tree-row"]',
    ) as NodeListOf<HTMLElement>;
    // expand root already; click module row (index 1 if children visible — root expanded seeds children)
    const moduleRow = fixture.nativeElement.querySelector(
      '[data-test="composition-tree-node-m1"] [data-test="composition-tree-row"]',
    ) as HTMLElement | null;
    expect(moduleRow).toBeTruthy();
    moduleRow!.click();
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[data-test="bom-inspector-name"]')?.textContent,
    ).toContain('Каркас');
    expect(fixture.nativeElement.querySelector('[data-test="bom-inspector-qty"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="bom-add-into"]')).toBeTruthy();
    expect(service.getModuleComposition).toHaveBeenCalledWith('m1');
    expect(rows.length).toBeGreaterThan(1);
  });
});
