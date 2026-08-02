import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { DocumentTemplateCategoriesPage } from './document-template-categories.page';
import { DocumentTemplateCategoriesService } from '../../shared/services/pi-document-template-categories.service';
import { PiToastService } from '../../shared/ui/toast';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import type { SilentResult } from '../../core/silent-http';
import type { DocumentTemplateCategory } from '../../shared/services/pi-document-template-categories.service';

describe('DocumentTemplateCategoriesPage (TZ-DOC-308)', () => {
  const dialogSpy = { open: jest.fn() };
  const success = jest.fn();
  const error = jest.fn();

  const fakeCategories: DocumentTemplateCategory[] = [
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
      name: 'Коммерческие предложения',
      slug: 'commercial-proposals',
      isActive: true,
      isSystem: false,
      isDefault: false,
      sortOrder: 10,
    },
    {
      _id: 'cat3',
      name: 'Договоры',
      slug: 'contracts',
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
        { provide: DocumentTemplateCategoriesService, useValue: service },
        { provide: PiToastService, useValue: { success, error } },
        { provide: PiDialogService, useValue: dialogSpy },
      ],
    })
      .overrideComponent(DocumentTemplateCategoriesPage, {
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
    const fixture = TestBed.createComponent(DocumentTemplateCategoriesPage);
    fixture.detectChanges();
    return fixture.componentInstance as unknown as T;
  }

  it('creates successfully', () => {
    expect(createComp()).toBeTruthy();
  });

  it('loads categories on creation', () => {
    const c = createComp<{ items: () => DocumentTemplateCategory[]; loading: () => boolean }>();
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
    const fixture = TestBed.createComponent(DocumentTemplateCategoriesPage);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const c = fixture.componentInstance as unknown as { visible: () => unknown[] };
    expect(c.visible()).toEqual([]);
    expect(el.querySelector('app-pi-empty-state')).toBeTruthy();
  });

  it('filters categories by search query', () => {
    const c = createComp<{
      searchQuery: { set: (v: string) => void };
      visible: () => { _id: string; name: string }[];
    }>();
    c.searchQuery.set('Коммерческие');
    expect(c.visible()).toHaveLength(1);
    expect(c.visible()[0].name).toBe('Коммерческие предложения');
  });

  it('sorts by sortOrder then name', () => {
    const c = createComp<{ visible: () => { _id: string }[] }>();
    expect(c.visible().map((x) => x._id)).toEqual(['cat1', 'cat2', 'cat3']);
  });

  it('toggle active calls update and mutates local data on success', () => {
    const c = createComp<{
      onToggleActive: (cat: DocumentTemplateCategory, active: boolean) => void;
      items: () => DocumentTemplateCategory[];
    }>();
    c.onToggleActive(fakeCategories[1], false);
    expect(service.update).toHaveBeenCalledWith('cat2', { isActive: false });
    expect(c.items().find((x) => x._id === 'cat2')?.isActive).toBe(false);
  });

  it('reports toggle failure without changing local data', () => {
    service.update.mockReturnValue(of(fail('Не удалось изменить активность')));
    const c = createComp<{
      onToggleActive: (cat: DocumentTemplateCategory, active: boolean) => void;
      items: () => DocumentTemplateCategory[];
    }>();
    c.onToggleActive(fakeCategories[1], false);
    expect(error).toHaveBeenCalledWith('Не удалось изменить активность');
    expect(c.items().find((x) => x._id === 'cat2')?.isActive).toBe(true);
  });

  it('reports delete failure without removing the local row', async () => {
    service.remove.mockReturnValue(of(fail('Категорию используют шаблоны')));
    const closed = openDialogMock();
    const fixture = TestBed.createComponent(DocumentTemplateCategoriesPage);
    fixture.detectChanges();
    const c = fixture.componentInstance as unknown as {
      onDelete: (cat: DocumentTemplateCategory) => void;
      items: () => DocumentTemplateCategory[];
    };
    c.onDelete(fakeCategories[2]);
    closed.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(service.remove).toHaveBeenCalledWith('cat3');
    expect(error).toHaveBeenCalledWith('Категорию используют шаблоны');
    expect(c.items().length).toBe(3);
  });

  it('deletes a category and removes the local row on success', async () => {
    const closed = openDialogMock();
    const fixture = TestBed.createComponent(DocumentTemplateCategoriesPage);
    fixture.detectChanges();
    const c = fixture.componentInstance as unknown as {
      onDelete: (cat: DocumentTemplateCategory) => void;
      items: () => DocumentTemplateCategory[];
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
    const fixture = TestBed.createComponent(DocumentTemplateCategoriesPage);
    fixture.detectChanges();
    const c = fixture.componentInstance as unknown as {
      openCreate: () => void;
      items: { set: (v: DocumentTemplateCategory[]) => void; (): DocumentTemplateCategory[] };
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
