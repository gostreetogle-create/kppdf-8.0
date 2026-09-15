import { computed, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PiMaterialsService, PiModulesService, PiProductsService } from '@kppdf/data-access';
import { PiDialogService, type DialogRef } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import { StudioDataVitrinaComponent, type StudioShowcaseKind } from './studio-data-vitrina.component';

/**
 * TZ-NX-DOCSTUDIO-VITRINA-EDIT — the vitrina panel («Данные» → Товары) only
 * had Добавить/Убрать; changing a catalog entity's photo/name meant leaving
 * the studio for `/registries` (PO-CANON "одна страница — один контекст"
 * says that's wrong for a document-editing operator). «Изменить» reuses the
 * exact same dialogs `/registries` uses (`createCatalogRegistryDialogHost`,
 * `createMaterialRegistryDialogHost`) so there is no second form. On a
 * successful Save the dialog host's `ctx.reload()` re-fetches this kind's
 * list (card's name/SKU/photo refresh) and emits `catalogEntitySaved` so the
 * parent (`StudioEditorPage`) can heal the A4 sheet's table too.
 */
describe('StudioDataVitrinaComponent — «Изменить» (TZ-NX-DOCSTUDIO-VITRINA-EDIT)', () => {
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

  const PRODUCT = { _id: 'p1', name: 'Окно', sku: 'WIN-1' };
  const MODULE = { _id: 'm1', name: 'Модуль', article: 'M-1' };
  const PART = { _id: 'd1', name: 'Деталь', article: 'D-1', materialKind: 'part' };
  const MATERIAL = { _id: 'mat1', name: 'Материал', sku: 'MTL-1', materialKind: 'raw' };

  let productsApi: { list: jest.Mock; getById: jest.Mock };
  let modulesApi: { list: jest.Mock; getById: jest.Mock };
  let materialsApi: { list: jest.Mock; getById: jest.Mock };
  let dialogOpen: jest.Mock;
  let toast: { success: jest.Mock; error: jest.Mock };
  let fixture: ComponentFixture<StudioDataVitrinaComponent>;

  beforeEach(async () => {
    productsApi = {
      list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [PRODUCT] } })),
      getById: jest.fn().mockReturnValue(of({ ok: true, data: PRODUCT })),
    };
    modulesApi = {
      list: jest.fn().mockReturnValue(of({ ok: true, data: [MODULE] })),
      getById: jest.fn().mockReturnValue(of({ ok: true, data: MODULE })),
    };
    materialsApi = {
      list: jest.fn().mockImplementation(({ materialKind }: { materialKind?: string } = {}) =>
        of({ ok: true, data: { items: materialKind === 'part' ? [PART] : [PART, MATERIAL] } }),
      ),
      getById: jest.fn().mockImplementation((id: string) =>
        of({ ok: true, data: id === PART._id ? PART : MATERIAL }),
      ),
    };
    dialogOpen = jest.fn();
    toast = { success: jest.fn(), error: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [StudioDataVitrinaComponent],
      providers: [
        { provide: PiProductsService, useValue: productsApi },
        { provide: PiModulesService, useValue: modulesApi },
        { provide: PiMaterialsService, useValue: materialsApi },
        { provide: PiDialogService, useValue: { open: dialogOpen } },
        { provide: PiToastService, useValue: toast },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StudioDataVitrinaComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  function editButtons(): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('[data-test="studio-data-vitrina-edit"]'));
  }

  it('renders «Изменить» on every kind tab, between the title and Добавить/Убрать', () => {
    const kinds: StudioShowcaseKind[] = ['products', 'modules', 'parts', 'materials'];
    for (const kind of kinds) {
      fixture.componentInstance.activeKind.set(kind);
      fixture.detectChanges();
      const buttons = editButtons();
      expect(buttons.length).toBeGreaterThan(0);
      // Sits before Добавить/Убрать in the same actions row.
      const actionsRow = buttons[0].closest('.vitrina-actions')!;
      const labels = Array.from(actionsRow.querySelectorAll('button')).map((b) => b.textContent?.trim());
      expect(labels[0]).toBe('Изменить');
    }
  });

  it('products: opens the ProductFormDialog in edit mode; Save refreshes the list and emits catalogEntitySaved', async () => {
    const ref = createMockRef<typeof PRODUCT | null | undefined>();
    dialogOpen.mockReturnValue(ref);
    const savedSpy = jest.fn();
    fixture.componentInstance.catalogEntitySaved.subscribe(savedSpy);

    fixture.componentInstance.edit('p1');
    await Promise.resolve();
    await Promise.resolve();

    expect(productsApi.getById).toHaveBeenCalledWith('p1');
    expect(dialogOpen).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ data: expect.objectContaining({ mode: 'edit', product: PRODUCT }) }),
    );

    const updated = { ...PRODUCT, name: 'Окно (обновлено)' };
    ref.close(updated);
    TestBed.flushEffects();
    await Promise.resolve();
    await Promise.resolve();

    expect(toast.success).toHaveBeenCalledWith('Изделие обновлено');
    expect(productsApi.list).toHaveBeenCalledTimes(2);
    expect(savedSpy).toHaveBeenCalledWith('products');
  });

  it('modules: opens the ModuleFormDialog in edit mode', async () => {
    fixture.componentInstance.activeKind.set('modules');
    fixture.detectChanges();
    dialogOpen.mockReturnValue(createMockRef());

    fixture.componentInstance.edit('m1');
    await Promise.resolve();
    await Promise.resolve();

    expect(modulesApi.getById).toHaveBeenCalledWith('m1');
    expect(dialogOpen).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ data: expect.objectContaining({ mode: 'edit', module: MODULE }) }),
    );
  });

  it('parts: opens the Material form dialog with the деталь config (no locked kind, kind select allowed)', async () => {
    fixture.componentInstance.activeKind.set('parts');
    fixture.detectChanges();
    dialogOpen.mockReturnValue(createMockRef());

    fixture.componentInstance.edit('d1');
    await Promise.resolve();
    await Promise.resolve();

    expect(materialsApi.getById).toHaveBeenCalledWith('d1');
    expect(dialogOpen).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        data: expect.objectContaining({ mode: 'edit', material: PART, entityLabel: 'деталь', allowKindSelect: true }),
      }),
    );
  });

  it('materials: opens the Material form dialog locked to raw kind', async () => {
    fixture.componentInstance.activeKind.set('materials');
    fixture.detectChanges();
    dialogOpen.mockReturnValue(createMockRef());

    fixture.componentInstance.edit('mat1');
    await Promise.resolve();
    await Promise.resolve();

    expect(materialsApi.getById).toHaveBeenCalledWith('mat1');
    expect(dialogOpen).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        data: expect.objectContaining({ mode: 'edit', material: MATERIAL, entityLabel: 'материал', lockMaterialKind: 'raw' }),
      }),
    );
  });

  it('dialog closed with no value (cancel): no toast, no refetch, no catalogEntitySaved', async () => {
    const ref = createMockRef<typeof PRODUCT | null | undefined>();
    dialogOpen.mockReturnValue(ref);
    const savedSpy = jest.fn();
    fixture.componentInstance.catalogEntitySaved.subscribe(savedSpy);

    fixture.componentInstance.edit('p1');
    await Promise.resolve();
    await Promise.resolve();

    ref.close(undefined);
    TestBed.flushEffects();
    await Promise.resolve();

    expect(toast.success).not.toHaveBeenCalled();
    expect(productsApi.list).toHaveBeenCalledTimes(1);
    expect(savedSpy).not.toHaveBeenCalled();
  });
});
