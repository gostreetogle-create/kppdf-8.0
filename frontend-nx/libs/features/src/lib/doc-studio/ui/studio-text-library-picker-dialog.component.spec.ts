import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PiTextBlockCategoriesService, PiTextBlocksService, type TextBlockCategoriesListParams } from '@kppdf/data-access';
import { PI_DIALOG_REF, type DialogRef } from '@kppdf/ui/dialog';
import { StudioTextLibraryPickerDialogComponent } from './studio-text-library-picker-dialog.component';

/**
 * TZ-NX-DOCSTUDIO-TEXT-LIBRARY-INSERT-ON-ADD — «+ Текст»'s picker. Mirrors
 * the category -> subcategory -> list contract `studio-text-properties`'s
 * own «Из библиотеки» filter already uses (same services, same params).
 */
describe('StudioTextLibraryPickerDialogComponent', () => {
  let fixture: ComponentFixture<StudioTextLibraryPickerDialogComponent>;
  let close: jest.Mock;
  const ROOT = { _id: 'root-1', name: 'Реквизиты', slug: 'r', isActive: true, sortOrder: 0 };
  const SUB = { _id: 'sub-1', name: 'Клиент', slug: 'k', isActive: true, sortOrder: 0, parentId: 'root-1' };
  const TEXT_A = { _id: 'tb-a', name: 'Приветствие', slug: 'privet', tags: [], content: '<p>Здравствуйте</p>', sortOrder: 0 };
  const TEXT_B = { _id: 'tb-b', name: 'Подпись', slug: 'podpis', tags: [], content: '<p>С уважением</p>', sortOrder: 1 };

  function configure(): { list: jest.Mock; getSubs: jest.Mock } {
    close = jest.fn();
    const list = jest.fn((params: TextBlockCategoriesListParams = {}) => {
      if (params.rootsOnly) return of({ ok: true, data: [ROOT] });
      if (params.parentId === 'root-1') return of({ ok: true, data: [SUB] });
      return of({ ok: true, data: [] });
    });
    const textBlocksList = jest.fn((params: { categoryId?: string } = {}) => {
      if (params.categoryId === 'sub-1') return of({ ok: true, data: [TEXT_A] });
      return of({ ok: true, data: [TEXT_A, TEXT_B] });
    });
    TestBed.configureTestingModule({
      imports: [StudioTextLibraryPickerDialogComponent],
      providers: [
        { provide: PI_DIALOG_REF, useValue: { close } as unknown as DialogRef<unknown> },
        { provide: PiTextBlockCategoriesService, useValue: { list } },
        { provide: PiTextBlocksService, useValue: { list: textBlocksList } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(StudioTextLibraryPickerDialogComponent);
    fixture.detectChanges();
    return { list, getSubs: textBlocksList };
  }

  it('lists all active texts unfiltered by default', async () => {
    configure();
    await fixture.whenStable();
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('[data-test="studio-text-library-option-tb-a"]')).not.toBeNull();
    expect(host.querySelector('[data-test="studio-text-library-option-tb-b"]')).not.toBeNull();
  });

  it('picking «Пустой текст» closes with { kind: "empty" }', async () => {
    configure();
    await fixture.whenStable();
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('[data-test="studio-text-library-empty"]') as HTMLButtonElement).click();

    expect(close).toHaveBeenCalledWith({ kind: 'empty' });
  });

  it('picking a text option closes with { kind: "library", textBlock }', async () => {
    configure();
    await fixture.whenStable();
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('[data-test="studio-text-library-option-tb-a"]') as HTMLButtonElement).click();

    expect(close).toHaveBeenCalledWith({ kind: 'library', textBlock: TEXT_A });
  });

  it('narrows the list to the chosen subcategory', async () => {
    const { getSubs } = configure();
    await fixture.whenStable();
    fixture.detectChanges();

    fixture.componentInstance['onRootFilterChange']('root-1');
    await fixture.whenStable();
    fixture.detectChanges();
    fixture.componentInstance['onSubFilterChange']('sub-1');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(getSubs).toHaveBeenCalledWith(expect.objectContaining({ categoryId: 'sub-1' }));
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('[data-test="studio-text-library-option-tb-a"]')).not.toBeNull();
    expect(host.querySelector('[data-test="studio-text-library-option-tb-b"]')).toBeNull();
  });

  it('shows an empty-state hint when nothing matches the filter', async () => {
    const list = jest.fn(() => of({ ok: true, data: [] }));
    close = jest.fn();
    TestBed.configureTestingModule({
      imports: [StudioTextLibraryPickerDialogComponent],
      providers: [
        { provide: PI_DIALOG_REF, useValue: { close } as unknown as DialogRef<unknown> },
        { provide: PiTextBlockCategoriesService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiTextBlocksService, useValue: { list } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(StudioTextLibraryPickerDialogComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-test="studio-text-library-empty-hint"]')).not.toBeNull();
  });

  it('«Отмена» closes with undefined (no create, no side effect)', async () => {
    configure();
    await fixture.whenStable();
    fixture.detectChanges();

    const cancelBtn = Array.from(fixture.nativeElement.querySelectorAll('button')).find(
      (b) => (b as HTMLButtonElement).textContent?.trim() === 'Отмена',
    ) as HTMLButtonElement | undefined;
    expect(cancelBtn).toBeDefined();
    cancelBtn!.click();

    expect(close).toHaveBeenCalledWith(undefined);
  });
});
