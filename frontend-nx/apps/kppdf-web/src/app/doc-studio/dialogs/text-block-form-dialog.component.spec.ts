import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { PiTextBlockCategoriesService, PiTextBlocksService, type TextBlockCategoriesListParams } from '@kppdf/data-access';
import { PiDialogService, PI_DIALOG_DATA, PI_DIALOG_REF } from '@kppdf/ui/dialog';
import type { DialogRef } from '@kppdf/ui/dialog';
import { TextBlockFormDialogComponent } from './text-block-form-dialog.component';

describe('TextBlockFormDialogComponent (TZ-NX-REGISTRIES-BROWSER-MATRIX-2)', () => {
  // Live browser matrix found this dialog crashing on open: NG01203 "No
  // value accessor for form control name: 'content'". PiRichTextEditorComponent
  // exposes a signal model(), not ControlValueAccessor -- it cannot be a
  // formControlName. This spec locks the fix (content as a plain signal,
  // merged into the payload manually) so it can't regress silently again.
  let fixture: ComponentFixture<TextBlockFormDialogComponent>;
  let dialog: { open: jest.Mock };
  const close = jest.fn();
  const create = jest.fn().mockReturnValue(
    of({ ok: true as const, data: { _id: 'tb-1', name: 'Test', slug: 'test', tags: [], content: '', sortOrder: 0 } }),
  );

  beforeEach(async () => {
    close.mockReset();
    create.mockClear();
    dialog = { open: jest.fn() };
    await TestBed.configureTestingModule({
      imports: [TextBlockFormDialogComponent],
      providers: [
        { provide: PI_DIALOG_DATA, useValue: { mode: 'create' } },
        { provide: PI_DIALOG_REF, useValue: { close } as DialogRef<unknown> },
        { provide: PiTextBlockCategoriesService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiTextBlocksService, useValue: { create, update: jest.fn() } },
        { provide: PiDialogService, useValue: dialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TextBlockFormDialogComponent);
    fixture.detectChanges();
  });

  it('renders without throwing NG01203 on the rich-text field', () => {
    expect(fixture.nativeElement.querySelector('[data-test="text-block-form"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-pi-rich-text')).toBeTruthy();
  });

  it('includes the rich-text content in the create payload (content is not a form control) and never sends slug (server auto-generates it)', async () => {
    fixture.componentInstance['form'].patchValue({ name: 'Заголовок', categoryId: 'leaf-1' });
    fixture.componentInstance['content'].set('<p>Живой текст</p>');
    await fixture.componentInstance['submit']();
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Заголовок', categoryId: 'leaf-1', content: '<p>Живой текст</p>' }),
    );
    expect(create.mock.calls[0][0]).not.toHaveProperty('slug');
    expect(close).toHaveBeenCalled();
  });

  // TZ-NX-TEXT-CAT-PARENT / TZ-NX-TEXT-PICKER-FORM AC #1 — «No subcategory -> cannot save».
  it('does not call create when no subcategory (categoryId) is chosen', async () => {
    fixture.componentInstance['form'].patchValue({ name: 'Без категории' });
    await fixture.componentInstance['submit']();
    expect(create).not.toHaveBeenCalled();
  });

  it('patches the content signal (not the form) when editing an existing text block', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [TextBlockFormDialogComponent],
      providers: [
        {
          provide: PI_DIALOG_DATA,
          useValue: {
            mode: 'edit',
            textBlock: { _id: 'tb-1', name: 'X', slug: 'x', tags: [], content: '<p>Существующий</p>', sortOrder: 0 },
          },
        },
        { provide: PI_DIALOG_REF, useValue: { close: jest.fn() } as DialogRef<unknown> },
        { provide: PiTextBlockCategoriesService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiTextBlocksService, useValue: { create: jest.fn(), update: jest.fn() } },
        { provide: PiDialogService, useValue: { open: jest.fn() } },
      ],
    }).compileComponents();

    const editFixture = TestBed.createComponent(TextBlockFormDialogComponent);
    editFixture.detectChanges();
    expect(editFixture.componentInstance['content']()).toBe('<p>Существующий</p>');
    expect(editFixture.componentInstance['form'].getRawValue()).not.toHaveProperty('content');
  });

  it('pre-selects the root and subcategory from the existing leaf categoryId when editing (cat -> subcat cascade)', async () => {
    TestBed.resetTestingModule();
    const root = { _id: 'root-1', name: 'Реквизиты', slug: 'r', isActive: true, sortOrder: 0 };
    const leaf = { _id: 'leaf-1', name: 'Клиент', slug: 'k', isActive: true, sortOrder: 0, parentId: 'root-1' };
    const list = jest.fn((params: TextBlockCategoriesListParams = {}) => {
      if (params.rootsOnly) return of({ ok: true, data: [root] });
      if (params.parentId === 'root-1') return of({ ok: true, data: [leaf] });
      return of({ ok: true, data: [] });
    });
    const getById = jest.fn().mockReturnValue(of({ ok: true, data: leaf }));

    await TestBed.configureTestingModule({
      imports: [TextBlockFormDialogComponent],
      providers: [
        {
          provide: PI_DIALOG_DATA,
          useValue: {
            mode: 'edit',
            textBlock: { _id: 'tb-1', name: 'X', slug: 'x', tags: [], content: '<p>Y</p>', sortOrder: 0, categoryId: 'leaf-1' },
          },
        },
        { provide: PI_DIALOG_REF, useValue: { close: jest.fn() } as DialogRef<unknown> },
        { provide: PiTextBlockCategoriesService, useValue: { list, getById } },
        { provide: PiTextBlocksService, useValue: { create: jest.fn(), update: jest.fn() } },
        { provide: PiDialogService, useValue: { open: jest.fn() } },
      ],
    }).compileComponents();

    const editFixture = TestBed.createComponent(TextBlockFormDialogComponent);
    editFixture.detectChanges();
    await editFixture.whenStable();
    editFixture.detectChanges();

    expect(getById).toHaveBeenCalledWith('leaf-1');
    expect(editFixture.componentInstance['rootId']()).toBe('root-1');
    expect(editFixture.componentInstance['form'].getRawValue().categoryId).toBe('leaf-1');
  });
});

/**
 * TZ-NX-TEXT-BLOCK-CATEGORY-INLINE-CREATE — «+» next to Категория/
 * Подкатегория, kit `app-pi-select-add-row` (not a bespoke flex + button),
 * nested-create via the standalone `TextBlockCategoryFormDialogComponent`
 * (same wiring pattern as `module-form-dialog.openCreateCategory`): no
 * detour through /registries/text-block-categories for the happy path.
 */
describe('TextBlockFormDialogComponent — inline category create (TZ-NX-TEXT-BLOCK-CATEGORY-INLINE-CREATE)', () => {
  let fixture: ComponentFixture<TextBlockFormDialogComponent>;
  let dialog: { open: jest.Mock };
  let listMock: jest.Mock;

  function configure(): void {
    dialog = { open: jest.fn() };
    listMock = jest.fn((params: TextBlockCategoriesListParams = {}) => {
      if (params.rootsOnly) return of({ ok: true, data: [{ _id: 'root-1', name: 'Реквизиты', slug: 'r', isActive: true, sortOrder: 0 }] });
      return of({ ok: true, data: [] });
    });
    TestBed.configureTestingModule({
      imports: [TextBlockFormDialogComponent],
      providers: [
        { provide: PI_DIALOG_DATA, useValue: { mode: 'create' } },
        { provide: PI_DIALOG_REF, useValue: { close: jest.fn() } as DialogRef<unknown> },
        { provide: PiTextBlockCategoriesService, useValue: { list: listMock } },
        { provide: PiTextBlocksService, useValue: { create: jest.fn(), update: jest.fn() } },
        { provide: PiDialogService, useValue: dialog },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(TextBlockFormDialogComponent);
    fixture.detectChanges();
  }

  it('shows the kit select-add-row «+» for both category and subcategory, sub disabled until a root is picked', async () => {
    configure();
    await fixture.whenStable();
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    const rootAdd = host.querySelector<HTMLButtonElement>('[data-test="text-root-category-add"]');
    const subAdd = host.querySelector<HTMLButtonElement>('[data-test="text-sub-category-add"]');
    expect(rootAdd).not.toBeNull();
    expect(subAdd).not.toBeNull();
    expect(rootAdd!.closest('app-pi-select-add-row')).not.toBeNull();
    expect(subAdd!.disabled).toBe(true);

    fixture.componentInstance['rootId'].set('root-1');
    fixture.detectChanges();
    expect(subAdd!.disabled).toBe(false);
  });

  it('creating a root category via the nested dialog appends it, selects it, and marks the form dirty', async () => {
    configure();
    await fixture.whenStable();
    fixture.detectChanges();

    const closedSignal = signal<{ _id: string; name: string; slug: string; isActive: boolean; sortOrder: number } | undefined>(undefined);
    const ref = { closed: closedSignal, close: (v: unknown) => closedSignal.set(v as never) } as unknown as DialogRef<unknown>;
    dialog.open.mockReturnValue(ref);

    fixture.componentInstance['openCreateRootCategory']();
    expect(dialog.open).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ data: { mode: 'create', parentId: null } }),
    );

    const created = { _id: 'root-2', name: 'Новая категория', slug: 'novaya', isActive: true, sortOrder: 0 };
    ref.close(created);
    TestBed.flushEffects();
    await fixture.whenStable();
    fixture.detectChanges();
    // setRootId defers via a real setTimeout (see the component's own doc
    // comment: a macrotask tick so the native <select>'s [value] binding
    // applies after the just-added <option> renders, not before it exists).
    await new Promise((resolve) => setTimeout(resolve));
    fixture.detectChanges();

    expect(fixture.componentInstance['roots']().some((r: { _id: string }) => r._id === 'root-2')).toBe(true);
    expect(fixture.componentInstance['rootId']()).toBe('root-2');
    expect(fixture.componentInstance['form'].dirty).toBe(true);
  });

  it('creating a subcategory via the nested dialog appends it and selects it as categoryId', async () => {
    configure();
    fixture.componentInstance['rootId'].set('root-1');
    fixture.detectChanges();
    await fixture.whenStable();

    const closedSignal = signal<{ _id: string; name: string; slug: string; isActive: boolean; sortOrder: number } | undefined>(undefined);
    const ref = { closed: closedSignal, close: (v: unknown) => closedSignal.set(v as never) } as unknown as DialogRef<unknown>;
    dialog.open.mockReturnValue(ref);

    fixture.componentInstance['openCreateSubCategory']();
    expect(dialog.open).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ data: { mode: 'create', parentId: 'root-1', parentName: 'Реквизиты' } }),
    );

    const created = { _id: 'leaf-9', name: 'Новый лист', slug: 'novyy-list', isActive: true, sortOrder: 0, parentId: 'root-1' };
    ref.close(created);
    TestBed.flushEffects();
    fixture.detectChanges();

    expect(fixture.componentInstance['subs']().some((s: { _id: string }) => s._id === 'leaf-9')).toBe(true);
    expect(fixture.componentInstance['form'].getRawValue().categoryId).toBe('leaf-9');
    expect(fixture.componentInstance['form'].dirty).toBe(true);
  });

  it('does nothing when the nested create dialog is cancelled (undefined)', async () => {
    configure();
    await fixture.whenStable();
    fixture.detectChanges();

    const closedSignal = signal<unknown>(undefined);
    const ref = { closed: closedSignal, close: (v: unknown) => closedSignal.set(v) } as unknown as DialogRef<unknown>;
    dialog.open.mockReturnValue(ref);

    const rootsBefore = fixture.componentInstance['roots']();
    fixture.componentInstance['openCreateRootCategory']();
    ref.close(undefined);
    TestBed.flushEffects();
    fixture.detectChanges();

    expect(fixture.componentInstance['roots']()).toBe(rootsBefore);
    expect(fixture.componentInstance['form'].dirty).toBe(false);
  });
});
