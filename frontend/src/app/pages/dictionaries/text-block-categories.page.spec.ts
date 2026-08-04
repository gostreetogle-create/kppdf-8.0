import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { TextBlockCategoriesPage } from './text-block-categories.page';
import { TextBlockCategoriesService } from '../../shared/services/pi-text-block-categories.service';
import { PiToastService } from '../../shared/ui/toast';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import type { SilentResult } from '../../core/silent-http';
import type { TextBlockCategory } from '../../shared/services/pi-text-block-categories.service';

describe('TextBlockCategoriesPage (TZ-DOC-316)', () => {
  const dialogSpy = { open: jest.fn() };
  const success = jest.fn();
  const error = jest.fn();

  const fakeCategories: TextBlockCategory[] = [
    {
      _id: 'cat1',
      name: 'Общее',
      slug: 'obshchee',
      isActive: true,
      isSystem: true,
      isDefault: true,
      sortOrder: 0,
    },
    {
      _id: 'cat2',
      name: 'Реквизиты контрагента',
      slug: 'rekvizity-kontragenta',
      isActive: true,
      isSystem: false,
      isDefault: false,
      sortOrder: 10,
      description: 'Банковские и юридические реквизиты',
    },
    {
      _id: 'cat3',
      name: 'Описания',
      slug: 'opisaniya',
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
      list: jest.fn().mockReturnValue(of(ok(fakeCategories))),
      create: jest.fn().mockReturnValue(of(ok(fakeCategories[1]))),
      update: jest.fn().mockReturnValue(of(ok(fakeCategories[1]))),
      remove: jest.fn().mockReturnValue(of(ok(undefined))),
    };

    await TestBed.configureTestingModule({
      providers: [
        { provide: TextBlockCategoriesService, useValue: service },
        { provide: PiToastService, useValue: { success, error } },
        { provide: PiDialogService, useValue: dialogSpy },
      ],
    })
      .overrideComponent(TextBlockCategoriesPage, {
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
    const fixture = TestBed.createComponent(TextBlockCategoriesPage);
    fixture.detectChanges();
    return fixture.componentInstance as unknown as T;
  }

  it('creates successfully', () => {
    expect(createComp()).toBeTruthy();
  });

  it('renders the PiDictionaryShell chrome with sticky search + CTA (TZ-DICT-307)', () => {
    const fixture = TestBed.createComponent(TextBlockCategoriesPage);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const shell = el.querySelector('app-pi-dictionary-shell');
    expect(shell).toBeTruthy();
    const search = shell?.querySelector('input[aria-label="Поиск категорий текстов"]');
    expect(search).toBeTruthy();
    expect((search as HTMLInputElement | null | undefined)?.getAttribute('placeholder')).toBe(
      'Поиск по названию или slug…',
    );
    expect(shell?.querySelector('app-pi-button[data-test="create-category-button"]')).toBeTruthy();
    // D1 canon: old prose chrome (page-header / section) must be gone.
    expect(el.querySelector('app-pi-page-header')).toBeFalsy();
    expect(el.querySelector('app-pi-section')).toBeFalsy();
  });

  it('loads categories on creation', () => {
    const c = createComp<{ items: () => TextBlockCategory[]; loading: () => boolean }>();
    expect(c.items().length).toBe(3);
    expect(c.loading()).toBe(false);
  });

  it('shows an explicit error instead of an empty state when the initial list fails', () => {
    service.list.mockReturnValue(of(fail('Не удалось загрузить категории')));
    const c = createComp<{
      items: () => unknown[];
      loading: () => boolean;
      error: () => string | null;
    }>();
    expect(c.items()).toEqual([]);
    expect(c.loading()).toBe(false);
    expect(c.error()).toBe('Не удалось загрузить категории');
  });

  it('renders an empty state when there are no categories and no search', () => {
    service.list.mockReturnValue(of(ok([])));
    const fixture = TestBed.createComponent(TextBlockCategoriesPage);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const c = fixture.componentInstance as unknown as { visible: () => unknown[] };
    expect(c.visible()).toEqual([]);
    expect(el.querySelector('app-pi-empty-state')).toBeTruthy();
  });

  it('filters categories by search query (name and slug)', () => {
    const c = createComp<{
      searchQuery: { set: (v: string) => void };
      visible: () => { _id: string; name: string }[];
    }>();
    c.searchQuery.set('Реквизиты');
    expect(c.visible()).toHaveLength(1);
    expect(c.visible()[0].name).toBe('Реквизиты контрагента');
    c.searchQuery.set('rekvizity');
    expect(c.visible()).toHaveLength(1);
  });

  it('sorts by sortOrder then name', () => {
    const c = createComp<{ visible: () => { _id: string }[] }>();
    expect(c.visible().map((x) => x._id)).toEqual(['cat1', 'cat2', 'cat3']);
  });

  it('toggle active calls update and mutates local data on success', () => {
    const c = createComp<{
      onToggleActive: (cat: TextBlockCategory, active: boolean) => void;
      items: () => TextBlockCategory[];
    }>();
    c.onToggleActive(fakeCategories[1], false);
    expect(service.update).toHaveBeenCalledWith('cat2', { isActive: false });
    expect(c.items().find((x) => x._id === 'cat2')?.isActive).toBe(false);
  });

  it('reports toggle failure without changing local data', () => {
    service.update.mockReturnValue(of(fail('Не удалось изменить активность')));
    const c = createComp<{
      onToggleActive: (cat: TextBlockCategory, active: boolean) => void;
      items: () => TextBlockCategory[];
    }>();
    c.onToggleActive(fakeCategories[1], false);
    expect(error).toHaveBeenCalledWith('Не удалось изменить активность');
    expect(c.items().find((x) => x._id === 'cat2')?.isActive).toBe(true);
  });

  it('does not toggle a system category (switch is a no-op)', () => {
    const c = createComp<{
      onToggleActive: (cat: TextBlockCategory, active: boolean) => void;
    }>();
    c.onToggleActive(fakeCategories[0], false);
    expect(service.update).not.toHaveBeenCalled();
  });

  it('does not open the edit dialog for a system category', () => {
    const c = createComp<{ openEdit: (cat: TextBlockCategory) => void }>();
    c.openEdit(fakeCategories[0]);
    expect(dialogSpy.open).not.toHaveBeenCalled();
  });

  it('reports delete failure without removing the local row', async () => {
    service.remove.mockReturnValue(of(fail('Категорию используют 3 блоков')));
    const closed = openDialogMock();
    const fixture = TestBed.createComponent(TextBlockCategoriesPage);
    fixture.detectChanges();
    const c = fixture.componentInstance as unknown as {
      onDelete: (cat: TextBlockCategory) => void;
      items: () => TextBlockCategory[];
    };
    c.onDelete(fakeCategories[2]);
    closed.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(service.remove).toHaveBeenCalledWith('cat3');
    expect(error).toHaveBeenCalledWith('Категорию используют 3 блоков');
    expect(c.items().length).toBe(3);
  });

  it('deletes a category and removes the local row on success', async () => {
    const closed = openDialogMock();
    const fixture = TestBed.createComponent(TextBlockCategoriesPage);
    fixture.detectChanges();
    const c = fixture.componentInstance as unknown as {
      onDelete: (cat: TextBlockCategory) => void;
      items: () => TextBlockCategory[];
    };
    c.onDelete(fakeCategories[2]);
    closed.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(service.remove).toHaveBeenCalledWith('cat3');
    expect(c.items().length).toBe(2);
  });

  it('reloads the list when a create dialog closes', async () => {
    const closed = openDialogMock();
    const fixture = TestBed.createComponent(TextBlockCategoriesPage);
    fixture.detectChanges();
    const c = fixture.componentInstance as unknown as {
      openCreate: () => void;
      items: { set: (v: TextBlockCategory[]) => void; (): TextBlockCategory[] };
    };
    c.openCreate();
    expect(dialogSpy.open).toHaveBeenCalled();
    const before = service.list.mock.calls.length;
    c.items.set([]);
    closed.set(fakeCategories[1]);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(service.list.mock.calls.length).toBeGreaterThan(before);
    expect(c.items().length).toBe(3);
  });
});
