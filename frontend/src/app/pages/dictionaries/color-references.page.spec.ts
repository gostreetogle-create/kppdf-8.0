import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { ColorReferencesPage } from './color-references.page';
import { ColorReferencesService } from '../../shared/services/pi-color-references.service';
import { PiToastService } from '../../shared/ui/toast';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import type { SilentResult } from '../../core/silent-http';
import type { ColorReference } from '../../shared/services/pi-color-references.service';

describe('ColorReferencesPage (TZ-PRODUCTS-301)', () => {
  const dialogSpy = { open: jest.fn() };
  const success = jest.fn();
  const error = jest.fn();

  const fakeColors: ColorReference[] = [
    {
      _id: 'col1',
      name: 'Не выбран',
      slug: 'ne-vybran',
      hex: '#9CA3AF',
      isActive: true,
      isSystem: true,
      isDefault: true,
      sortOrder: 0,
    },
    {
      _id: 'col2',
      name: 'RAL 9003 (Сигнальный белый)',
      slug: 'ral-9003-signal-white',
      hex: '#F5F5F5',
      isActive: true,
      isSystem: false,
      isDefault: false,
      sortOrder: 10,
    },
    {
      _id: 'col3',
      name: 'RAL 9004 (Чёрный)',
      slug: 'ral-9004-black',
      hex: '#191C1D',
      isActive: false,
      isSystem: false,
      isDefault: false,
      sortOrder: 20,
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
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    service = {
      list: jest.fn().mockReturnValue(of(ok(fakeColors))),
      create: jest.fn().mockReturnValue(of(ok(fakeColors[1]))),
      update: jest.fn().mockReturnValue(of(ok(fakeColors[1]))),
      remove: jest.fn().mockReturnValue(of(ok(undefined))),
    };

    await TestBed.configureTestingModule({
      providers: [
        { provide: ColorReferencesService, useValue: service },
        { provide: PiToastService, useValue: { success, error } },
        { provide: PiDialogService, useValue: dialogSpy },
      ],
    })
      .overrideComponent(ColorReferencesPage, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
  });

  /** Fresh dialog ref per test — never share signal state across tests. */
  function openDialogMock() {
    const closed = signal<unknown>(undefined);
    dialogSpy.open.mockReturnValue({ closed, close: jest.fn() });
    return closed;
  }

  /**
   * Fresh component instance per test (constructor consumes list() once).
   * detectChanges() is required so the initial synchronous of() emission
   * lands and the template renders.
   */
  function createComp<T = Record<string, never>>() {
    const fixture = TestBed.createComponent(ColorReferencesPage);
    fixture.detectChanges();
    return fixture.componentInstance as unknown as T;
  }

  it('creates successfully', () => {
    expect(createComp()).toBeTruthy();
  });

  it('loads colors on creation', () => {
    const c = createComp<{ items: () => ColorReference[]; loading: () => boolean }>();
    expect(c.items().length).toBe(3);
    expect(c.loading()).toBe(false);
  });

  it('shows an explicit error instead of an empty state when the initial list fails', () => {
    service.list.mockReturnValue(of(fail('Не удалось загрузить цвета')));
    const c = createComp<{
      items: () => unknown[];
      loading: () => boolean;
      error: () => string | null;
    }>();
    expect(c.items()).toEqual([]);
    expect(c.loading()).toBe(false);
    expect(c.error()).toBe('Не удалось загрузить цвета');
  });

  it('renders an empty state when there are no colors and no search', () => {
    service.list.mockReturnValue(of(ok([])));
    const fixture = TestBed.createComponent(ColorReferencesPage);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const c = fixture.componentInstance as unknown as { visible: () => unknown[] };
    expect(c.visible()).toEqual([]);
    expect(el.querySelector('app-pi-empty-state')).toBeTruthy();
  });

  it('filters colors by search query on name', () => {
    const c = createComp<{
      searchQuery: { set: (v: string) => void };
      visible: () => { _id: string; name: string }[];
    }>();
    c.searchQuery.set('Сигнальный');
    expect(c.visible()).toHaveLength(1);
    expect(c.visible()[0].name).toBe('RAL 9003 (Сигнальный белый)');
  });

  it('filters colors by search query on slug', () => {
    const c = createComp<{
      searchQuery: { set: (v: string) => void };
      visible: () => { _id: string }[];
    }>();
    c.searchQuery.set('ral-9004');
    expect(c.visible()).toHaveLength(1);
    expect(c.visible()[0]._id).toBe('col3');
  });

  it('sorts by sortOrder then name', () => {
    const c = createComp<{ visible: () => { _id: string }[] }>();
    expect(c.visible().map((x) => x._id)).toEqual(['col1', 'col2', 'col3']);
  });

  it('toggle active calls update and mutates local data on success', () => {
    const c = createComp<{
      onToggleActive: (cat: ColorReference, active: boolean) => void;
      items: () => ColorReference[];
    }>();
    c.onToggleActive(fakeColors[1], false);
    expect(service.update).toHaveBeenCalledWith('col2', { isActive: false });
    expect(c.items().find((x) => x._id === 'col2')?.isActive).toBe(false);
  });

  it('does not toggle a system color', () => {
    const c = createComp<{
      onToggleActive: (cat: ColorReference, active: boolean) => void;
    }>();
    c.onToggleActive(fakeColors[0], false);
    expect(service.update).not.toHaveBeenCalled();
  });

  it('reports toggle failure without changing local data', () => {
    service.update.mockReturnValue(of(fail('Не удалось изменить активность')));
    const c = createComp<{
      onToggleActive: (cat: ColorReference, active: boolean) => void;
      items: () => ColorReference[];
    }>();
    c.onToggleActive(fakeColors[1], false);
    expect(error).toHaveBeenCalledWith('Не удалось изменить активность');
    expect(c.items().find((x) => x._id === 'col2')?.isActive).toBe(true);
  });

  it('reports delete failure without removing the local row', async () => {
    service.remove.mockReturnValue(of(fail('Цвет используют товары')));
    const closed = openDialogMock();
    const fixture = TestBed.createComponent(ColorReferencesPage);
    fixture.detectChanges();
    const c = fixture.componentInstance as unknown as {
      onDelete: (cat: ColorReference) => void;
      items: () => ColorReference[];
    };
    c.onDelete(fakeColors[2]);
    closed.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(service.remove).toHaveBeenCalledWith('col3');
    expect(error).toHaveBeenCalledWith('Цвет используют товары');
    expect(c.items().length).toBe(3);
  });

  it('deletes a color and removes the local row on success', async () => {
    const closed = openDialogMock();
    const fixture = TestBed.createComponent(ColorReferencesPage);
    fixture.detectChanges();
    const c = fixture.componentInstance as unknown as {
      onDelete: (cat: ColorReference) => void;
      items: () => ColorReference[];
    };
    c.onDelete(fakeColors[2]);
    closed.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(service.remove).toHaveBeenCalledWith('col3');
    expect(c.items().length).toBe(2);
  });

  it('does not open delete for a system color', () => {
    const c = createComp<{ onDelete: (cat: ColorReference) => void }>();
    c.onDelete(fakeColors[0]);
    expect(dialogSpy.open).not.toHaveBeenCalled();
  });

  it('reloads the list when a create dialog closes', async () => {
    const closed = openDialogMock();
    const fixture = TestBed.createComponent(ColorReferencesPage);
    fixture.detectChanges();
    const c = fixture.componentInstance as unknown as {
      openCreate: () => void;
      items: { set: (v: ColorReference[]) => void; (): ColorReference[] };
    };
    c.openCreate();
    expect(dialogSpy.open).toHaveBeenCalled();
    const before = service.list.mock.calls.length;
    c.items.set([]);
    closed.set(fakeColors[1]);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(service.list.mock.calls.length).toBeGreaterThan(before);
    expect(c.items().length).toBe(3);
  });
});
