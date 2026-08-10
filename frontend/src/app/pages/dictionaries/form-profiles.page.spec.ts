import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { FormProfilesPage } from './form-profiles.page';
import {
  FIELD_KEY_LABEL_RU,
  FormProfilesService,
  LOCKED_REQUIRED,
  type FormProfile,
  type FormProfileEntity,
} from '../../shared/services/form-profiles.service';
import { PiToastService } from '../../shared/ui/toast';
import type { SilentResult } from '../../core/silent-http';

describe('FormProfilesPage (TZ-DICT-315)', () => {
  const success = jest.fn();
  const error = jest.fn();

  const productM: FormProfile = {
    _id: 'fp-m',
    organizationId: 'org1',
    entity: 'product',
    size: 'M',
    visibleFieldKeys: ['name', 'kind', 'unit', 'sku', 'listPrice', 'categoryId', 'isActive'],
  };

  const ok = <T>(data: T): SilentResult<T> => ({ ok: true, data });
  const fail = <T = never>(message: string): SilentResult<T> => ({
    ok: false,
    error: new HttpErrorResponse({ status: 500, error: { message } }),
  });

  let service: {
    getOne: jest.Mock;
    upsert: jest.Mock;
    isLocked: (entity: FormProfileEntity, fieldKey: string) => boolean;
    labelRu: (fieldKey: string) => string;
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    service = {
      getOne: jest.fn().mockReturnValue(of(ok(productM))),
      upsert: jest.fn().mockReturnValue(of(ok(productM))),
      isLocked: (entity, fieldKey) => LOCKED_REQUIRED[entity].includes(fieldKey),
      labelRu: (fieldKey) => FIELD_KEY_LABEL_RU[fieldKey] ?? fieldKey,
    };

    await TestBed.configureTestingModule({
      providers: [
        { provide: FormProfilesService, useValue: service },
        { provide: PiToastService, useValue: { success, error } },
      ],
    })
      .overrideComponent(FormProfilesPage, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
  });

  function createComp() {
    const fixture = TestBed.createComponent(FormProfilesPage);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  it('loads product M profile on init', () => {
    const c = createComp();
    expect(service.getOne).toHaveBeenCalledWith('product', 'M');
    expect(c.loading()).toBe(false);
    expect(c.loadError()).toBeNull();
    expect(c.visible().has('sku')).toBe(true);
    expect(c.visible().has('name')).toBe(true);
  });

  it('shows load error with retry path when getOne fails', () => {
    service.getOne.mockReturnValue(of(fail('Сеть недоступна')));
    const c = createComp();
    expect(c.loadError()).toBe('Сеть недоступна');
    expect(c.visible().size).toBe(0);
  });

  it('locks article identity fields but leaves product name optional', () => {
    const c = createComp();
    c.onToggle('name', false);
    expect(c.visible().has('name')).toBe(false);
    c.onToggle('sku', false);
    expect(c.visible().has('sku')).toBe(true);
    c.onToggle('kind', false);
    expect(c.visible().has('kind')).toBe(true);
  });

  it('switches size and reloads', () => {
    const c = createComp();
    service.getOne.mockClear();
    service.getOne.mockReturnValue(
      of(
        ok({
          ...productM,
          size: 'S',
          visibleFieldKeys: ['name', 'kind', 'unit'],
        }),
      ),
    );
    c.onSizeChange('S');
    expect(service.getOne).toHaveBeenCalledWith('product', 'S');
    expect(c.size()).toBe('S');
  });

  it('switches entity via overflow-select change', () => {
    const c = createComp();
    service.getOne.mockClear();
    service.getOne.mockReturnValue(
      of(
        ok({
          _id: 'fp-mod',
          organizationId: 'org1',
          entity: 'module',
          size: 'M',
          visibleFieldKeys: ['name', 'article', 'width', 'height', 'depth', 'unit', 'weight'],
        }),
      ),
    );
    c.onEntityChange('module');
    expect(c.entity()).toBe('module');
    expect(service.getOne).toHaveBeenCalledWith('module', 'M');
  });

  it('saves via PUT and toasts success', () => {
    const c = createComp();
    c.onSave();
    expect(service.upsert).toHaveBeenCalled();
    const [, , keys] = service.upsert.mock.calls[0] as [string, string, string[]];
    expect(keys).toContain('name');
    expect(keys).toContain('kind');
    expect(keys).toContain('unit');
    expect(success).toHaveBeenCalledWith('Профиль сохранён');
  });

  it('toasts error when save fails', () => {
    service.upsert.mockReturnValue(of(fail('Нельзя снять обязательное')));
    const c = createComp();
    c.onSave();
    expect(error).toHaveBeenCalled();
    expect(c.saveError()).toBe('Нельзя снять обязательное');
  });

  it('fieldRows mark sku as visible+locked while product name stays optional', () => {
    const c = createComp();
    const skuRow = c.fieldRows().find((r) => r.key === 'sku');
    expect(skuRow?.locked).toBe(true);
    expect(skuRow?.visible).toBe(true);
    expect(skuRow?.label).toBe('Артикул');
    const nameRow = c.fieldRows().find((r) => r.key === 'name');
    expect(nameRow?.locked).toBe(false);
  });
});
