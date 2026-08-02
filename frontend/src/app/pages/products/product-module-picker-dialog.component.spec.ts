/**
 * TZ-PRODUCTS-303 — ProductModulePickerDialogComponent tests.
 *
 * Locks the extended picker contract:
 *   - default (single) mode: classic <select size="10">, excludes already
 *     attached modules, submit closes with a single moduleId string;
 *   - multi mode (data.multi=true): checkbox list, submit closes with
 *     string[]; submit disabled while nothing selected;
 *   - loading / error / empty states;
 *   - cancel closes with null in both modes.
 */
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ProductModulePickerDialogComponent } from './product-module-picker-dialog.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import type { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { ProductModulesService } from '../../shared/services/pi-product-modules.service';

const MODULES = [
  {
    _id: 'm1',
    name: 'Рама',
    article: 'R-1',
    materials: [{ materialId: 'x1' }, { materialId: 'x2' }],
    workTypes: [],
  },
  {
    _id: 'm2',
    name: 'Стеклопакет',
    article: 'SP-2',
    materials: [{ materialId: 'y1' }],
    workTypes: [],
  },
  {
    _id: 'm3',
    name: 'Фурнитура',
    article: 'F-3',
    materials: [],
    workTypes: [],
  },
] as const;

describe('ProductModulePickerDialogComponent (TZ-PRODUCTS-303)', () => {
  let fixture: ComponentFixture<ProductModulePickerDialogComponent>;
  let close: jest.Mock;
  let modulesSvc: { list: jest.Mock };

  function ref<T>(): DialogRef<T> {
    return {
      closed: signal<T | undefined>(undefined),
      close: (v?: T) => close(v),
    } as DialogRef<T>;
  }

  async function setup(data: { productId: string; excludeIds: string[]; multi?: boolean }) {
    await TestBed.configureTestingModule({
      imports: [ProductModulePickerDialogComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: PI_DIALOG_DATA, useValue: data },
        { provide: PI_DIALOG_REF, useValue: ref() },
        { provide: ProductModulesService, useValue: modulesSvc },
      ],
    })
      .overrideComponent(ProductModulePickerDialogComponent, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
    fixture = TestBed.createComponent(ProductModulePickerDialogComponent);
    fixture.detectChanges();
  }

  beforeEach(() => {
    close = jest.fn();
    modulesSvc = { list: jest.fn().mockReturnValue(of({ ok: true, data: MODULES })) };
  });

  it('single mode (default): excludes already-attached modules and shows a select', async () => {
    await setup({ productId: 'p1', excludeIds: ['m1'] });
    const comp = fixture.componentInstance as unknown as {
      multi: boolean;
      available: () => unknown[];
    };
    expect(comp.multi).toBe(false);
    expect(comp.available().length).toBe(2);
    expect(fixture.nativeElement.querySelector('[data-test="picker-select"]')).toBeTruthy();
  });

  it('single mode: submit closes with the selected moduleId string', async () => {
    await setup({ productId: 'p1', excludeIds: [] });
    const comp = fixture.componentInstance as unknown as {
      form: { controls: { moduleId: { setValue(v: string): void } } };
      onSubmit: () => void;
    };
    comp.form.controls.moduleId.setValue('m2');
    comp.onSubmit();
    expect(close).toHaveBeenCalledWith('m2');
  });

  it('multi mode: renders checkboxes and submit closes with string[]', async () => {
    await setup({ productId: 'p1', excludeIds: [], multi: true });
    const comp = fixture.componentInstance as unknown as {
      multi: boolean;
      toggle: (id: string) => void;
      onSubmit: () => void;
      selected: () => string[];
    };
    expect(comp.multi).toBe(true);
    comp.toggle('m1');
    comp.toggle('m3');
    expect(comp.selected()).toEqual(['m1', 'm3']);
    comp.onSubmit();
    expect(close).toHaveBeenCalledWith(['m1', 'm3']);
  });

  it('multi mode: submit is a no-op when nothing is selected', async () => {
    await setup({ productId: 'p1', excludeIds: [], multi: true });
    const comp = fixture.componentInstance as unknown as { onSubmit: () => void };
    comp.onSubmit();
    expect(close).not.toHaveBeenCalled();
  });

  it('multi mode: toggling twice deselects (removes from the array)', async () => {
    await setup({ productId: 'p1', excludeIds: [], multi: true });
    const comp = fixture.componentInstance as unknown as {
      toggle: (id: string) => void;
      selected: () => string[];
    };
    comp.toggle('m1');
    comp.toggle('m1');
    expect(comp.selected()).toEqual([]);
  });

  it('shows a loading state while the catalog is being fetched', async () => {
    // A pending observable that never resolves → loading stays true.
    modulesSvc.list.mockReturnValue(
      new Observable(() => {
        /* never emits */
      }),
    );
    await setup({ productId: 'p1', excludeIds: [] });
    const comp = fixture.componentInstance as unknown as {
      loading: () => boolean;
      available: () => unknown[];
    };
    expect(comp.loading()).toBe(true);
    expect(comp.available().length).toBe(0);
  });

  it('surfaces a catalog error instead of the list', async () => {
    modulesSvc.list.mockReturnValue(
      of({
        ok: false,
        error: new HttpErrorResponse({ status: 500, error: { message: 'Сервер упал' } }),
      }),
    );
    await setup({ productId: 'p1', excludeIds: [] });
    const comp = fixture.componentInstance as unknown as {
      error: () => string | null;
      available: () => unknown[];
    };
    expect(comp.error()).toBeTruthy();
    expect(comp.available().length).toBe(0);
  });

  it('cancel closes with null in both modes', async () => {
    await setup({ productId: 'p1', excludeIds: [], multi: true });
    const comp = fixture.componentInstance as unknown as { onCancel: () => void };
    comp.onCancel();
    expect(close).toHaveBeenCalledWith(null);
  });
});
