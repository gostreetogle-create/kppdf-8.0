import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import {
  QuickCreateDialogComponent,
  type QuickCreateDialogData,
} from './quick-create-dialog.component';
import {
  FormProfilesService,
  LOCKED_REQUIRED,
  type FormProfile,
  type FormProfileEntity,
} from '../../services/form-profiles.service';
import { ProductsService } from '../../services/products.service';
import { ProductModulesService } from '../../services/pi-product-modules.service';
import { CategoriesService } from '../../services/categories.service';
import { PiToastService } from '../toast';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../dialog/dialog.tokens';
import type { SilentResult } from '../../../core/silent-http';
import { FIELD_KEY_LABEL_RU } from '../../services/form-profiles.service';

describe('QuickCreateDialogComponent (TZ-DICT-316)', () => {
  const success = jest.fn();
  const error = jest.fn();
  const close = jest.fn();

  const productM: FormProfile = {
    _id: 'fp-m',
    organizationId: 'org1',
    entity: 'product',
    size: 'M',
    visibleFieldKeys: ['name', 'kind', 'unit', 'sku', 'listPrice', 'categoryId', 'isActive'],
  };

  const productS: FormProfile = {
    ...productM,
    _id: 'fp-s',
    size: 'S',
    visibleFieldKeys: ['name', 'kind', 'unit'],
  };

  const moduleM: FormProfile = {
    _id: 'fp-mod-m',
    organizationId: 'org1',
    entity: 'module',
    size: 'M',
    visibleFieldKeys: ['name', 'article', 'width', 'height', 'depth', 'unit', 'weight'],
  };

  const ok = <T>(data: T): SilentResult<T> => ({ ok: true, data });
  const fail = <T = never>(message: string): SilentResult<T> => ({
    ok: false,
    error: new HttpErrorResponse({ status: 500, error: { message } }),
  });

  let profiles: {
    getOne: jest.Mock;
    isLocked: (entity: FormProfileEntity, fieldKey: string) => boolean;
    labelRu: (fieldKey: string) => string;
  };
  let products: { create: jest.Mock };
  let modules: { create: jest.Mock };

  async function setup(data: QuickCreateDialogData) {
    profiles = {
      getOne: jest.fn().mockReturnValue(of(ok(data.entity === 'module' ? moduleM : productM))),
      isLocked: (entity, fieldKey) => LOCKED_REQUIRED[entity].includes(fieldKey),
      labelRu: (fieldKey) => FIELD_KEY_LABEL_RU[fieldKey] ?? fieldKey,
    };
    products = {
      create: jest.fn().mockReturnValue(of(ok({ _id: 'p1', name: 'X', kind: 'good', unit: 'шт' }))),
    };
    modules = {
      create: jest
        .fn()
        .mockReturnValue(of(ok({ _id: 'm1', name: 'Mod', workTypes: [], materials: [] }))),
    };

    await TestBed.configureTestingModule({
      providers: [
        { provide: FormProfilesService, useValue: profiles },
        { provide: ProductsService, useValue: products },
        { provide: ProductModulesService, useValue: modules },
        {
          provide: CategoriesService,
          useValue: { list: jest.fn().mockReturnValue(of(ok([]))) },
        },
        { provide: PiToastService, useValue: { success, error } },
        { provide: PI_DIALOG_DATA, useValue: data },
        { provide: PI_DIALOG_REF, useValue: { close, closed: () => undefined } },
      ],
    })
      .overrideComponent(QuickCreateDialogComponent, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    const fixture = TestBed.createComponent(QuickCreateDialogComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.resetTestingModule();
  });

  it('loads product M profile and shows locked + optional keys', async () => {
    const c = await setup({ entity: 'product', size: 'M' });
    expect(profiles.getOne).toHaveBeenCalledWith('product', 'M');
    expect(c.loading()).toBe(false);
    expect(c.visibleKeys()).toEqual([
      'name',
      'kind',
      'unit',
      'sku',
      'listPrice',
      'categoryId',
      'isActive',
    ]);
    for (const locked of LOCKED_REQUIRED.product) {
      expect(c.visibleKeys().includes(locked)).toBe(true);
    }
  });

  it('size switch reloads profile and keeps locked required', async () => {
    const c = await setup({ entity: 'product', size: 'M' });
    profiles.getOne.mockReturnValue(of(ok(productS)));
    c.onSizeChange('S');
    expect(profiles.getOne).toHaveBeenCalledWith('product', 'S');
    expect(c.size()).toBe('S');
    expect(c.visibleKeys()).toEqual(['name', 'kind', 'unit']);
    expect(c.dialogWidth()).toBe('sm');
  });

  it('creates product with only visible fields; omits empty optional', async () => {
    const c = await setup({ entity: 'product', size: 'M' });
    c.form.patchValue({ name: 'Стол', kind: 'good', unit: 'шт', sku: '', listPrice: null });
    c.onSubmit();
    expect(products.create).toHaveBeenCalledTimes(1);
    const payload = products.create.mock.calls[0][0];
    expect(payload).toMatchObject({ name: 'Стол', kind: 'good', unit: 'шт', isActive: true });
    expect(payload.sku).toBeUndefined();
    expect(payload.listPrice).toBeUndefined();
    expect(close).toHaveBeenCalled();
    expect(success).toHaveBeenCalled();
  });

  it('forces locked keys into visible set even if profile omits them', async () => {
    profiles = {
      getOne: jest.fn().mockReturnValue(
        of(
          ok({
            ...productM,
            visibleFieldKeys: ['sku'], // missing locked — must still show name/kind/unit
          }),
        ),
      ),
      isLocked: (entity, fieldKey) => LOCKED_REQUIRED[entity].includes(fieldKey),
      labelRu: (fieldKey) => FIELD_KEY_LABEL_RU[fieldKey] ?? fieldKey,
    };
    products = { create: jest.fn() };
    modules = { create: jest.fn() };

    await TestBed.configureTestingModule({
      providers: [
        { provide: FormProfilesService, useValue: profiles },
        { provide: ProductsService, useValue: products },
        { provide: ProductModulesService, useValue: modules },
        {
          provide: CategoriesService,
          useValue: { list: jest.fn().mockReturnValue(of(ok([]))) },
        },
        { provide: PiToastService, useValue: { success, error } },
        { provide: PI_DIALOG_DATA, useValue: { entity: 'product' } },
        { provide: PI_DIALOG_REF, useValue: { close, closed: () => undefined } },
      ],
    })
      .overrideComponent(QuickCreateDialogComponent, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    const fixture = TestBed.createComponent(QuickCreateDialogComponent);
    fixture.detectChanges();
    const c = fixture.componentInstance;
    expect(c.visibleKeys()).toEqual(['name', 'kind', 'unit', 'sku']);
  });

  it('creates module via modules.create', async () => {
    const c = await setup({ entity: 'module', size: 'M' });
    expect(profiles.getOne).toHaveBeenCalledWith('module', 'M');
    c.form.patchValue({ name: 'Каркас', article: 'A-1' });
    c.onSubmit();
    expect(modules.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Каркас', article: 'A-1' }),
    );
    expect(products.create).not.toHaveBeenCalled();
  });

  it('shows load error when profile GET fails', async () => {
    profiles = {
      getOne: jest.fn().mockReturnValue(of(fail('Сеть недоступна'))),
      isLocked: (entity, fieldKey) => LOCKED_REQUIRED[entity].includes(fieldKey),
      labelRu: (fieldKey) => FIELD_KEY_LABEL_RU[fieldKey] ?? fieldKey,
    };
    await TestBed.configureTestingModule({
      providers: [
        { provide: FormProfilesService, useValue: profiles },
        { provide: ProductsService, useValue: { create: jest.fn() } },
        { provide: ProductModulesService, useValue: { create: jest.fn() } },
        {
          provide: CategoriesService,
          useValue: { list: jest.fn().mockReturnValue(of(ok([]))) },
        },
        { provide: PiToastService, useValue: { success, error } },
        { provide: PI_DIALOG_DATA, useValue: { entity: 'product' } },
        { provide: PI_DIALOG_REF, useValue: { close, closed: () => undefined } },
      ],
    })
      .overrideComponent(QuickCreateDialogComponent, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    const fixture = TestBed.createComponent(QuickCreateDialogComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.loadError()).toContain('Сеть недоступна');
  });
});
