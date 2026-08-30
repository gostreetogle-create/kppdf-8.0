import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { PiCompositionService, PiMaterialsService, PiUnitsService } from '@kppdf/data-access';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '@kppdf/ui/dialog';
import type { DialogRef } from '@kppdf/ui/dialog';
import { MaterialFormDialogComponent } from './material-form-dialog.component';

const COMPOSITION_MOCK = {
  getMaterialTree: jest.fn().mockReturnValue(
    of({ ok: true, data: { _id: 'det-1', name: 'Кронштейн', kind: 'material', quantity: 1, children: [] } }),
  ),
  getMaterialComposition: jest.fn().mockReturnValue(of({ ok: true, data: [] })),
};

describe('MaterialFormDialogComponent (TZ-NX-REGISTRIES-ROW-DIALOGS-MATERIALS)', () => {
  let fixture: ComponentFixture<MaterialFormDialogComponent>;
  const close = jest.fn();

  beforeEach(async () => {
    close.mockReset();
    await TestBed.configureTestingModule({
      imports: [MaterialFormDialogComponent],
      providers: [
        provideRouter([]),
        {
          provide: PI_DIALOG_DATA,
          useValue: {
            mode: 'create',
            lockMaterialKind: 'raw',
            allowKindSelect: false,
            entityLabel: 'материал',
          },
        },
        {
          provide: PI_DIALOG_REF,
          useValue: { close } as DialogRef<unknown>,
        },
        {
          provide: PiUnitsService,
          useValue: {
            list: jest.fn().mockReturnValue(
              of({ ok: true, data: { items: [{ key: 'pcs', label: 'Штука', isActive: true, isSystem: true, sortOrder: 0 }], total: 1, page: 1, limit: 50 } }),
            ),
          },
        },
        {
          provide: PiMaterialsService,
          useValue: {
            create: jest.fn().mockReturnValue(
              of({ ok: true, data: { _id: 'new-1', name: 'Test', article: 'A-1', unit: 'pcs', materialKind: 'raw' } }),
            ),
            update: jest.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MaterialFormDialogComponent);
    fixture.detectChanges();
  });

  it('renders accessible dialog form with max-width content variant', () => {
    expect(fixture.nativeElement.querySelector('[data-test="material-form"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-pi-dialog')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Создать материал');
  });

  it('locks materialKind for materials registry (no kind select)', () => {
    expect(fixture.nativeElement.querySelector('[data-test="material-kind-select"]')).toBeNull();
  });

  it('submits create via PiMaterialsService', async () => {
    const service = TestBed.inject(PiMaterialsService);
    fixture.componentInstance['form'].patchValue({
      name: 'Лист',
      article: 'L-1',
      unit: 'pcs',
    });
    await fixture.componentInstance['onSubmit']();
    expect(service.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Лист', article: 'L-1', unit: 'pcs', materialKind: 'raw' }),
    );
    expect(close).toHaveBeenCalled();
  });

  it('shows API error without closing dialog', async () => {
    const service = TestBed.inject(PiMaterialsService);
    (service.create as jest.Mock).mockReturnValue(
      of({ ok: false, error: { error: { message: 'Validation failed' }, status: 400, statusText: 'Bad Request' } }),
    );
    fixture.componentInstance['form'].patchValue({ name: 'X', article: 'Y', unit: 'pcs' });
    await fixture.componentInstance['onSubmit']();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test="material-form-error"]')).toBeTruthy();
    expect(close).not.toHaveBeenCalled();
  });

  it('submits edit via PiMaterialsService.update', async () => {
    TestBed.resetTestingModule();
    close.mockReset();
    await TestBed.configureTestingModule({
      imports: [MaterialFormDialogComponent],
      providers: [
        provideRouter([]),
        {
          provide: PI_DIALOG_DATA,
          useValue: {
            mode: 'edit',
            material: {
              _id: '507f1f77bcf86cd799439011',
              name: 'Стекло',
              article: 'STK-1',
              unit: 'pcs',
              materialKind: 'raw',
            },
            lockMaterialKind: 'raw',
            allowKindSelect: false,
            entityLabel: 'материал',
          },
        },
        {
          provide: PI_DIALOG_REF,
          useValue: { close } as DialogRef<unknown>,
        },
        {
          provide: PiUnitsService,
          useValue: {
            list: jest.fn().mockReturnValue(
              of({ ok: true, data: { items: [{ key: 'pcs', label: 'Штука', isActive: true, isSystem: true, sortOrder: 0 }], total: 1, page: 1, limit: 50 } }),
            ),
          },
        },
        {
          provide: PiMaterialsService,
          useValue: {
            create: jest.fn(),
            update: jest.fn().mockReturnValue(
              of({ ok: true, data: { _id: '507f1f77bcf86cd799439011', name: 'Стекло 2', article: 'STK-2', unit: 'pcs', materialKind: 'raw' } }),
            ),
          },
        },
      ],
    }).compileComponents();

    const editFixture = TestBed.createComponent(MaterialFormDialogComponent);
    editFixture.detectChanges();
    const service = TestBed.inject(PiMaterialsService);
    editFixture.componentInstance['form'].patchValue({ name: 'Стекло 2', article: 'STK-2' });
    await editFixture.componentInstance['onSubmit']();
    expect(service.update).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439011',
      expect.objectContaining({ name: 'Стекло 2', article: 'STK-2' }),
    );
    expect(close).toHaveBeenCalled();
  });

  it('keeps locked materialKind after patching edit data', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [MaterialFormDialogComponent],
      providers: [
        provideRouter([]),
        {
          provide: PI_DIALOG_DATA,
          useValue: {
            mode: 'edit',
            material: {
              _id: '507f1f77bcf86cd799439011',
              name: 'Стекло',
              article: 'STK-1',
              unit: 'pcs',
              materialKind: 'part',
            },
            lockMaterialKind: 'raw',
            allowKindSelect: false,
            entityLabel: 'материал',
          },
        },
        {
          provide: PI_DIALOG_REF,
          useValue: { close: jest.fn() } as DialogRef<unknown>,
        },
        {
          provide: PiUnitsService,
          useValue: {
            list: jest.fn().mockReturnValue(
              of({ ok: true, data: { items: [{ key: 'pcs', label: 'Штука', isActive: true, isSystem: true, sortOrder: 0 }], total: 1, page: 1, limit: 50 } }),
            ),
          },
        },
        {
          provide: PiMaterialsService,
          useValue: { create: jest.fn(), update: jest.fn() },
        },
      ],
    }).compileComponents();

    const lockedFixture = TestBed.createComponent(MaterialFormDialogComponent);
    lockedFixture.detectChanges();
    expect(lockedFixture.componentInstance['form'].getRawValue().materialKind).toBe('raw');
    expect(lockedFixture.componentInstance['form'].controls.materialKind.disabled).toBe(true);
  });

  describe('Деталь composition (TZ-NX-DETAIL-MATERIAL-BOM)', () => {
    it('shows the hint, not the composition panel, before a new Деталь is saved', async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [MaterialFormDialogComponent],
        providers: [
          provideRouter([]),
          { provide: PI_DIALOG_DATA, useValue: { mode: 'create', lockMaterialKind: 'part', entityLabel: 'деталь' } },
          { provide: PI_DIALOG_REF, useValue: { close: jest.fn() } as DialogRef<unknown> },
          { provide: PiUnitsService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [], total: 0, page: 1, limit: 50 } })) } },
          { provide: PiMaterialsService, useValue: { create: jest.fn(), update: jest.fn() } },
          { provide: PiCompositionService, useValue: COMPOSITION_MOCK },
        ],
      }).compileComponents();

      const createFixture = TestBed.createComponent(MaterialFormDialogComponent);
      createFixture.detectChanges();
      const el = createFixture.nativeElement as HTMLElement;
      expect(el.querySelector('[data-test="detail-bom-create-hint"]')).toBeTruthy();
      expect(el.querySelector('[data-test="detail-bom-composition"]')).toBeNull();
    });

    it('shows the real composition panel (not the old notes-hack form) for a saved Деталь', async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [MaterialFormDialogComponent],
        providers: [
          provideRouter([]),
          {
            provide: PI_DIALOG_DATA,
            useValue: {
              mode: 'edit',
              material: { _id: 'det-1', name: 'Кронштейн', article: 'DET-1', unit: 'pcs', materialKind: 'part' },
              lockMaterialKind: 'part',
              entityLabel: 'деталь',
            },
          },
          { provide: PI_DIALOG_REF, useValue: { close: jest.fn() } as DialogRef<unknown> },
          { provide: PiUnitsService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [], total: 0, page: 1, limit: 50 } })) } },
          { provide: PiMaterialsService, useValue: { create: jest.fn(), update: jest.fn() } },
          { provide: PiCompositionService, useValue: COMPOSITION_MOCK },
        ],
      }).compileComponents();

      const editFixture = TestBed.createComponent(MaterialFormDialogComponent);
      editFixture.detectChanges();
      await editFixture.whenStable();
      const el = editFixture.nativeElement as HTMLElement;
      expect(el.querySelector('[data-test="detail-bom-composition"]')).toBeTruthy();
      expect(el.querySelector('[data-test="detail-bom-create-hint"]')).toBeNull();
      // The retired notes-hack UI must be gone, not just hidden.
      expect(el.querySelector('[data-test="detail-bom-add"]')).toBeNull();
      expect(el.querySelector('[data-test^="detail-bom-row-"]')).toBeNull();
    });
  });
});
