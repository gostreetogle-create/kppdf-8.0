import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { ColorReferencesPage } from './color-references.page';
import { PiColorReferencesService } from '../../shared/services/pi-color-references.service';
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
      _id: 'color1',
      name: 'Не выбран',
      slug: 'ne_vybran',
      hex: '#9CA3AF',
      isActive: true,
      isSystem: true,
      isDefault: true,
    },
    {
      _id: 'color2',
      name: 'RAL 9003 — Сигнальный белый',
      slug: 'ral-9003',
      hex: '#F4F4F4',
      isActive: true,
      isSystem: false,
      isDefault: false,
    },
    {
      _id: 'color3',
      name: 'RAL 7016 — Антрацитово-серый',
      slug: 'ral-7016',
      hex: '#383E42',
      isActive: false,
      isSystem: false,
      isDefault: false,
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
        { provide: PiColorReferencesService, useValue: service },
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

  /** Fresh component instance per test (constructor consumes list() once). */
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
    expect(el.querySelector('app-pi-table')).toBeTruthy();
  });

  it('filters colors by search query (name OR slug)', () => {
    const c = createComp<{
      searchQuery: { set: (v: string) => void };
      visible: () => { _id: string }[];
    }>();
    c.searchQuery.set('ral-9003');
    expect(c.visible()).toHaveLength(1);
    expect(c.visible()[0]._id).toBe('color2');
  });

  it('sorts by name then slug (ru collation: Cyrillic before Latin)', () => {
    const c = createComp<{ visible: () => { _id: string }[] }>();
    expect(c.visible().map((x) => x._id)).toEqual(['color1', 'color3', 'color2']);
  });

  it('pauses toggling a SYSTEM color in the UI (no update call)', () => {
    const c = createComp<{
      onToggleActive: (color: ColorReference, active: boolean) => void;
      items: () => ColorReference[];
    }>();
    c.onToggleActive(fakeColors[0], false);
    expect(service.update).not.toHaveBeenCalled();
    expect(c.items().find((x) => x._id === 'color1')?.isActive).toBe(true);
  });

  it('optimistically toggles active and mutates local data on success', () => {
    const c = createComp<{
      onToggleActive: (color: ColorReference, active: boolean) => void;
      items: () => ColorReference[];
    }>();
    c.onToggleActive(fakeColors[1], false);
    expect(service.update).toHaveBeenCalledWith('color2', { isActive: false });
    expect(c.items().find((x) => x._id === 'color2')?.isActive).toBe(false);
  });

  it('reports toggle failure and ROLLS BACK the optimistic flip', () => {
    service.update.mockReturnValue(of(fail('Не удалось изменить активность')));
    const c = createComp<{
      onToggleActive: (color: ColorReference, active: boolean) => void;
      items: () => ColorReference[];
    }>();
    c.onToggleActive(fakeColors[1], false);
    expect(error).toHaveBeenCalledWith('Не удалось изменить активность');
    expect(c.items().find((x) => x._id === 'color2')?.isActive).toBe(true);
  });

  it('blocks delete of a SYSTEM color in the UI', () => {
    const c = createComp<{
      onDelete: (color: ColorReference) => void;
      items: () => ColorReference[];
    }>();
    c.onDelete(fakeColors[0]);
    expect(dialogSpy.open).not.toHaveBeenCalled();
    expect(c.items().length).toBe(3);
  });

  it('reports remove failure (e.g. 409 used/default) via snackbar without removing the row', async () => {
    service.remove.mockReturnValue(
      of(fail('Цвет используется как цвет по умолчанию — удаление невозможно')),
    );
    const closed = openDialogMock();
    const fixture = TestBed.createComponent(ColorReferencesPage);
    fixture.detectChanges();
    const c = fixture.componentInstance as unknown as {
      onDelete: (color: ColorReference) => void;
      items: () => ColorReference[];
    };
    c.onDelete(fakeColors[2]);
    closed.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(service.remove).toHaveBeenCalledWith('color3');
    expect(error).toHaveBeenCalledWith(
      'Цвет используется как цвет по умолчанию — удаление невозможно',
    );
    expect(c.items().length).toBe(3);
  });

  it('deletes a color and removes the local row on success', async () => {
    const closed = openDialogMock();
    const fixture = TestBed.createComponent(ColorReferencesPage);
    fixture.detectChanges();
    const c = fixture.componentInstance as unknown as {
      onDelete: (color: ColorReference) => void;
      items: () => ColorReference[];
    };
    c.onDelete(fakeColors[2]);
    closed.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(service.remove).toHaveBeenCalledWith('color3');
    expect(c.items().length).toBe(2);
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

  it('copy opens the create dialog pre-filled without an _id', () => {
    const closed = openDialogMock();
    const fixture = TestBed.createComponent(ColorReferencesPage);
    fixture.detectChanges();
    const c = fixture.componentInstance as unknown as {
      onCopy: (color: ColorReference) => void;
    };
    c.onCopy(fakeColors[1]);
    expect(dialogSpy.open).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'RAL 9003 — Сигнальный белый (копия)',
          _id: undefined,
        }),
      }),
    );
    expect(closed()).toBeUndefined();
  });
});
