import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { TemplatesPage } from './templates.page';
import { DocumentTemplatesService } from '../../../shared/services/pi-document-templates.service';
import { PiToastService } from '../../../shared/ui/toast';
import { PiDialogService } from '../../../shared/ui/dialog/pi-dialog.service';
import type { SilentResult } from '../../../core/silent-http';
import type { DocumentTemplate } from '../../../shared/services/pi-document-templates.service';
import type { TemplateSetupResult } from '../builder/template-setup-dialog.component';

describe('TemplatesPage', () => {
  const dialogSpy = {
    open: jest.fn().mockReturnValue({ closed: signal(undefined), close: jest.fn() }),
  };
  const navigate = jest.fn();
  const success = jest.fn();
  const error = jest.fn();

  const fakeTemplates: DocumentTemplate[] = [
    {
      _id: 'dt1',
      name: 'Договор поставки',
      tags: ['договор'],
      organizationId: 'org1',
      docTypeId: { _id: 'dt1', name: 'Договор' },
      isDefault: false,
      isActive: true,
      pageSize: 'A4',
      backgroundImage: [],
      defaultBackgroundIndex: -1,
      backgroundOpacity: 0.3,
      orientation: 'portrait',
      version: 1,
    },
    {
      _id: 'dt2',
      name: 'КП по умолчанию',
      tags: ['КП'],
      organizationId: 'org1',
      docTypeId: { _id: 'dt2', name: 'КП' },
      isDefault: true,
      isActive: true,
      pageSize: 'A4',
      backgroundImage: [],
      defaultBackgroundIndex: -1,
      backgroundOpacity: 0.3,
      orientation: 'portrait',
      version: 1,
    },
  ];

  const ok = <T>(data: T): SilentResult<T> => ({ ok: true, data });
  const fail = <T = never>(message: string): SilentResult<T> => ({
    ok: false,
    error: new HttpErrorResponse({ status: 500, error: { message } }),
  });

  let service: {
    list: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
    setDefault: jest.Mock;
    duplicate: jest.Mock;
    listOrganizations: jest.Mock;
    listDocTypes: jest.Mock;
    createOrganization: jest.Mock;
    createDocType: jest.Mock;
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    service = {
      list: jest.fn().mockReturnValue(of(ok({ items: fakeTemplates, total: 2 }))),
      create: jest.fn().mockReturnValue(of(ok({ _id: 'dt3' }))),
      update: jest.fn().mockReturnValue(of(ok({ _id: 'dt1' }))),
      remove: jest.fn().mockReturnValue(of(ok(undefined))),
      setDefault: jest.fn().mockReturnValue(of(ok(undefined))),
      duplicate: jest.fn().mockReturnValue(of(ok({ ...fakeTemplates[0], _id: 'dt3' }))),
      listOrganizations: jest
        .fn()
        .mockReturnValue(of(ok({ items: [{ _id: 'org1', name: 'Основная' }] }))),
      listDocTypes: jest.fn().mockReturnValue(of(ok([{ _id: 'type1', name: 'КП' }]))),
      createOrganization: jest.fn().mockReturnValue(of(ok({ _id: 'org1', name: 'Основная' }))),
      createDocType: jest.fn().mockReturnValue(of(ok({ _id: 'type1', name: 'КП' }))),
    };

    await TestBed.configureTestingModule({
      providers: [
        { provide: DocumentTemplatesService, useValue: service },
        { provide: Router, useValue: { navigate } },
        { provide: PiToastService, useValue: { success, error } },
        { provide: PiDialogService, useValue: dialogSpy },
      ],
    })
      .overrideComponent(TemplatesPage, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
  });

  it('creates successfully', () => {
    const fixture = TestBed.createComponent(TemplatesPage);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('loads templates on creation', () => {
    const fixture = TestBed.createComponent(TemplatesPage);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      items: () => { _id: string }[];
      loading: () => boolean;
    };

    expect(comp.items().length).toBe(2);
    expect(comp.loading()).toBe(false);
  });

  it('shows an explicit error instead of an empty state when the initial list fails', () => {
    service.list.mockReturnValue(of(fail('Не удалось загрузить шаблоны')));
    const fixture = TestBed.createComponent(TemplatesPage);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      items: () => unknown[];
      loading: () => boolean;
      error: () => string | null;
    };

    expect(comp.items()).toEqual([]);
    expect(comp.loading()).toBe(false);
    expect(comp.error()).toBe('Не удалось загрузить шаблоны');
  });

  it('reports toggle, default, and delete failures without changing local data', async () => {
    const fixture = TestBed.createComponent(TemplatesPage);
    fixture.detectChanges();
    const instance = fixture.componentInstance as unknown as {
      onToggleActive: (template: DocumentTemplate, active: boolean) => void;
      onSetDefault: (template: DocumentTemplate) => void;
      onDelete: (template: DocumentTemplate) => void;
      items: () => DocumentTemplate[];
    };
    const template = fakeTemplates[0];

    service.update.mockReturnValue(of(fail('Не удалось изменить активность')));
    service.setDefault.mockReturnValue(of(fail('Не удалось назначить шаблон')));
    service.remove.mockReturnValue(of(fail('Не удалось удалить шаблон')));
    const closed = signal<boolean | undefined>(undefined);
    dialogSpy.open.mockReturnValue({ closed, close: jest.fn() });

    instance.onToggleActive(template, false);
    instance.onSetDefault(template);
    instance.onDelete(template);
    closed.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(error).toHaveBeenCalledWith('Не удалось изменить активность');
    expect(error).toHaveBeenCalledWith('Не удалось назначить шаблон');
    expect(error).toHaveBeenCalledWith('Не удалось удалить шаблон');
    expect(instance.items()).toEqual(fakeTemplates);
  });

  it('resets creating and does not navigate when setup creation fails', async () => {
    service.listOrganizations.mockReturnValue(of(fail('Нет организации')));
    const fixture = TestBed.createComponent(TemplatesPage);
    fixture.detectChanges();

    const instance = fixture.componentInstance as unknown as {
      onCreate: () => void;
      creating: () => boolean;
    };
    const closed = signal<{ pageSize: 'A4'; orientation: 'portrait' } | undefined>(undefined);
    dialogSpy.open.mockReturnValue({ closed, close: jest.fn() });

    instance.onCreate();
    closed.set({ pageSize: 'A4', orientation: 'portrait' });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(instance.creating()).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith('Нет организации');
  });

  it('reports duplicate failure without navigating', async () => {
    const fixture = TestBed.createComponent(TemplatesPage);
    fixture.detectChanges();
    const instance = fixture.componentInstance as unknown as {
      onDuplicate: (template: DocumentTemplate) => void;
    };
    const closed = signal<TemplateSetupResult | undefined>(undefined);
    dialogSpy.open.mockReturnValue({ closed, close: jest.fn() });
    service.duplicate.mockReturnValue(of(fail('Не удалось создать копию')));

    instance.onDuplicate(fakeTemplates[0]);
    closed.set({ pageSize: 'A4', orientation: 'portrait' });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(error).toHaveBeenCalledWith('Не удалось создать копию');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('rolls back a duplicate when its format update fails', async () => {
    const fixture = TestBed.createComponent(TemplatesPage);
    fixture.detectChanges();
    const instance = fixture.componentInstance as unknown as {
      onDuplicate: (template: DocumentTemplate) => void;
    };
    const closed = signal<TemplateSetupResult | undefined>(undefined);
    dialogSpy.open.mockReturnValue({ closed, close: jest.fn() });
    service.duplicate.mockReturnValue(of(ok({ ...fakeTemplates[0], _id: 'dt3' })));
    service.update.mockReturnValue(of(fail('Не удалось применить формат')));
    service.remove.mockReturnValue(of(ok(undefined)));

    instance.onDuplicate(fakeTemplates[0]);
    closed.set({ pageSize: 'A5', orientation: 'landscape' });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(service.remove).toHaveBeenCalledWith('dt3');
    expect(error).toHaveBeenCalledWith('Не удалось применить формат');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('reports duplicate cleanup failure without navigating', async () => {
    const fixture = TestBed.createComponent(TemplatesPage);
    fixture.detectChanges();
    const instance = fixture.componentInstance as unknown as {
      onDuplicate: (template: DocumentTemplate) => void;
    };
    const closed = signal<TemplateSetupResult | undefined>(undefined);
    dialogSpy.open.mockReturnValue({ closed, close: jest.fn() });
    service.duplicate.mockReturnValue(of(ok({ ...fakeTemplates[0], _id: 'dt3' })));
    service.update.mockReturnValue(of(fail('Не удалось применить формат')));
    service.remove.mockReturnValue(of(fail('Не удалось очистить копию')));

    instance.onDuplicate(fakeTemplates[0]);
    closed.set({ pageSize: 'A5', orientation: 'landscape' });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(service.remove).toHaveBeenCalledWith('dt3');
    expect(error).toHaveBeenCalledWith('Не удалось очистить копию');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('reports a template create failure and does not navigate', async () => {
    const fixture = TestBed.createComponent(TemplatesPage);
    fixture.detectChanges();
    const instance = fixture.componentInstance as unknown as {
      onCreate: () => void;
      creating: () => boolean;
    };
    const closed = signal<TemplateSetupResult | undefined>(undefined);
    dialogSpy.open.mockReturnValue({ closed, close: jest.fn() });
    service.create.mockReturnValue(of(fail('Не удалось сохранить шаблон')));

    instance.onCreate();
    closed.set({ pageSize: 'A4', orientation: 'portrait' });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(instance.creating()).toBe(false);
    expect(error).toHaveBeenCalledWith('Не удалось сохранить шаблон');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('filters templates by search query', () => {
    const fixture = TestBed.createComponent(TemplatesPage);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      searchQuery: { set: (v: string) => void };
      filtered: () => { _id: string; name: string }[];
    };

    comp.searchQuery.set('Договор');
    fixture.detectChanges();

    expect(comp.filtered()).toHaveLength(1);
    expect(comp.filtered()[0].name).toBe('Договор поставки');
  });

  it('returns all when search is cleared', () => {
    const fixture = TestBed.createComponent(TemplatesPage);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      searchQuery: { set: (v: string) => void };
      filtered: () => { _id: string }[];
    };

    comp.searchQuery.set('Договор');
    comp.searchQuery.set('');
    fixture.detectChanges();

    expect(comp.filtered()).toHaveLength(2);
  });
});
