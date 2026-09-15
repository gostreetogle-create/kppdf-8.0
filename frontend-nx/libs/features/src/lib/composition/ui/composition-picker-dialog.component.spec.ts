import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PiMaterialsService, PiModulesService, PiProductsService } from '@kppdf/data-access';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '@kppdf/ui/dialog';
import type { DialogRef } from '@kppdf/ui/dialog';
import { CompositionPickerDialogComponent } from './composition-picker-dialog.component';

describe('CompositionPickerDialogComponent (Phase 2)', () => {
  let fixture: ComponentFixture<CompositionPickerDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompositionPickerDialogComponent],
      providers: [
        {
          provide: PI_DIALOG_DATA,
          useValue: { parentKind: 'module', parentId: 'mod-root' },
        },
        { provide: PI_DIALOG_REF, useValue: { close: jest.fn() } as DialogRef<unknown> },
        {
          provide: PiModulesService,
          useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [{ _id: 'm2', name: 'M2', article: 'A' }] })) },
        },
        {
          provide: PiMaterialsService,
          useValue: {
            list: jest.fn().mockReturnValue(
              of({ ok: true, data: { items: [{ _id: 'mat1', name: 'Mat', article: 'M', unit: 'pcs', materialKind: 'raw' }], total: 1, page: 1, limit: 100 } }),
            ),
          },
        },
        { provide: PiProductsService, useValue: { list: jest.fn() } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(CompositionPickerDialogComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('module parent hides product tab', () => {
    expect(fixture.nativeElement.querySelector('[data-test="composition-picker-tab-product"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="composition-picker-tab-module"]')).toBeTruthy();
  });

  it('product parent shows product tab', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [CompositionPickerDialogComponent],
      providers: [
        { provide: PI_DIALOG_DATA, useValue: { parentKind: 'product', parentId: 'p1' } },
        { provide: PI_DIALOG_REF, useValue: { close: jest.fn() } as DialogRef<unknown> },
        {
          provide: PiModulesService,
          useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) },
        },
        {
          provide: PiMaterialsService,
          useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [], total: 0, page: 1, limit: 100 } })) },
        },
        {
          provide: PiProductsService,
          useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [], total: 0, page: 1, limit: 100 } })) },
        },
      ],
    }).compileComponents();
    const f = TestBed.createComponent(CompositionPickerDialogComponent);
    f.detectChanges();
    await f.whenStable();
    expect(f.nativeElement.querySelector('[data-test="composition-picker-tab-product"]')).toBeTruthy();
  });
});
