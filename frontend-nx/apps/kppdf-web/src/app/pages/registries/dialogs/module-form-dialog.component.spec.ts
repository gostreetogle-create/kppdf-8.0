import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PiCompositionService, PiModulesService, type ProductModule } from '@kppdf/data-access';
import { PI_DIALOG_DATA, PI_DIALOG_REF, PiDialogService } from '@kppdf/ui/dialog';
import type { DialogRef } from '@kppdf/ui/dialog';
import { ModuleFormDialogComponent } from './module-form-dialog.component';

const SAMPLE: ProductModule = {
  _id: 'mod-1',
  name: 'Каркас',
  article: 'MOD-1',
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
