import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import {
  PiCategoriesService,
  PiCompositionService,
  PiModulesService,
  PiPhotosService,
  PiWorkTypesService,
  type ProductModule,
} from '@kppdf/data-access';
import { PI_DIALOG_DATA, PI_DIALOG_REF, PiDialogService } from '@kppdf/ui/dialog';
import type { DialogRef } from '@kppdf/ui/dialog';
import { ModuleFormDialogComponent } from './module-form-dialog.component';

// jsdom lacks Element.scrollIntoView; composition focus uses it via queueMicrotask.
Element.prototype.scrollIntoView = Element.prototype.scrollIntoView ?? jest.fn();

const PHOTOS_MOCK = {
  upload: jest.fn().mockReturnValue(of({ ok: true, data: { _id: 'mph-2', storageUrl: '/uploads/mph-2.jpg' } })),
  remove: jest.fn().mockReturnValue(of({ ok: true, data: null })),
  get: jest.fn(),
  updateFrame: jest.fn(),
};

/** TZ-NX-REG-CATEGORY-WIRE-MODULES — every dialog instance now loads categories on init. */
const CATEGORIES_MOCK = {
  list: jest.fn().mockReturnValue(
    of({ ok: true, data: [{ _id: 'cat-1', name: 'Модули', slug: 'modules', type: 'module', skuPrefix: 'MOD', sortOrder: 0, isActive: true }] }),
  ),
};

const SAMPLE: ProductModule = {
  _id: 'mod-1',
  name: 'Каркас',
  article: 'MOD-1',
  // TZ-NX-REG-CATEGORY-WIRE-MODULES: категория теперь обязательна — без неё
  // onSubmit() в тестах ниже был бы блокирован формой.
  categoryId: 'cat-1',
  workTypes: [
    {
      workTypeId: { _id: 'wt-1', name: 'Сварка', days: 2 },
      estimatedHours: 2.5,
      sortOrder: 1,
    },
  ],
};

const WORK_TYPES_MOCK = {
  list: jest.fn().mockReturnValue(
    of({
      ok: true,
      data: {
        items: [
          { _id: 'wt-1', name: 'Сварка', isActive: true, days: 2 },
          { _id: 'wt-2', name: 'Покраска', isActive: true, days: 1 },
        ],
        total: 2,
      },
    }),
  ),
};

describe('ModuleFormDialogComponent (Phase 2)', () => {
  let fixture: ComponentFixture<ModuleFormDialogComponent>;
  const close = jest.fn();

  beforeEach(async () => {
    close.mockReset();
    await TestBed.configureTestingModule({
      imports: [ModuleFormDialogComponent],
      providers: [
        {
          provide: PI_DIALOG_DATA,
          useValue: { mode: 'edit', module: SAMPLE } satisfies import('./module-form-dialog.component').ModuleFormDialogData,
        },
        { provide: PI_DIALOG_REF, useValue: { close } as DialogRef<unknown> },
        {
          provide: PiModulesService,
          useValue: {
            update: jest.fn().mockReturnValue(of({ ok: true, data: SAMPLE })),
            create: jest.fn(),
          },
        },
        { provide: PiWorkTypesService, useValue: WORK_TYPES_MOCK },
        { provide: PiPhotosService, useValue: PHOTOS_MOCK },
        {
          provide: PiDialogService,
          useValue: { open: jest.fn().mockReturnValue({ closed: () => undefined, close: jest.fn() }) },
        },
        {
          provide: PiCompositionService,
          useValue: {
            getModuleTree: jest.fn().mockReturnValue(of({ ok: true, data: { _id: 'mod-1', name: 'K', kind: 'module', quantity: 1, children: [] } })),
            getModuleComposition: jest.fn().mockReturnValue(of({ ok: true, data: [] })),
          },
        },
        { provide: PiCategoriesService, useValue: CATEGORIES_MOCK },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModuleFormDialogComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('opens edit dialog with passport and composition panel', () => {
    expect(fixture.nativeElement.querySelector('[data-test="module-form"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('pi-composition-panel')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Редактировать модуль');
  });

  it('shows composition block in edit mode', () => {
    expect(fixture.nativeElement.querySelector('[data-test="module-composition-block"]')).toBeTruthy();
  });

  it('hydrates populated work types and submits normalized planning rows', () => {
    const component = fixture.componentInstance as unknown as {
      workTypesArray: { length: number; at: (index: number) => { value: Record<string, unknown> } };
      onSubmit: () => Promise<void>;
    };
    expect(component.workTypesArray.length).toBe(1);
    expect(component.workTypesArray.at(0).value).toEqual({
      workTypeId: 'wt-1',
      estimatedHours: 2.5,
      sortOrder: 1,
      days: null,
    });
    expect(fixture.nativeElement.querySelector('[data-test="module-work-types"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="module-work-type-row-0"]')).toBeTruthy();

    void component.onSubmit();
    return fixture.whenStable().then(() => {
      const modulesService = TestBed.inject(PiModulesService) as unknown as { update: jest.Mock };
      expect(modulesService.update).toHaveBeenCalledWith(
        'mod-1',
        expect.objectContaining({
          workTypes: [{ workTypeId: 'wt-1', estimatedHours: 2.5, sortOrder: 1 }],
        }),
      );
    });
  });

  it('supports add, reorder, and remove while keeping composition separate', () => {
    const component = fixture.componentInstance as unknown as {
      addWorkType: () => void;
      moveWorkType: (index: number, direction: -1 | 1) => void;
      removeWorkType: (index: number) => void;
      workTypesArray: { length: number; at: (index: number) => { value: Record<string, unknown> } };
    };
    component.addWorkType();
    expect(component.workTypesArray.length).toBe(2);
    component.moveWorkType(1, -1);
    expect(component.workTypesArray.at(0).value.workTypeId).toBe('');
    component.removeWorkType(0);
    expect(component.workTypesArray.length).toBe(1);
    expect(fixture.nativeElement.querySelector('[data-test="module-composition-block"]')).toBeTruthy();
  });

  it('submits an explicit empty workTypes array', () => {
    const component = fixture.componentInstance as unknown as {
      workTypesArray: { clear: () => void };
      onSubmit: () => Promise<void>;
    };
    component.workTypesArray.clear();
    void component.onSubmit();
    return fixture.whenStable().then(() => {
      const modulesService = TestBed.inject(PiModulesService) as unknown as { update: jest.Mock };
      expect(modulesService.update).toHaveBeenCalledWith(
        'mod-1',
        expect.objectContaining({ workTypes: [] }),
      );
    });
  });

  it('closes on cancel when pristine', () => {
    fixture.componentInstance['onCancel']();
    expect(close).toHaveBeenCalled();
  });

  it('scrolls composition block into view when focusComposition is set', async () => {
    const scrollSpy = jest.spyOn(
      await import('../../composition/composition-focus-scroll'),
      'scrollCompositionBlockIntoView',
    );
    TestBed.resetTestingModule();
    close.mockReset();
    await TestBed.configureTestingModule({
      imports: [ModuleFormDialogComponent],
      providers: [
        {
          provide: PI_DIALOG_DATA,
          useValue: { mode: 'edit', module: SAMPLE, focusComposition: true } satisfies import('./module-form-dialog.component').ModuleFormDialogData,
        },
        { provide: PI_DIALOG_REF, useValue: { close } as DialogRef<unknown> },
        {
          provide: PiModulesService,
          useValue: {
            update: jest.fn().mockReturnValue(of({ ok: true, data: SAMPLE })),
            create: jest.fn(),
          },
        },
        { provide: PiWorkTypesService, useValue: WORK_TYPES_MOCK },
        { provide: PiPhotosService, useValue: PHOTOS_MOCK },
        {
          provide: PiDialogService,
          useValue: { open: jest.fn().mockReturnValue({ closed: () => undefined, close: jest.fn() }) },
        },
        {
          provide: PiCompositionService,
          useValue: {
            getModuleTree: jest.fn().mockReturnValue(of({ ok: true, data: { _id: 'mod-1', name: 'K', kind: 'module', quantity: 1, children: [] } })),
            getModuleComposition: jest.fn().mockReturnValue(of({ ok: true, data: [] })),
          },
        },
        { provide: PiCategoriesService, useValue: CATEGORIES_MOCK },
      ],
    }).compileComponents();

    const focusFixture = TestBed.createComponent(ModuleFormDialogComponent);
    focusFixture.detectChanges();
    await focusFixture.whenStable();
    expect(scrollSpy).toHaveBeenCalled();
    scrollSpy.mockRestore();
  });
});

describe('ModuleFormDialogComponent Work Types create mode', () => {
  it('submits one selected Work Type in the create payload', async () => {
    const create = jest.fn().mockReturnValue(
      of({ ok: true, data: { ...SAMPLE, _id: 'created-module' } }),
    );
    await TestBed.configureTestingModule({
      imports: [ModuleFormDialogComponent],
      providers: [
        { provide: PI_DIALOG_DATA, useValue: { mode: 'create' } },
        { provide: PI_DIALOG_REF, useValue: { close: jest.fn() } as DialogRef<unknown> },
        { provide: PiModulesService, useValue: { create, update: jest.fn() } },
        { provide: PiWorkTypesService, useValue: WORK_TYPES_MOCK },
        { provide: PiPhotosService, useValue: PHOTOS_MOCK },
        {
          provide: PiDialogService,
          useValue: { open: jest.fn().mockReturnValue({ closed: () => undefined, close: jest.fn() }) },
        },
        {
          provide: PiCompositionService,
          useValue: {
            getModuleTree: jest.fn().mockReturnValue(of({ ok: true, data: { _id: 'created-module', name: 'K', kind: 'module', quantity: 1, children: [] } })),
            getModuleComposition: jest.fn().mockReturnValue(of({ ok: true, data: [] })),
          },
        },
        { provide: PiCategoriesService, useValue: CATEGORIES_MOCK },
      ],
    }).compileComponents();

    const createFixture = TestBed.createComponent(ModuleFormDialogComponent);
    createFixture.detectChanges();
    await createFixture.whenStable();
    const component = createFixture.componentInstance as unknown as {
      form: {
        controls: {
          name: { setValue: (value: string) => void };
          article: { setValue: (value: string) => void };
          categoryId: { setValue: (value: string) => void };
          workTypes: { at: (index: number) => { patchValue: (value: Record<string, unknown>) => void } };
        };
      };
      addWorkType: () => void;
      onSubmit: () => Promise<void>;
    };
    component.form.controls.name.setValue('Новый модуль');
    component.form.controls.article.setValue('MOD-NEW');
    component.form.controls.categoryId.setValue('cat-1');
    component.addWorkType();
    component.form.controls.workTypes.at(0).patchValue({
      workTypeId: 'wt-1',
      estimatedHours: 3,
      sortOrder: 0,
    });

    await component.onSubmit();

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Новый модуль',
        article: 'MOD-NEW',
        workTypes: [{ workTypeId: 'wt-1', estimatedHours: 3, sortOrder: 0 }],
      }),
    );
    TestBed.resetTestingModule();
  });

  it('seeds an empty days field from the WorkType catalog default on selection (TZ-NX-MODULE-WT-DAYS-SOT)', async () => {
    const create = jest.fn().mockReturnValue(of({ ok: true, data: { ...SAMPLE, _id: 'created-module' } }));
    await TestBed.configureTestingModule({
      imports: [ModuleFormDialogComponent],
      providers: [
        { provide: PI_DIALOG_DATA, useValue: { mode: 'create' } },
        { provide: PI_DIALOG_REF, useValue: { close: jest.fn() } as DialogRef<unknown> },
        { provide: PiModulesService, useValue: { create, update: jest.fn() } },
        { provide: PiWorkTypesService, useValue: WORK_TYPES_MOCK },
        { provide: PiPhotosService, useValue: PHOTOS_MOCK },
        {
          provide: PiDialogService,
          useValue: { open: jest.fn().mockReturnValue({ closed: () => undefined, close: jest.fn() }) },
        },
        {
          provide: PiCompositionService,
          useValue: {
            getModuleTree: jest.fn().mockReturnValue(of({ ok: true, data: { _id: 'created-module', name: 'K', kind: 'module', quantity: 1, children: [] } })),
            getModuleComposition: jest.fn().mockReturnValue(of({ ok: true, data: [] })),
          },
        },
        { provide: PiCategoriesService, useValue: CATEGORIES_MOCK },
      ],
    }).compileComponents();

    const fixture2 = TestBed.createComponent(ModuleFormDialogComponent);
    fixture2.detectChanges();
    await fixture2.whenStable();
    const component = fixture2.componentInstance as unknown as {
      addWorkType: () => void;
      seedDaysFromCatalog: (index: number) => void;
      workTypesArray: { at: (index: number) => { patchValue: (v: Record<string, unknown>) => void; controls: { days: { value: number | null } } } };
    };
    component.addWorkType();
    component.workTypesArray.at(0).patchValue({ workTypeId: 'wt-2' });
    component.seedDaysFromCatalog(0);
    expect(component.workTypesArray.at(0).controls.days.value).toBe(1);
    TestBed.resetTestingModule();
  });

  it('does not overwrite an explicit days override when a different work type is selected (TZ-NX-MODULE-WT-DAYS-SOT)', async () => {
    const create = jest.fn().mockReturnValue(of({ ok: true, data: { ...SAMPLE, _id: 'created-module' } }));
    await TestBed.configureTestingModule({
      imports: [ModuleFormDialogComponent],
      providers: [
        { provide: PI_DIALOG_DATA, useValue: { mode: 'create' } },
        { provide: PI_DIALOG_REF, useValue: { close: jest.fn() } as DialogRef<unknown> },
        { provide: PiModulesService, useValue: { create, update: jest.fn() } },
        { provide: PiWorkTypesService, useValue: WORK_TYPES_MOCK },
        { provide: PiPhotosService, useValue: PHOTOS_MOCK },
        {
          provide: PiDialogService,
          useValue: { open: jest.fn().mockReturnValue({ closed: () => undefined, close: jest.fn() }) },
        },
        {
          provide: PiCompositionService,
          useValue: {
            getModuleTree: jest.fn().mockReturnValue(of({ ok: true, data: { _id: 'created-module', name: 'K', kind: 'module', quantity: 1, children: [] } })),
            getModuleComposition: jest.fn().mockReturnValue(of({ ok: true, data: [] })),
          },
        },
        { provide: PiCategoriesService, useValue: CATEGORIES_MOCK },
      ],
    }).compileComponents();

    const fixture2 = TestBed.createComponent(ModuleFormDialogComponent);
    fixture2.detectChanges();
    await fixture2.whenStable();
    const component = fixture2.componentInstance as unknown as {
      form: {
        controls: {
          name: { setValue: (v: string) => void };
          article: { setValue: (v: string) => void };
          categoryId: { setValue: (v: string) => void };
        };
      };
      addWorkType: () => void;
      seedDaysFromCatalog: (index: number) => void;
      onSubmit: () => Promise<void>;
      workTypesArray: { at: (index: number) => { patchValue: (v: Record<string, unknown>) => void } };
    };
    component.form.controls.name.setValue('Тяжёлый модуль');
    component.form.controls.article.setValue('MOD-HEAVY');
    component.form.controls.categoryId.setValue('cat-1');
    component.addWorkType();
    component.workTypesArray.at(0).patchValue({ workTypeId: 'wt-1', days: 4 });
    component.seedDaysFromCatalog(0);
    await component.onSubmit();
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ workTypes: [expect.objectContaining({ workTypeId: 'wt-1', days: 4 })] }),
    );
    TestBed.resetTestingModule();
  });
});

describe('ModuleFormDialogComponent — категория (TZ-NX-REG-CATEGORY-WIRE-MODULES)', () => {
  async function setup(data: Record<string, unknown>): Promise<ComponentFixture<ModuleFormDialogComponent>> {
    await TestBed.configureTestingModule({
      imports: [ModuleFormDialogComponent],
      providers: [
        { provide: PI_DIALOG_DATA, useValue: data },
        { provide: PI_DIALOG_REF, useValue: { close: jest.fn() } as DialogRef<unknown> },
        { provide: PiModulesService, useValue: { create: jest.fn().mockReturnValue(of({ ok: true, data: SAMPLE })), update: jest.fn() } },
        { provide: PiWorkTypesService, useValue: WORK_TYPES_MOCK },
        { provide: PiPhotosService, useValue: PHOTOS_MOCK },
        { provide: PiDialogService, useValue: { open: jest.fn().mockReturnValue({ closed: () => undefined, close: jest.fn() }) } },
        {
          provide: PiCompositionService,
          useValue: {
            getModuleTree: jest.fn().mockReturnValue(of({ ok: true, data: { _id: 'mod-1', name: 'K', kind: 'module', quantity: 1, children: [] } })),
            getModuleComposition: jest.fn().mockReturnValue(of({ ok: true, data: [] })),
          },
        },
        { provide: PiCategoriesService, useValue: CATEGORIES_MOCK },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(ModuleFormDialogComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  afterEach(() => TestBed.resetTestingModule());

  it('offers the live type=module category list and blocks create until one is chosen', async () => {
    const fixture = await setup({ mode: 'create' });

    const select = fixture.nativeElement.querySelector('[data-test="mod-category"]') as HTMLSelectElement;
    const labels = Array.from(select.options).map((o) => o.textContent?.trim());
    expect(labels).toEqual(['— выберите —', 'Модули']);

    const service = TestBed.inject(PiModulesService);
    fixture.componentInstance['form'].patchValue({ name: 'Новый', article: 'MOD-X' });
    await fixture.componentInstance['onSubmit']();
    expect(service.create).not.toHaveBeenCalled();

    fixture.componentInstance['form'].patchValue({ categoryId: 'cat-1' });
    await fixture.componentInstance['onSubmit']();
    expect(service.create).toHaveBeenCalledWith(expect.objectContaining({ categoryId: 'cat-1' }));
  });

  it('extracts the id from a populated categoryId ref when patching edit data (GET /modules populates it)', async () => {
    const fixture = await setup({ mode: 'edit', module: { ...SAMPLE, categoryId: { _id: 'cat-1', name: 'Модули' } } });

    expect(fixture.componentInstance['form'].controls.categoryId.value).toBe('cat-1');
  });
});
