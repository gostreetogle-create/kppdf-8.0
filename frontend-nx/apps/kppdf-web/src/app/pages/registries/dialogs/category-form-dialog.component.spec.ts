import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Check, LucideAngularModule } from 'lucide-angular';
import type { Category } from '@kppdf/data-access';
import { PiCategoriesService } from '@kppdf/data-access';
import { PI_DIALOG_DATA, PI_DIALOG_REF, type DialogRef } from '@kppdf/ui/dialog';
import {
  CategoryFormDialogComponent,
  type CategoryFormDialogData,
  suggestSkuPrefix,
} from './category-form-dialog.component';

describe('suggestSkuPrefix', () => {
  it('transliterates Cyrillic names into an uppercase A-Z0-9- code', () => {
    expect(suggestSkuPrefix('Метизы')).toBe('METIZY');
    expect(suggestSkuPrefix('Крепёж и фурнитура')).toBe('KREPEZH-I-FURNITURA'.slice(0, 16));
  });

  it('falls back to a placeholder for an empty/unusable name', () => {
    expect(suggestSkuPrefix('')).toBe('CAT');
  });
});

describe('CategoryFormDialogComponent', () => {
  let fixture: ComponentFixture<CategoryFormDialogComponent>;
  let ref: { closed: () => unknown; close: jest.Mock };
  let createMock: jest.Mock;
  let updateMock: jest.Mock;

  const siblingMaterial: Category = {
    _id: 'm1', name: 'Металлы', slug: 'metally', type: 'material', skuPrefix: 'MTL', sortOrder: 0, isActive: true,
  };
  const siblingProduct: Category = {
    _id: 'p1', name: 'Мебель', slug: 'furniture', type: 'product', skuPrefix: 'FUR', sortOrder: 0, isActive: true,
  };

  async function setup(data: CategoryFormDialogData): Promise<void> {
    ref = { closed: () => undefined, close: jest.fn() };
    createMock = jest.fn().mockReturnValue(of({ ok: true, data: { ...siblingMaterial, _id: 'new-1' } }));
    updateMock = jest.fn().mockReturnValue(of({ ok: true, data: siblingMaterial }));

    await TestBed.configureTestingModule({
      imports: [CategoryFormDialogComponent],
      providers: [
        importProvidersFrom(LucideAngularModule.pick({ Check })),
        { provide: PI_DIALOG_DATA, useValue: data },
        { provide: PI_DIALOG_REF, useValue: ref as unknown as DialogRef<unknown> },
        { provide: PiCategoriesService, useValue: { create: createMock, update: updateMock } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(CategoryFormDialogComponent);
    fixture.detectChanges();
  }

  /**
   * `app-pi-input`'s own template never forwards `id`/`data-test` onto its
   * inner native `<input>` (verified by reading `input.component.ts` — it
   * binds none), so DOM-level querySelector+dispatch against those
   * attributes silently targets the outer custom-element tag and does
   * nothing. Mirrors `InputComponent.onInput()`'s own two effects instead:
   * write the control (what its CVA does) and fire the `(valueChange)`
   * handler (what this dialog listens to) — same substitute the gold
   * `supply-request-form-dialog.component.spec.ts` uses (calling
   * `onMaterialQuery` directly rather than simulating a DOM event).
   */
  function typeName(value: string): void {
    fixture.componentInstance['form'].controls.name.setValue(value);
    (fixture.componentInstance as unknown as { onNameChange(v: string): void }).onNameChange(value);
    fixture.detectChanges();
  }
  function typeSkuPrefix(value: string): void {
    fixture.componentInstance['form'].controls.skuPrefix.setValue(value);
    (fixture.componentInstance as unknown as { onSkuPrefixChange(v: string): void }).onSkuPrefixChange(value);
    fixture.detectChanges();
  }

  it('auto-suggests skuPrefix from the name until the operator edits it by hand', async () => {
    await setup({ mode: 'create', category: null, categories: [] });

    typeName('Метизы');
    expect(fixture.componentInstance['form'].controls.skuPrefix.value).toBe('METIZY');

    typeSkuPrefix('MTZ');
    typeName('Метизы и крепёж');
    expect(fixture.componentInstance['form'].controls.skuPrefix.value).toBe('MTZ');
  });

  it('filters the parent select to same-type siblings and resets parentId when type changes away from it', async () => {
    await setup({ mode: 'create', category: null, categories: [siblingMaterial, siblingProduct] });

    expect(fixture.componentInstance['parentOptions']()).toEqual([siblingMaterial]);

    const parentSelect = fixture.nativeElement.querySelector('[data-test="category-parent"]') as HTMLSelectElement;
    parentSelect.value = 'm1';
    parentSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const typeSelect = fixture.nativeElement.querySelector('[data-test="category-type"]') as HTMLSelectElement;
    typeSelect.value = 'product';
    typeSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(fixture.componentInstance['parentOptions']()).toEqual([siblingProduct]);
    expect(fixture.componentInstance['form'].controls.parentId.value).toBe('');
  });

  it('blocks submit while name/skuPrefix are empty', async () => {
    await setup({ mode: 'create', category: null, categories: [] });

    (fixture.nativeElement.querySelector('[data-test="category-save"]') as HTMLButtonElement).click();
    await fixture.whenStable();

    expect(createMock).not.toHaveBeenCalled();
  });

  it('creates with a lowercased slug derived from the (possibly edited) skuPrefix', async () => {
    await setup({ mode: 'create', category: null, categories: [] });

    typeName('Метизы');
    typeSkuPrefix('mtz-custom');

    (fixture.nativeElement.querySelector('[data-test="category-save"]') as HTMLButtonElement).click();
    await fixture.whenStable();

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Метизы', skuPrefix: 'MTZ-CUSTOM', slug: 'mtz-custom', type: 'material' }),
    );
    expect(ref.close).toHaveBeenCalled();
  });

  it('prefills every field in edit mode and does not regenerate skuPrefix as the name is tweaked', async () => {
    await setup({ mode: 'edit', category: siblingMaterial, categories: [siblingMaterial] });

    expect(fixture.componentInstance['form'].controls.skuPrefix.value).toBe('MTL');
    typeName('Металлы и сплавы');
    expect(fixture.componentInstance['form'].controls.skuPrefix.value).toBe('MTL');

    (fixture.nativeElement.querySelector('[data-test="category-save"]') as HTMLButtonElement).click();
    await fixture.whenStable();

    expect(updateMock).toHaveBeenCalledWith('m1', expect.objectContaining({ skuPrefix: 'MTL' }));
  });
});
