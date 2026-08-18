import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import { MaterialFormDialogComponent } from './material-form-dialog.component';
import { Material, MaterialsService } from '../../shared/services/materials.service';
import { Organization, OrganizationsService } from '../../shared/services/organizations.service';
import { PhotosService } from '../../shared/services/photos.service';
import { PiToastService } from '../../shared/ui/toast';
import { Unit, UnitsService } from '../../pages/dictionaries/units.service';
import { PiFormSectionComponent } from '../../shared/ui/form-section';
import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component';

/**
 * TZ-MATERIALS-301 — MaterialFormDialogComponent unit spec.
 *
 * The smoke test instantiates the dialog through TestBed, which forces
 * Angular template compilation — a permanent regression guard against
 * NG5xxx (the class of bug that `tsc` cannot catch, cf. TZ-261).
 *
 * Child primitives (app-pi-dialog / app-pi-button / app-pi-form-field /
 * app-pi-input / app-pi-textarea) are tolerated via NO_ERRORS_SCHEMA;
 * DI comes from the PI_DIALOG_DATA / PI_DIALOG_REF tokens exactly as the
 * page's PiDialogService.open() provides them. Services are stubbed with
 * SilentResult-shaped observables so the component's constructor-driven
 * loadSuppliers() / patchFromData() paths run synchronously.
 */

interface Harness {
  isEdit: () => boolean;
  submitting: () => boolean;
  uploading: () => boolean;
  errorMessage: () => string | null;
  form: {
    controls: Record<string, { setValue: (v: unknown) => void; markAsTouched: () => void }>;
    getRawValue: () => Record<string, unknown>;
    invalid: boolean;
    markAllAsTouched: () => void;
  };
  onSubmit: () => void;
  onCancel: () => void;
  addDimension: () => void;
  dimensionsArray: { controls: unknown[] };
  photos: () => unknown[];
  mainPhotoId: () => string | null;
  onPhotoSelect: (e: unknown) => void;
  setMainPhoto: (id: string) => void;
  removePhoto: (id: string) => void;
  units: () => Unit[];
  unitsLoading: () => boolean;
  unitsError: () => string | null;
  unitFallback: () => string | null;
  suppliers: () => unknown[];
  suppliersLoading: () => boolean;
  suppliersError: () => string | null;
}

async function setup(
  data: Material | null,
  opts: {
    unitsResult?: { ok: true; data: Unit[] } | { ok: false; error: unknown };
    supplierResult?:
      | { ok: true; data: { items: Organization[]; total: number; page: number; limit: number } }
      | { ok: false; error: unknown };
    uploadResults?: Array<{ ok: boolean; data?: unknown; error?: unknown }>;
    photoList?: unknown[];
  } = {},
): Promise<{
  comp: Harness;
  close: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  remove: jest.Mock;
  upload: jest.Mock;
  fixture: ReturnType<typeof TestBed.createComponent<MaterialFormDialogComponent>>;
}> {
  const close = jest.fn();
  const create = jest.fn(() =>
    of({ ok: true, data: { _id: 'm-new', name: 'Стекло', unit: 'm2' } }),
  );
  const update = jest.fn(() => of({ ok: true, data: { _id: 'm1', name: 'Стекло', unit: 'm2' } }));
  const remove = jest.fn(() => of({ ok: true, data: undefined }));
  const upload = jest.fn();

  await TestBed.configureTestingModule({
    providers: [
      { provide: PI_DIALOG_DATA, useValue: data },
      { provide: PI_DIALOG_REF, useValue: { close } },
      {
        provide: MaterialsService,
        useValue: {
          create,
          update,
          list: () => of({ ok: true, data: { items: [], total: 0, page: 1, limit: 50 } }),
        },
      },
      {
        provide: OrganizationsService,
        useValue: {
          list: () =>
            of(
              opts.supplierResult ?? {
                ok: true,
                data: {
                  items: [
                    { _id: 'sup-1', name: 'Поставщик А', inn: '111', isActive: true },
                    { _id: 'sup-2', name: 'Поставщик Б (неактив)', inn: '222', isActive: false },
                  ],
                  total: 2,
                  page: 1,
                  limit: 200,
                },
              },
            ),
        },
      },
      {
        provide: PhotosService,
        useValue: {
          list: () => of({ ok: true, data: opts.photoList ?? [] }),
          upload: (file: unknown) => {
            upload(file);
            const next = opts.uploadResults?.shift();
            return of(next ?? { ok: true, data: { _id: 'p-new' } });
          },
          uploadWithProgress: (file: unknown) => {
            upload(file);
            const next = opts.uploadResults?.shift();
            if (next && !next.ok) {
              return of({
                type: 'error',
                error: next.error ?? { message: 'upload failed' },
              });
            }
            return of({
              type: 'done',
              photo: next?.data ?? { _id: 'p-new' },
            });
          },
          remove,
        },
      },
      { provide: PiToastService, useValue: { success: () => {}, error: () => {} } },
      {
        provide: UnitsService,
        useValue: {
          listActive: () =>
            of(
              opts.unitsResult ?? {
                ok: true,
                data: [
                  {
                    _id: 'u1',
                    key: 'm2',
                    label: 'Квадратный метр',
                    symbol: 'м²',
                    isActive: true,
                    isSystem: true,
                    sortOrder: 40,
                  },
                  {
                    _id: 'u2',
                    key: 'sheet',
                    label: 'Лист',
                    symbol: 'л.',
                    isActive: true,
                    isSystem: true,
                    sortOrder: 60,
                  },
                ],
              },
            ),
        },
      },
    ],
  })
    .overrideComponent(MaterialFormDialogComponent, {
      set: {
        imports: [PiFormSectionComponent, FormFieldComponent],
        schemas: [NO_ERRORS_SCHEMA],
      },
    })
    .compileComponents();

  const fixture = TestBed.createComponent(MaterialFormDialogComponent);
  const comp = fixture.componentInstance as unknown as Harness;
  const article = comp.form.controls['article'] as unknown as {
    setValue(v: string): void;
    value: string | null;
  };
  if (!article.value) article.setValue('TEST-ARTICLE');
  return { comp, close, create, update, remove, upload, fixture };
}

describe('MaterialFormDialogComponent (TZ-MATERIALS-301)', () => {
  it('instantiates in create mode and renders the shared Material sections', async () => {
    const { comp, fixture } = await setup(null);
    fixture.detectChanges();
    expect(comp).toBeTruthy();
    expect(comp.isEdit()).toBe(false);
    const sections = fixture.nativeElement.querySelectorAll('app-pi-form-section');
    expect(sections).toHaveLength(3);
    expect(fixture.nativeElement.textContent).toContain('Основные данные');
    expect(fixture.nativeElement.textContent).toContain('Дополнительно');
    expect(fixture.nativeElement.textContent).toContain('Габариты');
  });

  it('instantiates in edit mode and prefills required fields', async () => {
    const material: Material = {
      _id: 'm1',
      name: 'Стекло 4мм',
      unit: 'm2',
      article: 'STK-004',
      sku: 'M-0001',
    };
    const { comp, fixture } = await setup(material);
    fixture.detectChanges();
    expect(comp.isEdit()).toBe(true);
    expect(comp.form.controls['name'].setValue).toBeTruthy();
  });

  it('onSubmit() with invalid form does not call create/update and marks all touched', async () => {
    const { comp, create, update } = await setup(null);
    comp.form.controls['name'].setValue('');
    comp.form.controls['unit'].setValue('');
    comp.form.markAllAsTouched();
    comp.onSubmit();
    expect(create).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
    expect(comp.submitting()).toBe(false);
  });

  it('onSubmit() valid form creates material once and closes with result', async () => {
    const { comp, create, close } = await setup(null);
    comp.form.controls['name'].setValue('Стекло');
    comp.form.controls['unit'].setValue('m2');
    comp.onSubmit();
    expect(create).toHaveBeenCalledTimes(1);
    // On the synchronous-success path `submitting` stays true (the dialog
    // is closing) — only the error branch resets it. The meaningful
    // contract is: exactly one POST + close(result).
    expect(comp.submitting()).toBe(true);
    expect(close).toHaveBeenCalledWith({ _id: 'm-new', name: 'Стекло', unit: 'm2' });
  });

  it('onSubmit() guards double-submit while submitting', async () => {
    const { comp, create } = await setup(null);
    comp.form.controls['name'].setValue('Стекло');
    comp.form.controls['unit'].setValue('m2');
    // Second call while submitting must be a no-op (no double POST).
    comp.onSubmit();
    comp.onSubmit();
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('onSubmit() edit mode calls update with the material id', async () => {
    const material: Material = { _id: 'm1', name: 'Стекло', unit: 'm2' };
    const { comp, update, create } = await setup(material);
    comp.form.controls['name'].setValue('Стекло 5мм');
    comp.form.controls['unit'].setValue('m2');
    comp.onSubmit();
    expect(create).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledTimes(1);
    expect(update.mock.calls[0][0]).toBe('m1');
  });

  it('loads units from listActive() on create (TZ-MATERIALS-302)', async () => {
    const { comp } = await setup(null);
    expect(comp.unitsLoading()).toBe(false);
    expect(comp.units().length).toBe(2);
    expect(comp.units().map((u) => u.key)).toEqual(['m2', 'sheet']);
    expect(comp.unitsError()).toBeNull();
  });

  it('units listActive() failure sets unitsError and leaves list empty (TZ-MATERIALS-302)', async () => {
    const { comp } = await setup(null, {
      unitsResult: { ok: false, error: { message: 'Сервер недоступен' } },
    });
    expect(comp.units().length).toBe(0);
    expect(comp.unitsError()).toBe('Сервер недоступен');
  });

  it('unitFallback() shows a disabled option when the current unit is deactivated (TZ-MATERIALS-302)', async () => {
    const material: Material = { _id: 'm1', name: 'Стекло', unit: 'pcs' };
    const { comp, fixture } = await setup(material);
    fixture.detectChanges();
    expect(comp.unitFallback()).toBe('pcs');
  });

  it('unitFallback() is null when the current unit is in the active list (TZ-MATERIALS-302)', async () => {
    const material: Material = { _id: 'm1', name: 'Стекло', unit: 'm2' };
    const { comp, fixture } = await setup(material);
    fixture.detectChanges();
    expect(comp.unitFallback()).toBeNull();
  });

  it('saves canonical Unit.key as Material.unit in the payload (TZ-MATERIALS-302)', async () => {
    const { comp, create } = await setup(null);
    comp.form.controls['name'].setValue('Стекло');
    comp.form.controls['unit'].setValue('sheet');
    comp.onSubmit();
    const payload = create.mock.calls[0][0];
    expect(payload.unit).toBe('sheet');
  });

  it('prefills unit from existing material by canonical key (TZ-MATERIALS-302)', async () => {
    const material: Material = { _id: 'm1', name: 'Стекло', unit: 'm2' };
    const { comp } = await setup(material);
    // patchFromData stores the canonical key; units load independently.
    expect((comp.form.controls['unit'] as { value: string }).value).toBe('m2');
  });

  it('saves supplierId in the payload when a supplier is chosen (TZ-MATERIALS-302)', async () => {
    const { comp, create } = await setup(null);
    comp.form.controls['name'].setValue('Стекло');
    comp.form.controls['unit'].setValue('m2');
    comp.form.controls['supplierId'].setValue('sup-1');
    comp.onSubmit();
    const payload = create.mock.calls[0][0];
    expect(payload.supplierId).toBe('sup-1');
  });

  it('filters inactive suppliers out of the dropdown (TZ-MATERIALS-302)', async () => {
    const { comp } = await setup(null);
    const suppliers = comp.suppliers() as Array<{ _id: string; isActive?: boolean }>;
    expect(suppliers.some((o) => o._id === 'sup-2')).toBe(false);
    expect(suppliers.some((o) => o._id === 'sup-1')).toBe(true);
  });

  it('blocks material save when article is empty (TZ-CATALOG-338)', async () => {
    const { comp, create } = await setup(null);
    comp.form.controls['article'].setValue('');
    comp.form.controls['name'].setValue('Стекло');
    comp.form.controls['unit'].setValue('m2');
    comp.onSubmit();
    expect(create).not.toHaveBeenCalled();
  });

  it('shows a create-organization hint when there are no suppliers (TZ-MATERIALS-312)', async () => {
    const { fixture, comp } = await setup(null, {
      supplierResult: {
        ok: true,
        data: { items: [], total: 0, page: 1, limit: 200 },
      },
    });
    fixture.detectChanges();
    const hint = fixture.nativeElement.querySelector('[data-test="supplier-empty-hint"]');
    expect(hint?.textContent).toContain('Нет поставщиков');
    expect(hint?.textContent).toContain('типом Поставщик');
    expect(hint?.querySelector('a')?.getAttribute('href')).toBe('/organizations');
    expect(comp.suppliersError()).toBeNull();
  });

  it('shows supplier loading errors instead of an empty-state hint (TZ-MATERIALS-312)', async () => {
    const { fixture, comp } = await setup(null, {
      supplierResult: { ok: false, error: { message: 'Сервер поставщиков недоступен' } },
    });
    fixture.detectChanges();
    expect(comp.suppliersError()).toBe('Сервер поставщиков недоступен');
    expect(fixture.nativeElement.textContent).toContain('Сервер поставщиков недоступен');
    expect(fixture.nativeElement.querySelector('[data-test="supplier-empty-hint"]')).toBeNull();
  });

  it('keeps the dimensions section half-width on desktop and full-width on mobile (TZ-MATERIALS-312)', async () => {
    const { fixture } = await setup(null);
    fixture.detectChanges();
    const wrapper = fixture.nativeElement.querySelector('[data-test="dimensions-section-wrap"]');
    expect(wrapper?.className).toContain('lg:w-1/2');
    expect(wrapper?.className).toContain('w-full');
  });

  it('labels the sku field «Внутренний код материала» — no unexplained SKU (TZ-MATERIALS-303)', async () => {
    const { fixture } = await setup(null);
    fixture.detectChanges();
    const fields = fixture.debugElement.queryAll(By.css('app-pi-form-field'));
    const skuField = fields.find((f) => f.nativeElement.getAttribute('htmlFor') === 'mat-sku');
    expect(skuField?.nativeElement.getAttribute('label')).toBe('Внутренний код материала');
    const skuInput = fixture.debugElement.query(By.css('#mat-sku'));
    expect(skuInput.nativeElement.getAttribute('placeholder')).not.toMatch(/SKU/i);
  });

  it('sends sku in the create payload when filled (TZ-MATERIALS-303)', async () => {
    const { comp, create } = await setup(null);
    comp.form.controls['name'].setValue('Стекло');
    comp.form.controls['unit'].setValue('m2');
    comp.form.controls['sku'].setValue('M-0001');
    comp.form.controls['article'].setValue('STK-004');
    comp.onSubmit();
    const payload = create.mock.calls[0][0];
    expect(payload.sku).toBe('M-0001');
    expect(payload.article).toBe('STK-004');
  });

  it('omits sku from the payload when empty (TZ-MATERIALS-303)', async () => {
    const { comp, create } = await setup(null);
    comp.form.controls['name'].setValue('Стекло');
    comp.form.controls['unit'].setValue('m2');
    comp.onSubmit();
    const payload = create.mock.calls[0][0];
    expect(payload.sku).toBeUndefined();
  });

  it('prefills sku and article from an existing material (edit mode, TZ-MATERIALS-303)', async () => {
    const material: Material = {
      _id: 'm1',
      name: 'Стекло 4мм',
      unit: 'm2',
      sku: 'M-0001',
      article: 'STK-004',
    };
    const { comp } = await setup(material);
    expect((comp.form.controls['sku'] as { value: string }).value).toBe('M-0001');
    expect((comp.form.controls['article'] as { value: string }).value).toBe('STK-004');
  });

  it('has no stockQty control — stock managed in Склад (TZ-MATERIALS-304)', async () => {
    const { comp } = await setup(null);
    expect(comp.form.controls['stockQty']).toBeUndefined();
  });

  it('never sends stockQty in the create payload (TZ-MATERIALS-304)', async () => {
    const { comp, create } = await setup(null);
    comp.form.controls['name'].setValue('Стекло');
    comp.form.controls['unit'].setValue('m2');
    comp.onSubmit();
    const payload = create.mock.calls[0][0];
    expect(payload.stockQty).toBeUndefined();
  });

  it('opens a legacy material carrying stockQty without error and omits it from payload (TZ-MATERIALS-304)', async () => {
    const material: Material = {
      _id: 'm1',
      name: 'Стекло 4мм',
      unit: 'm2',
      stockQty: 150,
    };
    const { comp, update, fixture } = await setup(material);
    fixture.detectChanges();
    comp.onSubmit();
    const payload = update.mock.calls[0][0];
    expect(payload.stockQty).toBeUndefined();
    expect(comp.form.controls['name']).toBeTruthy();
  });

  it('one addDimension() click adds exactly one row (TZ-MATERIALS-305)', async () => {
    const { comp } = await setup(null);
    comp.addDimension();
    expect(comp.dimensionsArray.controls.length).toBe(1);
  });

  it('new rows get the next unused type in canonical order (TZ-MATERIALS-305)', async () => {
    const { comp } = await setup(null);
    comp.addDimension();
    comp.addDimension();
    comp.addDimension();
    const types = comp.dimensionsArray.controls.map(
      (g) => (g as { controls: { type: { value: string } } }).controls.type.value,
    );
    expect(types).toEqual(['length', 'width', 'height']);
  });

  it('existing edit rows are not duplicated when adding (TZ-MATERIALS-305)', async () => {
    const material: Material = {
      _id: 'm1',
      name: 'Стекло 4мм',
      unit: 'm2',
      dimensions: [
        { type: 'length', value: 3000 },
        { type: 'width', value: 2000 },
      ],
    };
    const { comp } = await setup(material);
    const before = comp.dimensionsArray.controls.length;
    comp.addDimension();
    expect(comp.dimensionsArray.controls.length).toBe(before + 1);
    const types = comp.dimensionsArray.controls.map(
      (g) => (g as { controls: { type: { value: string } } }).controls.type.value,
    );
    expect(types).toEqual(['length', 'width', 'height']);
  });

  it('removeDimension(i) removes only the target row (TZ-MATERIALS-305)', async () => {
    const { comp } = await setup(null);
    comp.addDimension();
    comp.addDimension();
    comp.addDimension();
    comp.removeDimension(1);
    expect(comp.dimensionsArray.controls.length).toBe(2);
    const types = comp.dimensionsArray.controls.map(
      (g) => (g as { controls: { type: { value: string } } }).controls.type.value,
    );
    expect(types).toEqual(['length', 'height']);
  });

  it('does not add a seventh row when all six dimension types are present', async () => {
    const material: Material = {
      _id: 'm1',
      name: 'Стекло',
      unit: 'm2',
      dimensions: [
        { type: 'length', value: 1 },
        { type: 'width', value: 1 },
        { type: 'height', value: 1 },
        { type: 'thickness', value: 1 },
        { type: 'diameter', value: 1 },
        { type: 'depth', value: 1 },
      ],
    };
    const { comp } = await setup(material);
    expect(comp.canAddDimension()).toBe(false);
    comp.addDimension();
    expect(comp.dimensionsArray.controls.length).toBe(6);
  });

  it('dedupes duplicate dimension types when patching edit data', async () => {
    const material: Material = {
      _id: 'm1',
      name: 'Лист',
      unit: 'kg',
      dimensions: [
        { type: 'thickness', value: 2 },
        { type: 'thickness', value: 4 },
        { type: 'width', value: 1000 },
      ],
    };
    const { comp } = await setup(material);
    const types = comp.dimensionsArray.controls.map(
      (g) => (g as { controls: { type: { value: string } } }).controls.type.value,
    );
    expect(types).toEqual(['thickness', 'width']);
  });

  it('preserves isImmutable in the payload (TZ-MATERIALS-305)', async () => {
    const { comp, create } = await setup(null);
    comp.form.controls['name'].setValue('Стекло');
    comp.form.controls['unit'].setValue('m2');
    comp.addDimension();
    const g = comp.dimensionsArray.controls[0] as unknown as {
      controls: { isImmutable: { setValue: (v: boolean) => void } };
    };
    g.controls.isImmutable.setValue(true);
    comp.onSubmit();
    const payload = create.mock.calls[0][0];
    expect(payload.dimensions).toEqual([{ type: 'length', value: 0, isImmutable: true }]);
  });

  it('onSubmit() is a no-op while uploading (TZ-MATERIALS-306)', async () => {
    const { comp, create } = await setup(null);
    (comp as unknown as { uploading: { set: (v: boolean) => void } }).uploading.set(true);
    comp.form.controls['name'].setValue('Стекло');
    comp.form.controls['unit'].setValue('m2');
    comp.onSubmit();
    expect(create).not.toHaveBeenCalled();
  });

  it('failed uploads are excluded from photos and payload (TZ-MATERIALS-306)', async () => {
    const { comp, create, upload } = await setup(null, {
      uploadResults: [
        { ok: true, data: { _id: 'p1' } },
        { ok: false, error: { message: 'too big' } },
      ],
    });
    comp.onPhotoSelect({
      target: { files: [new File(['a'], 'a.jpg'), new File(['b'], 'b.jpg')], value: '' },
    });
    // One upload request per selected file; only the successful one is kept.
    expect(upload).toHaveBeenCalledTimes(2);
    expect(comp.photos()).toHaveLength(1);
    expect(comp.uploading()).toBe(false);
    comp.form.controls['name'].setValue('Стекло');
    comp.form.controls['unit'].setValue('m2');
    comp.onSubmit();
    const payload = create.mock.calls[0][0];
    expect(payload.photoIds).toEqual(['p1']);
  });

  it('mainPhotoId always belongs to the saved photoIds (TZ-MATERIALS-306)', async () => {
    const { comp, create } = await setup(null, {
      uploadResults: [
        { ok: true, data: { _id: 'p1' } },
        { ok: true, data: { _id: 'p2' } },
      ],
    });
    comp.onPhotoSelect({
      target: { files: [new File(['a'], 'a.jpg'), new File(['b'], 'b.jpg')], value: '' },
    });
    expect(comp.mainPhotoId()).toBe('p1');
    comp.removePhoto('p1');
    expect(comp.mainPhotoId()).toBe('p2');
    comp.form.controls['name'].setValue('Стекло');
    comp.form.controls['unit'].setValue('m2');
    comp.onSubmit();
    const payload = create.mock.calls[0][0];
    expect(payload.photoIds).toEqual(['p2']);
    expect(payload.mainPhotoId).toBe('p2');
  });

  it('cancel (destroy) removes only orphan uploads, not saved photos (TZ-MATERIALS-306)', async () => {
    const { comp, remove, fixture } = await setup(
      { _id: 'm1', name: 'Стекло', unit: 'm2', photoIds: ['p-saved'] },
      { photoList: [{ _id: 'p-saved' }] },
    );
    fixture.detectChanges();
    comp.onPhotoSelect({
      target: { files: [new File(['x'], 'new.jpg')], value: '' },
    });
    // Not submitted -> destroy triggers orphan cleanup for the new upload only.
    fixture.destroy();
    expect(remove).toHaveBeenCalledWith('p-new');
    expect(remove).not.toHaveBeenCalledWith('p-saved');
  });

  it('onCancel() closes dialog without submit', async () => {
    const { comp, close, create } = await setup(null);
    comp.onCancel();
    expect(create).not.toHaveBeenCalled();
    expect(close).toHaveBeenCalledWith(null);
  });

  // ─────────────────────────────────────────────────────────────────
  // TZ-CATALOG-316 — FE Material 301 fields
  //
  // The dialog now carries `materialKind`, `weightKg`, `assortment`,
  // `standardRef`, `materialGrade` through the form and into the
  // create/update payload. The payload OMITS the field when the
  // empty-string sentinel is selected (legacy no-kind path).
  // weightKg follows server `Min(0)` so 0 is acceptable, —5 is not.
  // ─────────────────────────────────────────────────────────────────

  /** Typed helpers — keep tests readable without casting at every call. */
  function setFormValue(comp: Harness, name: string, v: unknown): void {
    (comp.form.controls[name] as unknown as { setValue(v: unknown): void }).setValue(v);
  }
  function readFormValue(comp: Harness, name: string): unknown {
    return (comp.form.controls[name] as unknown as { value: unknown }).value;
  }
  function touchForm(comp: Harness, name: string): void {
    (comp.form.controls[name] as unknown as { markAsTouched(): void }).markAsTouched();
  }

  describe('TZ-CATALOG-316 (Material FE 301 fields)', () => {
    it('create: round-trips materialKind + weightKg + assortment/standardRef/materialGrade', async () => {
      const { comp, create } = await setup(null);
      comp.form.controls['name'].setValue('Лист Ст3');
      comp.form.controls['unit'].setValue('m2');
      setFormValue(comp, 'materialKind', 'raw');
      setFormValue(comp, 'weightKg', 1.5);
      setFormValue(comp, 'assortment', 'Лист');
      setFormValue(comp, 'standardRef', 'ГОСТ 19904-90');
      setFormValue(comp, 'materialGrade', 'Ст3');
      comp.onSubmit();
      const payload = create.mock.calls[0][0];
      expect(payload.materialKind).toBe('raw');
      expect(payload.weightKg).toBe(1.5);
      expect(payload.assortment).toBe('Лист');
      expect(payload.standardRef).toBe('ГОСТ 19904-90');
      expect(payload.materialGrade).toBe('Ст3');
    });

    it('create: empty materialKind sentinel stays omitted from payload (legacy no-kind)', async () => {
      const { comp, create } = await setup(null);
      comp.form.controls['name'].setValue('Стекло');
      comp.form.controls['unit'].setValue('m2');
      comp.onSubmit();
      const payload = create.mock.calls[0][0];
      expect(payload.materialKind).toBeUndefined();
      expect(payload.weightKg).toBeUndefined();
      expect(payload.assortment).toBeUndefined();
      expect(payload.standardRef).toBeUndefined();
      expect(payload.materialGrade).toBeUndefined();
    });

    it('create: weightKg = 0 is valid (server Min(0) allowed)', async () => {
      const { comp, create } = await setup(null);
      comp.form.controls['name'].setValue('Стекло');
      comp.form.controls['unit'].setValue('m2');
      setFormValue(comp, 'weightKg', 0);
      comp.onSubmit();
      expect(create).toHaveBeenCalledTimes(1);
    });

    it('create: weightKg < 0 invalid → hasError(weightKg)=true and submit is blocked', async () => {
      const { comp, create } = await setup(null);
      comp.form.controls['name'].setValue('Стекло');
      comp.form.controls['unit'].setValue('m2');
      setFormValue(comp, 'weightKg', -5);
      touchForm(comp, 'weightKg');
      comp.onSubmit();
      // form.invalid → onSubmit marks all touched and returns without POST
      expect(create).not.toHaveBeenCalled();
      expect(comp.hasError('weightKg')).toBe(true);
    });

    it('edit: prefills all 301 fields from a saved material', async () => {
      const material: Material = {
        _id: 'm1',
        name: 'Лист Ст3',
        unit: 'kg',
        materialKind: 'raw',
        weightKg: 12.5,
        assortment: 'Лист горячекатаный',
        standardRef: 'ГОСТ 19903-2015',
        materialGrade: 'Ст3',
      };
      const { comp } = await setup(material);
      expect(readFormValue(comp, 'materialKind')).toBe('raw');
      expect(readFormValue(comp, 'weightKg')).toBe(12.5);
      expect(readFormValue(comp, 'assortment')).toBe('Лист горячекатаный');
      expect(readFormValue(comp, 'standardRef')).toBe('ГОСТ 19903-2015');
      expect(readFormValue(comp, 'materialGrade')).toBe('Ст3');
    });

    it('edit: legacy material without materialKind opens cleanly; kind control = empty sentinel', async () => {
      const material: Material = { _id: 'm1', name: 'Стекло 4мм', unit: 'm2' };
      const { comp } = await setup(material);
      // The `— не указан —` option in the select stores KIND_NULL_SENTINEL ('') on the control.
      expect(readFormValue(comp, 'materialKind')).toBe('');
    });

    it('edit: update payload includes 301 fields (round-trip)', async () => {
      const material: Material = { _id: 'm1', name: 'Стекло 4мм', unit: 'm2' };
      const { comp, update } = await setup(material);
      setFormValue(comp, 'materialKind', 'part');
      setFormValue(comp, 'weightKg', 0.6);
      setFormValue(comp, 'standardRef', 'ГОСТ 111-2001');
      comp.onSubmit();
      const [idArg, payload] = update.mock.calls[0];
      expect(idArg).toBe('m1');
      expect(payload.materialKind).toBe('part');
      expect(payload.weightKg).toBe(0.6);
      expect(payload.standardRef).toBe('ГОСТ 111-2001');
    });

    it('create: pricePerUnit as string "500" becomes number 500 in payload (TZ-MATERIALS-313)', async () => {
      const { comp, create } = await setup(null);
      comp.form.controls['name'].setValue('Стекло');
      comp.form.controls['unit'].setValue('m2');
      setFormValue(comp, 'pricePerUnit', '500');
      comp.onSubmit();
      const payload = create.mock.calls[0][0];
      expect(payload.pricePerUnit).toBe(500);
    });

    it('create: empty pricePerUnit is omitted from payload (TZ-MATERIALS-313)', async () => {
      const { comp, create } = await setup(null);
      comp.form.controls['name'].setValue('Стекло');
      comp.form.controls['unit'].setValue('m2');
      setFormValue(comp, 'pricePerUnit', '');
      comp.onSubmit();
      const payload = create.mock.calls[0][0];
      expect(payload.pricePerUnit).toBeUndefined();
    });
  });
});
