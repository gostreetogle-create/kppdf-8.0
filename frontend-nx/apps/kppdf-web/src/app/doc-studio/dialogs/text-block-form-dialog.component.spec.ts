import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PiTextBlockCategoriesService, PiTextBlocksService, type TextBlockCategoriesListParams } from '@kppdf/data-access';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '@kppdf/ui/dialog';
import type { DialogRef } from '@kppdf/ui/dialog';
import { TextBlockFormDialogComponent } from './text-block-form-dialog.component';

describe('TextBlockFormDialogComponent (TZ-NX-REGISTRIES-BROWSER-MATRIX-2)', () => {
  // Live browser matrix found this dialog crashing on open: NG01203 "No
  // value accessor for form control name: 'content'". PiRichTextEditorComponent
  // exposes a signal model(), not ControlValueAccessor -- it cannot be a
  // formControlName. This spec locks the fix (content as a plain signal,
  // merged into the payload manually) so it can't regress silently again.
  let fixture: ComponentFixture<TextBlockFormDialogComponent>;
  const close = jest.fn();
  const create = jest.fn().mockReturnValue(
    of({ ok: true as const, data: { _id: 'tb-1', name: 'Test', slug: 'test', tags: [], content: '', sortOrder: 0 } }),
  );

  beforeEach(async () => {
    close.mockReset();
    create.mockClear();
    await TestBed.configureTestingModule({
      imports: [TextBlockFormDialogComponent],
      providers: [
        { provide: PI_DIALOG_DATA, useValue: { mode: 'create' } },
        { provide: PI_DIALOG_REF, useValue: { close } as DialogRef<unknown> },
        { provide: PiTextBlockCategoriesService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiTextBlocksService, useValue: { create, update: jest.fn() } },
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
