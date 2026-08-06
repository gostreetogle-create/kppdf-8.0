import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CompositionEditorComponent } from './composition-editor.component';
import { ProductModulesService } from '../../services/pi-product-modules.service';
import { MaterialsService } from '../../services/materials.service';
import { PiToastService } from '../toast';

describe('CompositionEditorComponent (TZ-CATALOG-311)', () => {
  let fixture: ComponentFixture<CompositionEditorComponent>;
  let service: Record<string, jest.Mock>;
  let toast: { error: jest.Mock };

  beforeEach(async () => {
    service = {
      getProductTree: jest.fn().mockReturnValue(
        of({
          ok: true,
          data: {
            _id: 'p1',
            name: 'Комплекс',
            kind: 'product',
            quantity: 1,
            children: [
              {
                _id: 'child',
                name: 'Изделие',
                kind: 'product',
                lineType: 'product',
                quantity: 1,
                children: [],
              },
            ],
          },
        }),
      ),
      getModuleTree: jest.fn().mockReturnValue(
        of({
          ok: true,
          data: {
            _id: 'm1',
            name: 'Модуль',
            kind: 'module',
            quantity: 1,
            children: [
              {
                _id: 'child',
                name: 'Дочерний',
                kind: 'module',
                lineType: 'module',
                quantity: 1,
                children: [],
              },
            ],
          },
        }),
      ),
      getProductComposition: jest.fn().mockReturnValue(of({ ok: true, data: [] })),
      getModuleComposition: jest.fn().mockReturnValue(of({ ok: true, data: [] })),
      addProductCompositionLine: jest.fn().mockReturnValue(of({ ok: true, data: [] })),
      addModuleCompositionLine: jest.fn().mockReturnValue(of({ ok: true, data: [] })),
      updateProductCompositionLine: jest.fn().mockReturnValue(of({ ok: true, data: [] })),
      updateModuleCompositionLine: jest.fn().mockReturnValue(of({ ok: true, data: [] })),
      removeProductCompositionLine: jest.fn().mockReturnValue(of({ ok: true, data: undefined })),
      removeModuleCompositionLine: jest.fn().mockReturnValue(of({ ok: true, data: undefined })),
    };
    toast = { error: jest.fn() };
    await TestBed.configureTestingModule({
      imports: [CompositionEditorComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ProductModulesService, useValue: service },
        {
          provide: MaterialsService,
          useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [] } })) },
        },
        { provide: PiToastService, useValue: toast },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(CompositionEditorComponent);
  });

  it('loads the product tree, renders a nested product, and derives Комплекс', () => {
    fixture.componentRef.setInput('parentId', 'p1');
    fixture.componentRef.setInput('parentKind', 'product');
    fixture.detectChanges();
    expect(service.getProductTree).toHaveBeenCalledWith('p1', 1);
    expect(
      fixture.nativeElement.querySelector('[data-test="composition-complex-badge"]'),
    ).toBeTruthy();
    const component = fixture.componentInstance as unknown as {
      tree: () => { children: unknown[] } | null;
    };
    expect(component.tree()?.children).toHaveLength(1);
  });

  it('refetches deeper tree on expand and adds a child module to a module parent', () => {
    fixture.componentRef.setInput('parentId', 'm1');
    fixture.componentRef.setInput('parentKind', 'module');
    fixture.detectChanges();
    const component = fixture.componentInstance as unknown as {
      onExpand: (event: { node: { _id: string }; expanded: boolean }) => void;
      draftType: { set: (value: string) => void };
      draftRefId: { set: (value: string) => void };
      addDraftLine: () => void;
    };
    const toggle = fixture.nativeElement.querySelector(
      '[data-test="composition-tree-toggle"]',
    ) as HTMLButtonElement;
    expect(toggle).toBeTruthy();
    toggle.click();
    fixture.detectChanges();
    expect(service.getModuleTree).toHaveBeenCalledWith('m1', 2);
    expect(
      fixture.nativeElement
        .querySelector('[data-test="composition-tree-node-m1"]')
        ?.getAttribute('aria-expanded'),
    ).toBe('true');
    component.draftType.set('module');
    component.draftRefId.set('child-module');
    component.addDraftLine();
    expect(service.addModuleCompositionLine).toHaveBeenCalledWith('m1', {
      lineType: 'module',
      refId: 'child-module',
      quantity: 1,
    });
  });

  it('limits module editor types and rejects product additions', () => {
    fixture.componentRef.setInput('parentId', 'm1');
    fixture.componentRef.setInput('parentKind', 'module');
    fixture.detectChanges();
    const component = fixture.componentInstance as unknown as {
      allowedLineTypes: () => string[];
      draftType: { set: (value: string) => void };
      draftRefId: { set: (value: string) => void };
      addDraftLine: () => void;
    };
    expect(component.allowedLineTypes()).toEqual(['module', 'material']);
    component.draftType.set('product');
    component.draftRefId.set('p2');
    component.addDraftLine();
    expect(service.addModuleCompositionLine).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('Изделие нельзя добавить в состав модуля.');
  });
});
