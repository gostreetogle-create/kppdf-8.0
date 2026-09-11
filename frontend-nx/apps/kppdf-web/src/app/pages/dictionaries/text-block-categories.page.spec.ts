import { ComponentFixture, TestBed } from '@angular/core/testing';
import { computed, signal } from '@angular/core';
import { of } from 'rxjs';
import { PiTextBlockCategoriesService, type TextBlockCategory } from '@kppdf/data-access';
import { PiDialogService, AlertDialogComponent, type DialogRef } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import type { SilentResult } from '@kppdf/util-http';
import { TextBlockCategoriesPage } from './text-block-categories.page';
import { TextBlockCategoryFormDialogComponent } from './text-block-category-form-dialog.component';

/** Canonical DialogRef mock (see pi-alert-dialog.component.spec.ts): `closed` stays undefined until close(v). */
function createMockRef<T>(): DialogRef<T> {
  const closedSig = signal<T | undefined>(undefined);
  const isClosed = signal(false);
  return {
    closed: computed(() => (isClosed() ? closedSig() : undefined)) as DialogRef<T>['closed'],
    close: (v?: T) => {
      if (isClosed()) return;
      closedSig.set(v);
      isClosed.set(true);
    },
  };
}

describe('TextBlockCategoriesPage — /dictionaries/text-block-categories (TZ-NX-TEXT-CAT-NX-CRUD)', () => {
  let fixture: ComponentFixture<TextBlockCategoriesPage>;
  let categoriesApi: { list: jest.Mock; remove: jest.Mock };
  let dialog: { open: jest.Mock };
  let toast: { success: jest.Mock; error: jest.Mock };

  const root = (overrides: Partial<TextBlockCategory> = {}): TextBlockCategory => ({
    _id: 'root-1',
    name: 'Реквизиты',
    slug: 'rekvizity',
    isActive: true,
    sortOrder: 0,
    ...overrides,
  });
  const sub = (overrides: Partial<TextBlockCategory> = {}): TextBlockCategory => ({
    _id: 'sub-1',
    name: 'Клиент',
    slug: 'klient',
    isActive: true,
    sortOrder: 0,
    parentId: 'root-1',
    ...overrides,
  });

  async function setup(roots: readonly TextBlockCategory[] = [], subs: readonly TextBlockCategory[] = []): Promise<void> {
    categoriesApi = {
      list: jest.fn((params: { rootsOnly?: boolean; parentId?: string } = {}) => {
        if (params.rootsOnly) return of({ ok: true, data: roots } satisfies SilentResult<TextBlockCategory[]>);
        if (params.parentId) return of({ ok: true, data: subs } satisfies SilentResult<TextBlockCategory[]>);
        return of({ ok: true, data: [] } satisfies SilentResult<TextBlockCategory[]>);
      }),
      remove: jest.fn().mockReturnValue(of({ ok: true, data: undefined } satisfies SilentResult<void>)),
    };
    dialog = { open: jest.fn() };
    toast = { success: jest.fn(), error: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [TextBlockCategoriesPage],
      providers: [
        { provide: PiTextBlockCategoriesService, useValue: categoriesApi },
        { provide: PiDialogService, useValue: dialog },
        { provide: PiToastService, useValue: toast },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TextBlockCategoriesPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('renders the roots list', async () => {
    await setup([root()]);

    expect(fixture.nativeElement.querySelector('[data-test="tbc-roots"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="tbc-root-root-1"]')).toBeTruthy();
    expect(categoriesApi.list).toHaveBeenCalledWith({ rootsOnly: true });
  });

  it('shows the empty state when there are no root categories', async () => {
    await setup([]);
    expect(fixture.nativeElement.querySelector('[data-test="tbc-roots-empty"]')).toBeTruthy();
  });

  it('does not offer "Создать подкатегорию" until a root is selected', async () => {
    await setup([root()]);
    expect(fixture.nativeElement.querySelector('[data-test="tbc-create-sub"]')).toBeNull();
  });

  it('selecting a root loads and shows its subcategories, and reveals "Создать подкатегорию"', async () => {
    await setup([root()], [sub()]);

    (fixture.nativeElement.querySelector('[data-test="tbc-root-root-1"]') as HTMLElement).click();
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(categoriesApi.list).toHaveBeenCalledWith({ parentId: 'root-1' });
    expect(fixture.nativeElement.querySelector('[data-test="tbc-sub-sub-1"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="tbc-create-sub"]')).toBeTruthy();
  });

  it('"Создать подкатегорию" opens the form dialog with the selected root as parentId (never offered for a subcategory itself)', async () => {
    await setup([root()], [sub()]);
    (fixture.nativeElement.querySelector('[data-test="tbc-root-root-1"]') as HTMLElement).click();
    await fixture.whenStable();
    fixture.detectChanges();
    dialog.open.mockReturnValue(createMockRef<TextBlockCategory | undefined>());

    (fixture.nativeElement.querySelector('[data-test="tbc-create-sub"]') as HTMLElement).click();

    expect(dialog.open).toHaveBeenCalledWith(
      TextBlockCategoryFormDialogComponent,
      expect.objectContaining({
        data: expect.objectContaining({ mode: 'create', parentId: 'root-1', parentName: 'Реквизиты' }),
      }),
    );
    // The subcategory row itself never renders a "create sub" affordance —
    // depth > 1 is structurally impossible from this UI, not just BE-guarded.
    const subRow = fixture.nativeElement.querySelector('[data-test="tbc-sub-sub-1"]');
    expect(subRow.querySelector('[data-test="tbc-create-sub"]')).toBeNull();
  });

  it('deletes a category only after destructive confirm, then reloads', async () => {
    await setup([root()]);
    const ref = createMockRef<boolean>();
    dialog.open.mockImplementation((component: unknown) => {
      expect(component).toBe(AlertDialogComponent);
      return ref;
    });

    (fixture.nativeElement.querySelector('[data-test="tbc-delete-root-1"]') as HTMLElement).click();
    expect(categoriesApi.remove).not.toHaveBeenCalled();

    ref.close(true);
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(categoriesApi.remove).toHaveBeenCalledWith('root-1');
    expect(categoriesApi.list).toHaveBeenCalledWith({ rootsOnly: true });
  });

  it('toasts the BE 409 message (e.g. "has subcategories") instead of removing when delete fails', async () => {
    await setup([root()]);
    categoriesApi.remove.mockReturnValue(of({ ok: false, error: { status: 409, error: { message: 'есть подкатегории' } } }));
    const ref = createMockRef<boolean>();
    dialog.open.mockReturnValue(ref);

    (fixture.nativeElement.querySelector('[data-test="tbc-delete-root-1"]') as HTMLElement).click();
    ref.close(true);
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(toast.error).toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('a system root has no edit/delete affordances', async () => {
    await setup([root({ isSystem: true })]);
    expect(fixture.nativeElement.querySelector('[data-test="tbc-delete-root-1"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="tbc-edit-root-1"]')).toBeNull();
  });
});
