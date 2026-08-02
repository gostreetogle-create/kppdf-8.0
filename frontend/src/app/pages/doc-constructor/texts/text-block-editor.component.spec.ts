/**
 * TZ-DOC-316 — TextBlockEditorComponent tests for the «Категория» section.
 *
 * The editor is heavy (TipTap rich text, data picker dialog); these specs
 * focus on the category picker contract that TZ-DOC-316 adds:
 *   - the select renders the active catalog from the categories service;
 *   - changing the select updates selectedCategoryId (empty → null);
 *   - save payload contains categoryId exactly once when a category is
 *     selected, and omits it entirely when «Не выбрана» (server default).
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { TextBlockEditorComponent } from './text-block-editor.component';
import { TextBlocksService } from '../../../shared/services/pi-text-blocks.service';
import { TextBlockCategoriesService } from '../../../shared/services/pi-text-block-categories.service';
import { PiToastService } from '../../../shared/ui/toast';
import { PiDialogService } from '../../../shared/ui/dialog/pi-dialog.service';

const mockUUID = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c: string) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });

beforeEach(() => {
  Object.defineProperty(globalThis, 'crypto', {
    value: { randomUUID: mockUUID },
    writable: true,
    configurable: true,
  });
});

describe('TextBlockEditorComponent (TZ-DOC-316 category section)', () => {
  let fixture: ComponentFixture<TextBlockEditorComponent>;
  let toastSuccess: jest.Mock;
  let toastError: jest.Mock;
  let blockSvc: { create: jest.Mock; update: jest.Mock };
  let catSvc: { list: jest.Mock };

  const categories = [
    {
      _id: 'cat-1',
      name: 'Общее',
      slug: 'obshchee',
      isActive: true,
      isSystem: true,
      isDefault: true,
      sortOrder: 0,
    },
    {
      _id: 'cat-2',
      name: 'Реквизиты контрагента',
      slug: 'rekvizity-kontragenta',
      isActive: true,
      isSystem: false,
      isDefault: false,
      sortOrder: 10,
    },
  ];

  beforeEach(async () => {
    toastSuccess = jest.fn();
    toastError = jest.fn();
    blockSvc = {
      create: jest.fn().mockReturnValue(
        of({ ok: true, data: { _id: 'b1', name: 'Блок', columns: [] } }),
      ),
      update: jest
        .fn()
        .mockReturnValue(of({ ok: true, data: { _id: 'b1', name: 'Блок', columns: [] } })),
    };
    catSvc = { list: jest.fn().mockReturnValue(of({ ok: true, data: categories })) };

    await TestBed.configureTestingModule({
      imports: [TextBlockEditorComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        { provide: TextBlocksService, useValue: blockSvc },
        { provide: TextBlockCategoriesService, useValue: catSvc },
        { provide: PiToastService, useValue: { success: toastSuccess, error: toastError } },
        { provide: PiDialogService, useValue: { open: jest.fn() } },
      ],
    })
      .overrideComponent(TextBlockEditorComponent, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
  });

  function create(block: unknown = null) {
    fixture = TestBed.createComponent(TextBlockEditorComponent);
    fixture.componentRef.setInput('block', block);
    fixture.detectChanges();
    return fixture.componentInstance as unknown as {
      categories: () => unknown[];
      categoryLoading: () => boolean;
      selectedCategoryId: () => string | null;
      onCategoryChange: (e: Event) => void;
      onSave: () => void;
      nameControl: { setValue(v: string): void; invalid: boolean };
    };
  }

  it('renders the category select with the active catalog and stops loading', () => {
    const c = create();
    expect(catSvc.list).toHaveBeenCalledWith({ activeOnly: true });
    expect(c.categories().length).toBe(2);
    expect(c.categoryLoading()).toBe(false);
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('[data-test="tbe-category-select"]')).toBeTruthy();
  });

  it('auto-selects the active default category for a NEW block (server default)', () => {
    const c = create();
    expect(c.selectedCategoryId()).toBe('cat-1');
  });

  it('preselects the existing block categoryId when editing', () => {
    const c = create({ _id: 'b1', name: 'Блок', categoryId: 'cat-2', columns: [] });
    expect(c.selectedCategoryId()).toBe('cat-2');
  });

  it('changing the select to a category updates the selection', () => {
    const c = create();
    const select = fixture.nativeElement.querySelector(
      '[data-test="tbe-category-select"]',
    ) as HTMLSelectElement;
    select.value = 'cat-2';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(c.selectedCategoryId()).toBe('cat-2');
  });

  it('changing the select to «Не выбрана» (empty) sets null', () => {
    const c = create({ _id: 'b1', name: 'Блок', categoryId: 'cat-2', columns: [] });
    const select = fixture.nativeElement.querySelector(
      '[data-test="tbe-category-select"]',
    ) as HTMLSelectElement;
    select.value = '';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(c.selectedCategoryId()).toBeNull();
  });

  it('save payload contains categoryId exactly once when a category is selected', () => {
    const c = create();
    c.nameControl.setValue('Блок');
    c.selectedCategoryId();
    const select = fixture.nativeElement.querySelector(
      '[data-test="tbe-category-select"]',
    ) as HTMLSelectElement;
    select.value = 'cat-2';
    select.dispatchEvent(new Event('change'));
    c.onSave();
    const payload = blockSvc.create.mock.calls[0][0] as { categoryId?: string };
    expect(payload.categoryId).toBe('cat-2');
  });

  it('save payload omits categoryId entirely when «Не выбрана» (server applies default)', () => {
    const c = create();
    c.nameControl.setValue('Блок');
    const select = fixture.nativeElement.querySelector(
      '[data-test="tbe-category-select"]',
    ) as HTMLSelectElement;
    select.value = '';
    select.dispatchEvent(new Event('change'));
    c.onSave();
    const payload = blockSvc.create.mock.calls[0][0] as { categoryId?: string };
    expect('categoryId' in payload).toBe(false);
    expect(payload.categoryId).toBeUndefined();
  });
});
