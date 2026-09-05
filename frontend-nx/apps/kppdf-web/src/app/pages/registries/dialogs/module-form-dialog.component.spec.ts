import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import {
  PiCompositionService,
  PiModulesService,
  PiWorkTypesService,
  type ProductModule,
} from '@kppdf/data-access';
import { PI_DIALOG_DATA, PI_DIALOG_REF, PiDialogService } from '@kppdf/ui/dialog';
import type { DialogRef } from '@kppdf/ui/dialog';
import { ModuleFormDialogComponent } from './module-form-dialog.component';

const SAMPLE: ProductModule = {
  _id: 'mod-1',
  name: 'Каркас',
  article: 'MOD-1',
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
          workTypes: { at: (index: number) => { patchValue: (value: Record<string, unknown>) => void } };
        };
      };
      addWorkType: () => void;
      onSubmit: () => Promise<void>;
    };
    component.form.controls.name.setValue('Новый модуль');
    component.form.controls.article.setValue('MOD-NEW');
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
});
