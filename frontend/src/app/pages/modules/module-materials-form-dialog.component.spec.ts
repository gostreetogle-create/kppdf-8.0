import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ModuleMaterialsFormDialogComponent } from './module-materials-form-dialog.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import type { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { ProductModulesService } from '../../shared/services/pi-product-modules.service';
import { MaterialsService } from '../../shared/services/materials.service';
import { PiToastService } from '../../shared/ui/toast';
import { FormArray } from '@angular/forms';

describe('ModuleMaterialsFormDialogComponent (TZ-CATALOG-320)', () => {
  let fixture: ComponentFixture<ModuleMaterialsFormDialogComponent>;

  function ref<T>(): DialogRef<T> {
    return { closed: signal<T | undefined>(undefined), close: jest.fn() } as DialogRef<T>;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModuleMaterialsFormDialogComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: PI_DIALOG_DATA,
          useValue: { moduleId: 'parent', materials: [], composition: [] },
        },
        { provide: PI_DIALOG_REF, useValue: ref() },
        {
          provide: ProductModulesService,
          useValue: {
            list: jest.fn().mockReturnValue(
              of({
                ok: true,
                data: [
                  { _id: 'parent', name: 'Родитель', materials: [], workTypes: [] },
                  { _id: 'child', name: 'Дочерний', materials: [], workTypes: [] },
                ],
              }),
            ),
            update: jest.fn().mockReturnValue(of({ ok: true, data: {} })),
            addModuleCompositionLine: jest.fn().mockReturnValue(of({ ok: true, data: [] })),
            updateModuleCompositionLine: jest.fn().mockReturnValue(of({ ok: true, data: [] })),
            removeModuleCompositionLine: jest
              .fn()
              .mockReturnValue(of({ ok: true, data: undefined })),
          },
        },
        {
          provide: MaterialsService,
          useValue: {
            list: jest.fn().mockReturnValue(
              of({
                ok: true,
                data: {
                  items: [{ _id: 'part', name: 'Кронштейн', unit: 'шт', materialKind: 'part' }],
                },
              }),
            ),
          },
        },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ModuleMaterialsFormDialogComponent);
    fixture.detectChanges();
  });

  it('adds a child-module line and saves it through the composition API', () => {
    const component = fixture.componentInstance as unknown as {
      addRow: () => void;
      compositionArray: FormArray;
      onSubmit: () => void;
    };
    component.addRow();
    const row = component.compositionArray.at(0);
    row.patchValue({ lineType: 'module', moduleId: 'child', materialId: '' });
    component.onSubmit();
    const service = TestBed.inject(ProductModulesService) as unknown as {
      addModuleCompositionLine: jest.Mock;
    };
    expect(service.addModuleCompositionLine).toHaveBeenCalledWith('parent', {
      lineType: 'module',
      refId: 'child',
      quantity: 1,
      unit: 'шт',
      sortOrder: 0,
    });
  });

  it('rejects a self-reference before any composition write', () => {
    const component = fixture.componentInstance as unknown as {
      addRow: () => void;
      compositionArray: FormArray;
      onSubmit: () => void;
    };
    component.addRow();
    component.compositionArray.at(0).patchValue({ lineType: 'module', moduleId: 'parent' });
    component.onSubmit();
    const service = TestBed.inject(ProductModulesService) as unknown as {
      addModuleCompositionLine: jest.Mock;
    };
    expect(service.addModuleCompositionLine).not.toHaveBeenCalled();
  });

  it('excludes the parent module from child-module options and labels material kinds', () => {
    const component = fixture.componentInstance as unknown as {
      childModules: () => Array<{ _id: string }>;
      materialKindLabel: (material: { materialKind: 'part' }) => string;
    };
    expect(component.childModules().map((item) => item._id)).toEqual(['child']);
    expect(component.materialKindLabel({ materialKind: 'part' })).toBe('деталь');
  });
});
