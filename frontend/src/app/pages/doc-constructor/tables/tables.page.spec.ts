import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { of } from 'rxjs';

import { TablesPage } from './tables.page';
import {
  TableTemplatesService,
  type TableTemplate,
} from '../../../shared/services/pi-table-templates.service';
import { PiToastService } from '../../../shared/ui/toast';
import { PiDialogService } from '../../../shared/ui/dialog/pi-dialog.service';

/**
 * TZ-232.F.5 — Post-migration spec for `TablesPage`.
 *
 * Test strategy: assert the PAGE's public API + service calls + dialog
 * orchestration. Wrapper internals (`listRef().rows()`, debounced search
 * pipeline, etc.) are intentionally NOT tested here — those are wrapper's
 * own concern, covered in pi-entity-list spec.
 *
 * **CRITICAL assertion pattern** (learned from v3 V8 crash):
 *  Calling `expect(config).toEqual(...)` where `config` is the second arg
 *  passed to `dialog.open(cmp, { data, parentDestroyRef, width })` makes
 *  jest-matcher-utils deeply walk Angular's `DestroyRef` internals (which
 *  contain cyclic `LView` / node refs) → V8 `deepCyclicCopyObject`
 *  `Assertion failed: isolate_data` core dump.
 *
 *  CORRECT pattern: extract `[cmp, config]` from `mock.calls[0]`, assert
 *  `config.data` (POJO) directly, and ONLY check `parentDestroyRef` /
 *  `width` by `toBeDefined` / `toBe(...)` (no deep walk).
 *
 * `overrideComponent({ schemas: [NO_ERRORS_SCHEMA] })` is used because:
 *  - Standalone template has `<app-pi-entity-list>` / `<app-pi-row-actions>` /
 *    `<app-pi-switch>` which would otherwise trigger NG8001 parse errors.
 *  - Page methods that dereference `listRef()` use optional chaining `?.`,
 *    so the missing wrapper instance is a safe no-op (`undefined?.reload()`).
 */
describe('TablesPage (post-migration TZ-232.F.5)', () => {
  const dialogSpy = { open: jest.fn() };
  const toastSpy = {
    success: jest.fn(),
    error: jest.fn(),
  };

  const fakeTemplates: TableTemplate[] = [
    {
      _id: 'tt1',
      name: 'Спецификация товаров',
      category: 'product-spec',
      sortOrder: 0,
      columns: [{ key: 'name', label: 'Наименование', type: 'text', width: 200, align: 'left' }],
      isActive: true,
    } as TableTemplate,
    {
      _id: 'tt2',
      name: 'Калькуляция',
      category: 'cost-calc',
      sortOrder: 1,
      columns: [{ key: 'item', label: 'Статья', type: 'text', width: 200, align: 'left' }],
      isActive: false,
    } as TableTemplate,
  ];

  const listMock = jest.fn().mockReturnValue(
    of({ ok: true as const, data: { items: fakeTemplates, total: fakeTemplates.length } }),
  );
  const updateMock = jest.fn().mockReturnValue(of({ ok: true as const, data: fakeTemplates[0] }));
  const removeMock = jest.fn().mockReturnValue(of({ ok: true as const, data: undefined }));
  const createMock = jest.fn().mockReturnValue(of({ ok: true as const, data: { _id: 'tt3' } }));
  const findByIdMock = jest
    .fn()
    .mockReturnValue(of({ ok: true as const, data: fakeTemplates[0] }));

  /** Dialog ref whose `closed` signal stays `undefined` → callback never fires. */
  function inertDialogRef(): { closed: ReturnType<typeof signal<undefined>> } {
    return { closed: signal<undefined>(undefined) };
  }

  beforeEach(async () => {
    dialogSpy.open.mockReset();
    toastSpy.success.mockClear();
    toastSpy.error.mockClear();
    listMock.mockClear();
    updateMock.mockClear();
    removeMock.mockClear();
    createMock.mockClear();
    findByIdMock.mockClear();

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: TableTemplatesService,
          useValue: {
            list: listMock,
            findById: findByIdMock,
            create: createMock,
            update: updateMock,
            remove: removeMock,
          },
        },
        { provide: PiToastService, useValue: toastSpy },
        { provide: PiDialogService, useValue: dialogSpy },
      ],
    })
      .overrideComponent(TablesPage, { set: { imports: [], schemas: [NO_ERRORS_SCHEMA] } })
      .compileComponents();
  });

  /**
   * Helper: safely extract `data` / `width` from the dialog.open config.
   * NEVER touch `parentDestroyRef` deeply (triggers V8 circular walk).
   */
  function getDialogConfig<T = unknown>(): {
    component: unknown;
    data: T;
    width: string | undefined;
  } {
    expect(dialogSpy.open).toHaveBeenCalled();
    const [component, config] = dialogSpy.open.mock.calls[0]! as [
      unknown,
      { data: T; parentDestroyRef: unknown; width: string | undefined },
    ];
    return { component, data: config.data, width: config.width };
  }

  it('creates successfully', () => {
    const fixture = TestBed.createComponent(TablesPage);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('categoryLabel maps backend keys to Russian labels', () => {
    const fixture = TestBed.createComponent(TablesPage);
    const comp = fixture.componentInstance as unknown as {
      categoryLabel: (c: string | undefined) => string;
    };
    expect(comp.categoryLabel('product-spec')).toBe('Спецификация');
    expect(comp.categoryLabel('cost-calc')).toBe('Калькуляция');
    expect(comp.categoryLabel('order-summary')).toBe('Сводка заказа');
    expect(comp.categoryLabel('price-list')).toBe('Прайс-лист');
    expect(comp.categoryLabel('custom')).toBe('Прочее');
    expect(comp.categoryLabel(undefined)).toBe('—');
  });

  it('openCreate → dialog.open with data={mode: "new"}', () => {
    const fixture = TestBed.createComponent(TablesPage);
    dialogSpy.open.mockReturnValue(inertDialogRef());
    (fixture.componentInstance as unknown as { openCreate: () => void }).openCreate();

    const { data } = getDialogConfig<{ mode: string }>();
    expect(data.mode).toBe('new');
  });

  it('openFromRegistry → dialog.open with data={mode: "from-registry"}', () => {
    const fixture = TestBed.createComponent(TablesPage);
    dialogSpy.open.mockReturnValue(inertDialogRef());
    (fixture.componentInstance as unknown as { openFromRegistry: () => void }).openFromRegistry();

    const { data } = getDialogConfig<{ mode: string }>();
    expect(data.mode).toBe('from-registry');
  });

  it('openEdit → dialog.open with data={template}', () => {
    const fixture = TestBed.createComponent(TablesPage);
    dialogSpy.open.mockReturnValue(inertDialogRef());
    (fixture.componentInstance as unknown as { openEdit: (t: TableTemplate) => void }).openEdit(
      fakeTemplates[0],
    );

    const { data } = getDialogConfig<{ template: TableTemplate }>();
    expect(data.template).toBe(fakeTemplates[0]);
  });

  it('onCopy → dialog.open with data={template, mode: "duplicate"}', () => {
    const fixture = TestBed.createComponent(TablesPage);
    dialogSpy.open.mockReturnValue(inertDialogRef());
    (fixture.componentInstance as unknown as { onCopy: (t: TableTemplate) => void }).onCopy(
      fakeTemplates[0],
    );

    const { data } = getDialogConfig<{ template: TableTemplate; mode: string }>();
    expect(data.template).toBe(fakeTemplates[0]);
    expect(data.mode).toBe('duplicate');
  });

  it('onDelete → dialog.open with destructive variant + correct confirmLabel', () => {
    const fixture = TestBed.createComponent(TablesPage);
    dialogSpy.open.mockReturnValue(inertDialogRef());
    (fixture.componentInstance as unknown as { onDelete: (t: TableTemplate) => void }).onDelete(
      fakeTemplates[0],
    );

    const { data, width } = getDialogConfig<{
      title: string;
      description: string;
      confirmLabel: string;
      variant: string;
    }>();
    expect(data.variant).toBe('destructive');
    expect(data.confirmLabel).toBe('Удалить');
    expect(data.title).toContain('Удалить шаблон таблицы');
    expect(data.description).toContain('Спецификация товаров');
    expect(width).toBe('sm');
  });

  it('onToggleActive (false → deactivation) → service.update + toast.success', async () => {
    const fixture = TestBed.createComponent(TablesPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      onToggleActive: (t: TableTemplate, checked: boolean) => void;
    };

    comp.onToggleActive(fakeTemplates[0], false);
    await new Promise<void>((r) => setTimeout(r, 0));

    expect(updateMock).toHaveBeenCalledWith('tt1', { isActive: false });
    expect(toastSpy.success).toHaveBeenCalledWith('«Спецификация товаров» деактивирован');
  });

  it('onToggleActive (true → activation) → toast.success with correct label', async () => {
    const fixture = TestBed.createComponent(TablesPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      onToggleActive: (t: TableTemplate, checked: boolean) => void;
    };

    comp.onToggleActive(fakeTemplates[1], true);
    await new Promise<void>((r) => setTimeout(r, 0));

    expect(updateMock).toHaveBeenCalledWith('tt2', { isActive: true });
    expect(toastSpy.success).toHaveBeenCalledWith('«Калькуляция» активирован');
  });
});
