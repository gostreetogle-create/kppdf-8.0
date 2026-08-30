import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PiTextBlockCategoriesService, PiTextBlocksService } from '@kppdf/data-access';
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

  it('includes the rich-text content in the create payload even though it is not a form control', async () => {
    fixture.componentInstance['form'].patchValue({ name: 'Заголовок', slug: 'zagolovok' });
    fixture.componentInstance['content'].set('<p>Живой текст</p>');
    await fixture.componentInstance['submit']();
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Заголовок', slug: 'zagolovok', content: '<p>Живой текст</p>' }),
    );
    expect(close).toHaveBeenCalled();
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
});
