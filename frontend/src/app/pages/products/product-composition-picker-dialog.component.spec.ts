import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProductCompositionPickerDialogComponent } from './product-composition-picker-dialog.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import type { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { ProductModulesService } from '../../shared/services/pi-product-modules.service';
import { MaterialsService } from '../../shared/services/materials.service';
import { ProductsService } from '../../shared/services/products.service';

describe('ProductCompositionPickerDialogComponent (TZ-CATALOG-320 / TZ-COST-305)', () => {
  let fixture: ComponentFixture<ProductCompositionPickerDialogComponent>;
  let close: jest.Mock;

  function ref<T>(): DialogRef<T> {
    return {
      closed: signal<T | undefined>(undefined),
      close: (value?: T) => close(value),
    } as DialogRef<T>;
  }

  beforeEach(async () => {
    close = jest.fn();
    await TestBed.configureTestingModule({
      imports: [ProductCompositionPickerDialogComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: PI_DIALOG_DATA, useValue: { productId: 'p1' } },
        { provide: PI_DIALOG_REF, useValue: ref() },
        {
          provide: ProductModulesService,
          useValue: {
            list: jest.fn().mockReturnValue(
              of({
                ok: true,
                data: [{ _id: 'm1', name: 'Модуль', materials: [], workTypes: [] }],
              }),
            ),
          },
        },
        {
          provide: MaterialsService,
          useValue: {
            list: jest.fn().mockReturnValue(
              of({
                ok: true,
                data: {
                  items: [
                    { _id: 'raw', name: 'Сталь листовая', unit: 'кг', materialKind: 'raw' },
                    { _id: 'part', name: 'Кронштейн', unit: 'шт', materialKind: 'part' },
                  ],
                },
              }),
            ),
          },
        },
        {
          provide: ProductsService,
          useValue: {
            list: jest.fn().mockReturnValue(
              of({
                ok: true,
                data: {
                  items: [
                    { _id: 'p1', name: 'Текущий', kind: 'good', unit: 'шт' },
                    {
                      _id: 'p2',
                      name: 'Дочернее изделие',
                      kind: 'good',
                      unit: 'шт',
                      costPrice: 800,
                      listPrice: 1200,
                    },
                    {
                      _id: 'p3',
                      name: 'Только прайс',
                      kind: 'good',
                      unit: 'шт',
                      listPrice: 500,
                    },
                  ],
                },
              }),
            ),
          },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ProductCompositionPickerDialogComponent);
    fixture.detectChanges();
  });

  function instance(): {
    available: () => unknown[];
    activeKind: () => string;
    selectedId: { (): string; set: (v: string) => void };
    unitPriceOverride: { (): string; set: (v: string) => void };
    sessionAdded: () => { label: string; kind: string }[];
    adding: () => boolean;
    onSelectItem: (id: string) => void;
    selectKind: (kind: unknown) => void;
    onSubmit: () => void;
    onCancel: () => void;
  } {
    return fixture.componentInstance as unknown as {
      available: () => unknown[];
      activeKind: () => string;
      selectedId: { (): string; set: (v: string) => void };
      unitPriceOverride: { (): string; set: (v: string) => void };
      sessionAdded: () => { label: string; kind: string }[];
      adding: () => boolean;
      onSelectItem: (id: string) => void;
      selectKind: (kind: unknown) => void;
      onSubmit: () => void;
      onCancel: () => void;
    };
  }

  it('excludes the current product and raw materials', () => {
    const component = instance();
    expect(component.activeKind()).toBe('product');
    expect(component.available()).toEqual([
      { id: 'p2', label: 'Дочернее изделие · без SKU' },
      { id: 'p3', label: 'Только прайс · без SKU' },
    ]);
    component.selectKind('module' as never);
    expect(component.available()).toEqual([{ id: 'm1', label: 'Модуль · без артикула' }]);
    component.selectKind('material' as never);
    expect(component.available()).toEqual([{ id: 'part', label: 'Кронштейн · деталь' }]);
  });

  it('shows tabs in order: изделие → модуль → деталь', () => {
    const el = fixture.nativeElement as HTMLElement;
    const tabs = Array.from(el.querySelectorAll('[role="tab"]')).map((t) =>
      (t.textContent ?? '').trim(),
    );
    expect(tabs).toEqual(['Изделие', 'Модуль', 'Деталь']);
  });

  it('uses overflow-select for catalog pick', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="composition-picker-select"]')).toBeTruthy();
    expect(el.querySelector('[data-test="pi-overflow-select-trigger"]')).toBeTruthy();
  });

  it('labels price field as Цена в составе', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Цена в составе, ₽');
    expect(el.textContent).toContain('Карточку ребёнка не меняет');
  });

  it('prefills costPrice then listPrice on product select (D3)', () => {
    const component = instance();
    component.selectKind('product' as never);
    component.onSelectItem('p2');
    expect(component.unitPriceOverride()).toBe('800');
    component.onSelectItem('p3');
    expect(component.unitPriceOverride()).toBe('500');
  });

  it('submits product line with a non-negative unit price override', () => {
    const component = instance();
    component.selectKind('product' as never);
    component.selectedId.set('p2');
    component.unitPriceOverride.set('1250');
    component.onSubmit();
    expect(close).toHaveBeenCalledWith(
      expect.objectContaining({ lineType: 'product', refId: 'p2', unitPriceOverride: 1250 }),
    );
  });

  it('rejects a negative unit price override', () => {
    const component = instance();
    component.selectKind('product' as never);
    component.selectedId.set('p2');
    component.unitPriceOverride.set('-1');
    component.onSubmit();
    expect(close).not.toHaveBeenCalled();
  });

  it('add-and-continue: onAdded twice keeps dialog open and fills session list (TZ-UX-DIALOG-303)', async () => {
    const onAdded = jest.fn().mockResolvedValue(undefined);
    TestBed.resetTestingModule();
    close = jest.fn();
    await TestBed.configureTestingModule({
      imports: [ProductCompositionPickerDialogComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: PI_DIALOG_DATA, useValue: { productId: 'p1', onAdded } },
        { provide: PI_DIALOG_REF, useValue: ref() },
        {
          provide: ProductModulesService,
          useValue: {
            list: jest.fn().mockReturnValue(
              of({
                ok: true,
                data: [
                  { _id: 'm1', name: 'Модуль A', materials: [], workTypes: [] },
                  { _id: 'm2', name: 'Модуль B', materials: [], workTypes: [] },
                ],
              }),
            ),
          },
        },
        {
          provide: MaterialsService,
          useValue: {
            list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [] } })),
          },
        },
        {
          provide: ProductsService,
          useValue: {
            list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [] } })),
          },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ProductCompositionPickerDialogComponent);
    fixture.detectChanges();

    const component = instance();

    component.selectKind('module' as never);
    component.selectedId.set('m1');
    component.onSubmit();
    await Promise.resolve();
    await Promise.resolve();
    fixture.detectChanges();

    expect(onAdded).toHaveBeenCalledTimes(1);
    expect(onAdded).toHaveBeenCalledWith(
      expect.objectContaining({ lineType: 'module', refId: 'm1' }),
    );
    expect(close).not.toHaveBeenCalled();
    expect(component.selectedId()).toBe('');
    expect(component.sessionAdded().map((s) => s.label)).toEqual(['Модуль A']);

    component.selectedId.set('m2');
    component.onSubmit();
    await Promise.resolve();
    await Promise.resolve();
    fixture.detectChanges();

    expect(onAdded).toHaveBeenCalledTimes(2);
    expect(close).not.toHaveBeenCalled();
    expect(component.sessionAdded().map((s) => s.label)).toEqual(['Модуль A', 'Модуль B']);
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[data-test="picker-session-added"]')
        ?.textContent,
    ).toContain('Модуль B');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Закрыть');

    component.onCancel();
    expect(close).toHaveBeenCalledWith({ done: true });
  });

  it('add-and-continue: clears price after product add so next pick is clean', async () => {
    const onAdded = jest.fn().mockResolvedValue(undefined);
    TestBed.resetTestingModule();
    close = jest.fn();
    await TestBed.configureTestingModule({
      imports: [ProductCompositionPickerDialogComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: PI_DIALOG_DATA, useValue: { productId: 'p1', onAdded } },
        { provide: PI_DIALOG_REF, useValue: ref() },
        {
          provide: ProductModulesService,
          useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) },
        },
        {
          provide: MaterialsService,
          useValue: {
            list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [] } })),
          },
        },
        {
          provide: ProductsService,
          useValue: {
            list: jest.fn().mockReturnValue(
              of({
                ok: true,
                data: {
                  items: [
                    {
                      _id: 'p2',
                      name: 'Дочернее изделие',
                      kind: 'good',
                      unit: 'шт',
                      costPrice: 800,
                      listPrice: 1200,
                    },
                  ],
                },
              }),
            ),
          },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ProductCompositionPickerDialogComponent);
    fixture.detectChanges();

    const component = instance();
    component.selectKind('product' as never);
    component.onSelectItem('p2');
    component.unitPriceOverride.set('1250');
    component.onSubmit();
    await Promise.resolve();
    await Promise.resolve();

    expect(onAdded).toHaveBeenCalledWith(
      expect.objectContaining({ lineType: 'product', refId: 'p2', unitPriceOverride: 1250 }),
    );
    expect(close).not.toHaveBeenCalled();
    expect(component.selectedId()).toBe('');
    expect(component.unitPriceOverride()).toBe('');
  });
});
